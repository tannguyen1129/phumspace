import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ContributionStatus, ContributionMediaType } from '@prisma/client';

@Injectable()
export class ContributionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createContribution(data: {
    passportId?: string;
    contributionType: any;
    status: ContributionStatus;
    title: string;
    description: string;
    languageCode?: any;
    relatedHeritageEntityId?: string;
    relatedPlaceId?: string;
    consent: any;
    submittedAt?: Date;
  }): Promise<any> {
    return this.prisma.$transaction(async (tx) => {
      const contribution = await tx.communityContribution.create({
        data: {
          passportId: data.passportId,
          contributionType: data.contributionType,
          status: data.status,
          title: data.title,
          description: data.description,
          languageCode: data.languageCode || 'vi',
          relatedHeritageEntityId: data.relatedHeritageEntityId,
          relatedPlaceId: data.relatedPlaceId,
          submittedAt: data.submittedAt,
          consent: {
            create: {
              consentVersion: '1.0.0',
              contributorOwnsRights: data.consent.contributorOwnsRights,
              allowPublicDisplay: data.consent.allowPublicDisplay ?? true,
              allowEducationalUse: data.consent.allowEducationalUse ?? true,
              allowResearchUse: data.consent.allowResearchUse ?? true,
              allowCommercialUse: data.consent.allowCommercialUse ?? false,
              allowAiProcessing: data.consent.allowAiProcessing ?? false,
              attributionPreference: data.consent.attributionPreference || 'COMMUNITY',
            },
          },
          statusHistory: {
            create: {
              fromStatus: ContributionStatus.DRAFT,
              toStatus: data.status,
              publicMessage:
                data.status === ContributionStatus.SUBMITTED
                  ? 'Gửi đóng góp vào hàng đợi kiểm duyệt'
                  : 'Tạo bản thảo đóng góp',
              actorType: 'GUEST_USER',
            },
          },
        },
        include: {
          media: true,
          consent: true,
          statusHistory: true,
          relatedHeritageEntity: {
            include: { currentVersion: { include: { names: true } } },
          },
          relatedPlace: true,
        },
      });

      return contribution;
    });
  }

  async findByPublicId(publicId: string): Promise<any | null> {
    return this.prisma.communityContribution.findUnique({
      where: { publicId },
      include: {
        media: true,
        consent: true,
        statusHistory: true,
        relatedHeritageEntity: {
          include: { currentVersion: { include: { names: true } } },
        },
        relatedPlace: true,
      },
    });
  }

  async findByPassportIdPaginated(
    passportId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: any[]; total: number }> {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.communityContribution.findMany({
        where: { passportId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          media: true,
          consent: true,
          statusHistory: true,
        },
      }),
      this.prisma.communityContribution.count({
        where: { passportId },
      }),
    ]);

    return { data, total };
  }

  async updateContribution(
    publicId: string,
    updateData: {
      title?: string;
      description?: string;
      languageCode?: any;
      relatedHeritageEntityId?: string;
      relatedPlaceId?: string;
      consent?: any;
    },
  ): Promise<any> {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.communityContribution.findUnique({
        where: { publicId },
        include: { consent: true },
      });

      if (!existing) return null;

      if (updateData.consent && existing.consent) {
        await tx.contributionConsent.update({
          where: { contributionId: existing.id },
          data: {
            allowPublicDisplay: updateData.consent.allowPublicDisplay,
            allowEducationalUse: updateData.consent.allowEducationalUse,
            allowResearchUse: updateData.consent.allowResearchUse,
            allowCommercialUse: updateData.consent.allowCommercialUse,
            allowAiProcessing: updateData.consent.allowAiProcessing,
            attributionPreference: updateData.consent.attributionPreference,
          },
        });
      }

      return tx.communityContribution.update({
        where: { publicId },
        data: {
          title: updateData.title,
          description: updateData.description,
          languageCode: updateData.languageCode,
          relatedHeritageEntityId: updateData.relatedHeritageEntityId,
          relatedPlaceId: updateData.relatedPlaceId,
        },
        include: {
          media: true,
          consent: true,
          statusHistory: true,
          relatedHeritageEntity: {
            include: { currentVersion: { include: { names: true } } },
          },
          relatedPlace: true,
        },
      });
    });
  }

  async addMedia(
    contributionId: string,
    mediaData: {
      mediaType: ContributionMediaType;
      storageKey: string;
      originalFileName: string;
      mimeType: string;
      sizeBytes: number;
      checksum?: string;
      durationSeconds?: number;
    },
  ): Promise<any> {
    return this.prisma.contributionMedia.create({
      data: {
        contributionId,
        mediaType: mediaData.mediaType,
        storageKey: mediaData.storageKey,
        originalFileName: mediaData.originalFileName,
        mimeType: mediaData.mimeType,
        sizeBytes: mediaData.sizeBytes,
        checksum: mediaData.checksum,
        durationSeconds: mediaData.durationSeconds,
      },
    });
  }

  async transitionStatus(
    publicId: string,
    fromStatus: ContributionStatus,
    toStatus: ContributionStatus,
    publicMessage?: string,
  ): Promise<any> {
    return this.prisma.$transaction(async (tx) => {
      const now = new Date();
      const updated = await tx.communityContribution.update({
        where: { publicId },
        data: {
          status: toStatus,
          submittedAt: toStatus === ContributionStatus.SUBMITTED ? now : undefined,
          withdrawnAt: toStatus === ContributionStatus.WITHDRAWN ? now : undefined,
          statusHistory: {
            create: {
              fromStatus,
              toStatus,
              publicMessage: publicMessage || `Đã chuyển trạng thái sang ${toStatus}`,
              actorType: 'GUEST_USER',
            },
          },
        },
        include: {
          media: true,
          consent: true,
          statusHistory: true,
          relatedHeritageEntity: {
            include: { currentVersion: { include: { names: true } } },
          },
          relatedPlace: true,
        },
      });

      if (toStatus === ContributionStatus.WITHDRAWN && updated.consent) {
        await tx.contributionConsent.update({
          where: { contributionId: updated.id },
          data: { withdrawnAt: now },
        });
      }

      return updated;
    });
  }
}

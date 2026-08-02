import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { ModerationRepository } from '../repositories/moderation.repository';
import { StaffUserRepository } from '../repositories/staff-user.repository';
import { ConsentGateService } from './consent-gate.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { PassportService } from '../../passport/services/passport.service';
import { ContributionStatus, SecurityEventType } from '@prisma/client';
import { AdminContributionDetailContract, AdminContributionSummaryContract } from '@phumspace/contracts';

@Injectable()
export class AdminModerationService {
  private readonly logger = new Logger(AdminModerationService.name);

  constructor(
    private readonly moderationRepo: ModerationRepository,
    private readonly staffUserRepo: StaffUserRepository,
    private readonly consentGate: ConsentGateService,
    private readonly prisma: PrismaService,
    private readonly passportService: PassportService,
  ) {}

  async getModerationQueue(params: {
    page?: number;
    limit?: number;
    status?: ContributionStatus;
    contributionType?: any;
    assignedStaffUserId?: string;
  }): Promise<{ data: AdminContributionSummaryContract[]; total: number }> {
    const { data, total } = await this.moderationRepo.findMany(params);

    const summaries: AdminContributionSummaryContract[] = data.map((item) => ({
      publicId: item.publicId,
      contributionType: item.contributionType,
      status: item.status,
      title: item.title,
      languageCode: item.languageCode,
      submittedAt: item.submittedAt ? item.submittedAt.toISOString() : undefined,
      createdAt: item.createdAt.toISOString(),
      mediaCount: item.media ? item.media.length : 0,
      assignedStaffEmail: item.reviewAssignments?.[0]?.assignedStaffUser?.email,
      version: item.version,
    }));

    return { data: summaries, total };
  }

  async getContributionDetail(publicId: string): Promise<AdminContributionDetailContract> {
    const item = await this.moderationRepo.findByPublicId(publicId);
    if (!item) {
      throw new NotFoundException({
        errorCode: 'ADMIN_CONTRIBUTION_NOT_FOUND',
        message: `Không tìm thấy đóng góp với mã publicId ${publicId}.`,
      });
    }

    return {
      publicId: item.publicId,
      contributionType: item.contributionType,
      status: item.status,
      title: item.title,
      description: item.description,
      languageCode: item.languageCode,
      submittedAt: item.submittedAt ? item.submittedAt.toISOString() : undefined,
      createdAt: item.createdAt.toISOString(),
      mediaCount: item.media ? item.media.length : 0,
      version: item.version,
      assignedStaffEmail: item.reviewAssignments?.[0]?.assignedStaffUser?.email,
      relatedHeritageEntity: item.relatedHeritageEntity
        ? { id: item.relatedHeritageEntity.id, slug: item.relatedHeritageEntity.canonicalCode, name: item.relatedHeritageEntity.canonicalCode }
        : undefined,
      relatedPlace: item.relatedPlace
        ? { id: item.relatedPlace.id, slug: item.relatedPlace.slug, name: item.relatedPlace.name }
        : undefined,
      media: item.media.map((m: any) => ({
        id: m.id,
        mediaType: m.mediaType,
        originalFileName: m.originalFileName,
        mimeType: m.mimeType,
        sizeBytes: m.sizeBytes,
      })),
      consent: item.consent
        ? {
            consentVersion: item.consent.consentVersion,
            contributorOwnsRights: item.consent.contributorOwnsRights,
            allowPublicDisplay: item.consent.allowPublicDisplay,
            allowEducationalUse: item.consent.allowEducationalUse,
            allowResearchUse: item.consent.allowResearchUse,
            allowCommercialUse: item.consent.allowCommercialUse,
            allowAiProcessing: item.consent.allowAiProcessing,
            attributionPreference: item.consent.attributionPreference,
          }
        : undefined,
      reviews: item.reviews.map((r: any) => ({
        id: r.id,
        reviewerEmail: r.reviewerStaffUser.email,
        recommendation: r.recommendation,
        internalNote: r.internalNote ?? undefined,
        publicMessage: r.publicMessage ?? undefined,
        checklistResult: r.checklistResult ?? undefined,
        reviewedAt: r.reviewedAt.toISOString(),
      })),
      statusHistory: item.statusHistory.map((h: any) => ({
        fromStatus: h.fromStatus,
        toStatus: h.toStatus,
        publicMessage: h.publicMessage ?? undefined,
        createdAt: h.createdAt.toISOString(),
      })),
    };
  }

  async assignReview(publicId: string, staffUser: any): Promise<void> {
    const contribution = await this.moderationRepo.findByPublicId(publicId);
    if (!contribution) {
      throw new NotFoundException({
        errorCode: 'ADMIN_CONTRIBUTION_NOT_FOUND',
        message: 'Không tìm thấy đóng góp.',
      });
    }

    await this.moderationRepo.assignReview(contribution.id, staffUser.id, staffUser.id);

    // Auto transition SUBMITTED -> UNDER_REVIEW if currently SUBMITTED
    if (contribution.status === ContributionStatus.SUBMITTED) {
      await this.prisma.$transaction(async (tx) => {
        await tx.communityContribution.update({
          where: { id: contribution.id },
          data: { status: ContributionStatus.UNDER_REVIEW, version: { increment: 1 } },
        });

        await tx.contributionStatusHistory.create({
          data: {
            contributionId: contribution.id,
            fromStatus: ContributionStatus.SUBMITTED,
            toStatus: ContributionStatus.UNDER_REVIEW,
            actorType: 'STAFF',
            publicMessage: 'Đóng góp đã được nhận để kiểm duyệt.',
          },
        });
      });
    }

    await this.staffUserRepo.logSecurityEvent({
      staffUserId: staffUser.id,
      eventType: SecurityEventType.ROLE_CHANGED,
      outcome: 'SUCCESS',
      metadata: { action: 'ASSIGN_REVIEW', publicId },
    });
  }

  async releaseReview(publicId: string, staffUser: any): Promise<void> {
    const contribution = await this.moderationRepo.findByPublicId(publicId);
    if (!contribution) {
      throw new NotFoundException({
        errorCode: 'ADMIN_CONTRIBUTION_NOT_FOUND',
        message: 'Không tìm thấy đóng góp.',
      });
    }

    await this.moderationRepo.releaseReview(contribution.id);
  }

  async requestInformation(
    publicId: string,
    publicMessage: string,
    version: number,
    staffUser: any,
  ): Promise<void> {
    if (!publicMessage || !publicMessage.trim()) {
      throw new BadRequestException({
        errorCode: 'ADMIN_INVALID_STATUS_TRANSITION',
        message: 'Bắt buộc phải nhập tin nhắn publicMessage hướng dẫn bổ sung thông tin.',
      });
    }

    const contribution = await this.moderationRepo.findByPublicId(publicId);
    if (!contribution) throw new NotFoundException({ errorCode: 'ADMIN_CONTRIBUTION_NOT_FOUND', message: 'Không tìm thấy đóng góp.' });

    if (version && contribution.version !== version) {
      throw new ConflictException({
        errorCode: 'ADMIN_OPTIMISTIC_LOCK_CONFLICT',
        message: 'Bài đóng góp đã được chỉnh sửa bởi nhân sự khác. Vui lòng tải lại trang.',
      });
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.communityContribution.update({
        where: { id: contribution.id },
        data: { status: ContributionStatus.NEEDS_MORE_INFORMATION, version: { increment: 1 } },
      });

      await tx.contributionStatusHistory.create({
        data: {
          contributionId: contribution.id,
          fromStatus: contribution.status,
          toStatus: ContributionStatus.NEEDS_MORE_INFORMATION,
          publicMessage,
          actorType: 'STAFF',
        },
      });
    });
  }

  async submitRecommendation(
    publicId: string,
    dto: { recommendation: string; internalNote?: string; checklistResult?: any },
    staffUser: any,
  ): Promise<void> {
    const contribution = await this.moderationRepo.findByPublicId(publicId);
    if (!contribution) throw new NotFoundException({ errorCode: 'ADMIN_CONTRIBUTION_NOT_FOUND', message: 'Không tìm thấy đóng góp.' });

    await this.prisma.contributionReview.create({
      data: {
        contributionId: contribution.id,
        reviewerStaffUserId: staffUser.id,
        recommendation: dto.recommendation,
        internalNote: dto.internalNote,
        checklistResult: dto.checklistResult,
      },
    });
  }

  async approveContribution(
    publicId: string,
    dto: { internalNote?: string; version?: number },
    staffUser: any,
  ): Promise<void> {
    const contribution = await this.moderationRepo.findByPublicId(publicId);
    if (!contribution) throw new NotFoundException({ errorCode: 'ADMIN_CONTRIBUTION_NOT_FOUND', message: 'Không tìm thấy đóng góp.' });

    if (dto.version && contribution.version !== dto.version) {
      throw new ConflictException({
        errorCode: 'ADMIN_OPTIMISTIC_LOCK_CONFLICT',
        message: 'Đã có thao tác xung đột từ nhân sự khác (Optimistic Concurrency Lock). Vui lòng làm mới trang.',
      });
    }

    // Consent Gate check
    this.consentGate.validateConsentGate(contribution.consent);

    await this.prisma.$transaction(async (tx) => {
      await tx.communityContribution.update({
        where: { id: contribution.id },
        data: { status: ContributionStatus.APPROVED, version: { increment: 1 } },
      });

      await tx.contributionStatusHistory.create({
        data: {
          contributionId: contribution.id,
          fromStatus: contribution.status,
          toStatus: ContributionStatus.APPROVED,
          publicMessage: 'Đóng góp của bạn đã được phê duyệt.',
          actorType: 'STAFF',
        },
      });

      if (dto.internalNote) {
        await tx.contributionReview.create({
          data: {
            contributionId: contribution.id,
            reviewerStaffUserId: staffUser.id,
            recommendation: 'APPROVE',
            internalNote: dto.internalNote,
          },
        });
      }
    });

    // Reward Passport points fail-safe
    if (contribution.passportId) {
      try {
        await this.passportService.recordActivity(contribution.passportId, {
          activityType: 'SCAN_MATCHED', // Rewarding cultural points
          sourceType: 'COMMUNITY_CONTRIBUTION',
          sourceId: contribution.id,
          pointsAwarded: 50,
          idempotencyKey: `contribution_${contribution.publicId}_APPROVED`,
        });
      } catch (err: any) {
        this.logger.warn(`Fail-safe Passport reward error: ${err.message}`);
      }
    }
  }

  async rejectContribution(
    publicId: string,
    dto: { reasonCode?: string; publicMessage: string; version?: number },
    staffUser: any,
  ): Promise<void> {
    if (!dto.publicMessage || !dto.publicMessage.trim()) {
      throw new BadRequestException({
        errorCode: 'ADMIN_INVALID_STATUS_TRANSITION',
        message: 'Bắt buộc nhập tin nhắn giải thích lý do từ chối (publicMessage).',
      });
    }

    const contribution = await this.moderationRepo.findByPublicId(publicId);
    if (!contribution) throw new NotFoundException({ errorCode: 'ADMIN_CONTRIBUTION_NOT_FOUND', message: 'Không tìm thấy đóng góp.' });

    if (dto.version && contribution.version !== dto.version) {
      throw new ConflictException({
        errorCode: 'ADMIN_OPTIMISTIC_LOCK_CONFLICT',
        message: 'Đã có thao tác xung đột từ nhân sự khác (Optimistic Concurrency Lock).',
      });
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.communityContribution.update({
        where: { id: contribution.id },
        data: { status: ContributionStatus.REJECTED, version: { increment: 1 } },
      });

      await tx.contributionStatusHistory.create({
        data: {
          contributionId: contribution.id,
          fromStatus: contribution.status,
          toStatus: ContributionStatus.REJECTED,
          reasonCode: dto.reasonCode,
          publicMessage: dto.publicMessage,
          actorType: 'STAFF',
        },
      });
    });
  }

  async getPrivateMediaFile(publicId: string, mediaId: string): Promise<{ media: any; storageKey: string }> {
    const media = await this.moderationRepo.findMediaById(publicId, mediaId);
    if (!media) {
      throw new NotFoundException({
        errorCode: 'ADMIN_MEDIA_ACCESS_DENIED',
        message: 'Không tìm thấy tệp phương tiện private đính kèm.',
      });
    }

    return { media, storageKey: media.storageKey };
  }
}

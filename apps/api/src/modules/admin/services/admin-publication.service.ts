import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ConsentGateService } from './consent-gate.service';
import { ModerationRepository } from '../repositories/moderation.repository';
import {
  ContributionStatus,
  PublicationStatus,
  SourceType,
  SupportType,
  VerificationOutcome,
  PublicationEventType,
  LanguageCode,
  NameType,
  EntityType,
} from '@prisma/client';
import { AdminPublicationPlanContract } from '@phumspace/contracts';

@Injectable()
export class AdminPublicationService {
  private readonly logger = new Logger(AdminPublicationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly consentGate: ConsentGateService,
    private readonly moderationRepo: ModerationRepository,
  ) {}

  async publishContributionToPhumData(
    publicId: string,
    plan: AdminPublicationPlanContract,
    staffUser: any,
  ): Promise<{ entityId: string; versionId: string; canonicalCode: string }> {
    const contribution = await this.moderationRepo.findByPublicId(publicId);
    if (!contribution) {
      throw new NotFoundException({
        errorCode: 'ADMIN_CONTRIBUTION_NOT_FOUND',
        message: 'Không tìm thấy bài đóng góp.',
      });
    }

    if (contribution.status !== ContributionStatus.APPROVED) {
      throw new BadRequestException({
        errorCode: 'ADMIN_APPROVAL_REQUIRED',
        message: 'Bài đóng góp phải ở trạng thái APPROVED trước khi thực hiện Xuất bản vào PhumData Core.',
      });
    }

    // Consent Gate
    this.consentGate.validateConsentGate(contribution.consent);

    let resultEntityId = '';
    let resultVersionId = '';
    let resultCanonicalCode = plan.canonicalCode;

    await this.prisma.$transaction(async (tx) => {
      let entityVersion;

      if (plan.publicationTarget === 'NEW_ENTITY') {
        // 1. Create new HeritageEntity identity
        const entity = await tx.heritageEntity.create({
          data: {
            canonicalCode: plan.canonicalCode,
            type: (plan.entityType as EntityType) || EntityType.ARCHITECTURE,
          },
        });

        resultEntityId = entity.id;

        // 2. Create HeritageEntityVersion v1 (PUBLISHED)
        entityVersion = await tx.heritageEntityVersion.create({
          data: {
            entityId: entity.id,
            versionNo: 1,
            publicationStatus: PublicationStatus.PUBLISHED,
            summary: plan.summary,
            historicalContent: plan.historicalContent,
            culturalMeaning: plan.culturalMeaning,
          },
        });

        resultVersionId = entityVersion.id;

        // 3. Create Names
        await tx.heritageEntityName.create({
          data: {
            versionId: entityVersion.id,
            language: LanguageCode.vi,
            nameType: NameType.PREFERRED,
            originalValue: plan.preferredViName,
            normalizedValue: plan.preferredViName.toLowerCase(),
          },
        });

        if (plan.preferredKmName) {
          await tx.heritageEntityName.create({
            data: {
              versionId: entityVersion.id,
              language: LanguageCode.km,
              nameType: NameType.PREFERRED,
              originalValue: plan.preferredKmName,
              normalizedValue: plan.preferredKmName.toLowerCase(),
            },
          });
        }

        // 4. Link Category if provided
        if (plan.categoryId) {
          await tx.heritageEntityCategory.create({
            data: {
              entityId: entity.id,
              categoryId: plan.categoryId,
            },
          });
        }

        // 5. Link Place if provided
        if (plan.placeId) {
          await tx.heritageEntityPlace.create({
            data: {
              entityId: entity.id,
              placeId: plan.placeId,
            },
          });
        }

        // 6. Set currentVersionId
        await tx.heritageEntity.update({
          where: { id: entity.id },
          data: { currentVersionId: entityVersion.id },
        });
      } else {
        // UPDATE EXISTING ENTITY — NEVER edit existing PUBLISHED version!
        if (!plan.targetEntityId) {
          throw new BadRequestException({
            errorCode: 'ADMIN_PUBLICATION_PLAN_INVALID',
            message: 'Thiếu targetEntityId cho phương án cập nhật di sản hiện có.',
          });
        }

        const existingEntity = await tx.heritageEntity.findUnique({
          where: { id: plan.targetEntityId },
          include: { versions: { orderBy: { versionNo: 'desc' }, take: 1 } },
        });

        if (!existingEntity) {
          throw new NotFoundException({
            errorCode: 'ADMIN_PUBLICATION_PLAN_INVALID',
            message: 'Không tìm thấy thực thể di sản mục tiêu để cập nhật.',
          });
        }

        resultEntityId = existingEntity.id;
        resultCanonicalCode = existingEntity.canonicalCode;

        const maxVersionNo = existingEntity.versions[0]?.versionNo || 0;
        const newVersionNo = maxVersionNo + 1;

        // Create NEW version (status = PUBLISHED)
        entityVersion = await tx.heritageEntityVersion.create({
          data: {
            entityId: existingEntity.id,
            versionNo: newVersionNo,
            publicationStatus: PublicationStatus.PUBLISHED,
            summary: plan.summary,
            historicalContent: plan.historicalContent,
            culturalMeaning: plan.culturalMeaning,
          },
        });

        resultVersionId = entityVersion.id;

        // Create Names for new version
        await tx.heritageEntityName.create({
          data: {
            versionId: entityVersion.id,
            language: LanguageCode.vi,
            nameType: NameType.PREFERRED,
            originalValue: plan.preferredViName,
            normalizedValue: plan.preferredViName.toLowerCase(),
          },
        });

        // Atomically update entity currentVersionId
        await tx.heritageEntity.update({
          where: { id: existingEntity.id },
          data: { currentVersionId: entityVersion.id },
        });
      }

      // 7. Create SourceResource representing approved community contribution
      const source = await tx.sourceResource.create({
        data: {
          title: `Tư liệu Đóng góp Cộng đồng: ${contribution.title}`,
          sourceType: SourceType.WEBSITE,
          locator: `Contribution:${contribution.publicId}`,
          rights: contribution.consent?.attributionPreference || 'COMMUNITY',
        },
      });

      // 8. Create EvidenceAssertion
      await tx.evidenceAssertion.create({
        data: {
          versionId: entityVersion.id,
          sourceId: source.id,
          claimText: contribution.description,
          supportType: SupportType.SUPPORTS,
        },
      });

      // 9. Create VerificationRecord
      await tx.verificationRecord.create({
        data: {
          versionId: entityVersion.id,
          reviewerName: staffUser.displayName || staffUser.email,
          scope: 'COMMUNITY_CONTRIBUTION_REVIEW',
          method: 'EXPERT_AND_SOURCE_VERIFICATION',
          outcome: (plan.verificationOutcome as VerificationOutcome) || VerificationOutcome.SOURCE_VERIFIED,
        },
      });

      // 10. Create PublicationEvent
      await tx.publicationEvent.create({
        data: {
          entityId: resultEntityId,
          versionId: entityVersion.id,
          publisherName: staffUser.displayName || staffUser.email,
          eventType: PublicationEventType.PUBLISH,
        },
      });

      // 11. Update CommunityContribution -> PUBLISHED
      await tx.communityContribution.update({
        where: { id: contribution.id },
        data: { status: ContributionStatus.PUBLISHED, version: { increment: 1 } },
      });

      await tx.contributionStatusHistory.create({
        data: {
          contributionId: contribution.id,
          fromStatus: contribution.status,
          toStatus: ContributionStatus.PUBLISHED,
          publicMessage: `Nội dung đã được xuất bản vào PhumData Core với mã di sản ${resultCanonicalCode}.`,
          actorType: 'STAFF',
        },
      });
    });

    return {
      entityId: resultEntityId,
      versionId: resultVersionId,
      canonicalCode: resultCanonicalCode,
    };
  }
}

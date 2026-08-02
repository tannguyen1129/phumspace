import {
  ContributionSummaryDto,
  ContributionDetailDto,
  ContributionMediaDto,
  ContributionConsentDto,
  ContributionStatusHistoryDto,
} from '../dto/response/contribution-response.dto';

export class ContributionMapper {
  static toSummaryDto(entity: any): ContributionSummaryDto {
    return {
      publicId: entity.publicId,
      contributionType: entity.contributionType,
      status: entity.status,
      title: entity.title,
      languageCode: entity.languageCode,
      submittedAt: entity.submittedAt ? entity.submittedAt.toISOString() : undefined,
      createdAt: entity.createdAt.toISOString(),
      mediaCount: entity.media ? entity.media.length : 0,
    };
  }

  static toDetailDto(entity: any): ContributionDetailDto {
    const summary = this.toSummaryDto(entity);

    const media: ContributionMediaDto[] = (entity.media || []).map((m: any) => ({
      id: m.id,
      mediaType: m.mediaType,
      originalFileName: m.originalFileName,
      mimeType: m.mimeType,
      sizeBytes: m.sizeBytes,
      durationSeconds: m.durationSeconds ?? undefined,
    }));

    let consent: ContributionConsentDto | undefined;
    if (entity.consent) {
      consent = {
        consentVersion: entity.consent.consentVersion,
        contributorOwnsRights: entity.consent.contributorOwnsRights,
        allowPublicDisplay: entity.consent.allowPublicDisplay,
        allowEducationalUse: entity.consent.allowEducationalUse,
        allowResearchUse: entity.consent.allowResearchUse,
        allowCommercialUse: entity.consent.allowCommercialUse,
        allowAiProcessing: entity.consent.allowAiProcessing,
        attributionPreference: entity.consent.attributionPreference,
        consentedAt: entity.consent.consentedAt.toISOString(),
      };
    }

    const statusHistory: ContributionStatusHistoryDto[] = (entity.statusHistory || [])
      .sort((a: any, b: any) => a.createdAt.getTime() - b.createdAt.getTime())
      .map((h: any) => ({
        fromStatus: h.fromStatus,
        toStatus: h.toStatus,
        publicMessage: h.publicMessage ?? undefined,
        createdAt: h.createdAt.toISOString(),
      }));

    let relatedHeritageEntity: { id: string; slug: string; name: string } | undefined;
    if (entity.relatedHeritageEntity) {
      const prefName =
        entity.relatedHeritageEntity.currentVersion?.names?.find(
          (n: any) => n.nameType === 'PREFERRED' && n.language === 'vi',
        )?.originalValue || entity.relatedHeritageEntity.canonicalCode;

      relatedHeritageEntity = {
        id: entity.relatedHeritageEntity.id,
        slug: entity.relatedHeritageEntity.canonicalCode,
        name: prefName,
      };
    }

    let relatedPlace: { id: string; slug: string; name: string } | undefined;
    if (entity.relatedPlace) {
      relatedPlace = {
        id: entity.relatedPlace.id,
        slug: entity.relatedPlace.slug,
        name: entity.relatedPlace.name,
      };
    }

    return {
      ...summary,
      description: entity.description,
      relatedHeritageEntity,
      relatedPlace,
      media,
      consent,
      statusHistory,
    };
  }
}

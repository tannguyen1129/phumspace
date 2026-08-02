import {
  KhmerTermSummaryContract,
  KhmerTermDetailContract,
  HandbookTopicContract,
  HandbookCollectionSummaryContract,
  HandbookCollectionDetailContract,
} from '@phumspace/contracts';

export class HandbookMapper {
  static toTermSummaryDto(term: any): KhmerTermSummaryContract {
    const version = term.currentVersion;
    const pubAt = version?.publishedAt
      ? typeof version.publishedAt === 'string'
        ? version.publishedAt
        : version.publishedAt.toISOString()
      : term.createdAt
        ? typeof term.createdAt === 'string'
          ? term.createdAt
          : term.createdAt.toISOString()
        : undefined;

    return {
      id: term.id,
      slug: term.slug,
      scriptText: version?.scriptText || '',
      transliteration: version?.transliteration || undefined,
      shortDefinitionVi: version?.shortDefinitionVi || '',
      shortDefinitionEn: version?.shortDefinitionEn || undefined,
      partOfSpeech: version?.partOfSpeech || undefined,
      hasAudio: Boolean(version?.pronunciations && version.pronunciations.length > 0),
      publishedAt: pubAt,
    };
  }

  static toTermDetailDto(term: any): KhmerTermDetailContract {
    const summary = this.toTermSummaryDto(term);
    const version = term.currentVersion;

    return {
      ...summary,
      usageRegister: version?.usageRegister || undefined,
      culturalNote: version?.culturalNote || undefined,
      meanings: (version?.meanings || []).map((m: any) => ({
        id: m.id,
        languageCode: m.languageCode,
        meaningText: m.meaningText,
        sourceTitle: m.sourceResource?.title || undefined,
      })),
      examples: (version?.examples || []).map((ex: any) => ({
        id: ex.id,
        khmerText: ex.khmerText,
        transliteration: ex.transliteration || undefined,
        translationVi: ex.translationVi || undefined,
        translationEn: ex.translationEn || undefined,
        contextNote: ex.contextNote || undefined,
      })),
      pronunciations: (version?.pronunciations || []).map((p: any) => ({
        id: p.id,
        audioUrl: `/api/v1/handbook/pronunciations/${p.id}/audio`,
        speakerAttribution: p.speakerAttribution || undefined,
        speakerRegion: p.speakerRegion || undefined,
        pronunciationVariant: p.pronunciationVariant || undefined,
        durationSeconds: p.durationSeconds || undefined,
        verificationStatus: p.verificationStatus,
      })),
      topics: (term.topics || []).map((t: any) => ({
        slug: t.topic.slug,
        titleVi: t.topic.titleVi,
      })),
      collections: (term.collections || []).map((c: any) => ({
        slug: c.collection.slug,
        title: c.collection.title,
      })),
      relatedHeritageEntity: term.heritageEntity
        ? { slug: term.heritageEntity.canonicalCode, canonicalCode: term.heritageEntity.canonicalCode }
        : undefined,
      relatedPlace: term.place
        ? { slug: term.place.slug, name: term.place.name }
        : undefined,
    };
  }

  static toTopicContract(topic: any): HandbookTopicContract {
    return {
      id: topic.id,
      slug: topic.slug,
      titleVi: topic.titleVi,
      titleKm: topic.titleKm || undefined,
      description: topic.description || undefined,
      termCount: topic._count?.terms || 0,
    };
  }

  static toCollectionSummaryContract(col: any): HandbookCollectionSummaryContract {
    return {
      id: col.id,
      slug: col.slug,
      title: col.title,
      description: col.description || undefined,
      difficulty: col.difficulty || undefined,
      itemCount: col._count?.items || 0,
    };
  }

  static toCollectionDetailContract(col: any): HandbookCollectionDetailContract {
    const summary = this.toCollectionSummaryContract(col);
    const terms = (col.items || []).map((item: any) => this.toTermSummaryDto(item.term));

    return {
      ...summary,
      terms,
    };
  }
}

export interface KhmerPronunciationContract {
  id: string;
  audioUrl?: string;
  speakerAttribution?: string;
  speakerRegion?: string;
  pronunciationVariant?: string;
  durationSeconds?: number;
  verificationStatus: string;
}

export interface KhmerTermMeaningContract {
  id: string;
  languageCode: string;
  meaningText: string;
  sourceTitle?: string;
}

export interface KhmerTermExampleContract {
  id: string;
  khmerText: string;
  transliteration?: string;
  translationVi?: string;
  translationEn?: string;
  contextNote?: string;
}

export interface KhmerTermSummaryContract {
  id: string;
  slug: string;
  scriptText: string;
  transliteration?: string;
  shortDefinitionVi: string;
  shortDefinitionEn?: string;
  partOfSpeech?: string;
  hasAudio: boolean;
  publishedAt?: string;
}

export interface KhmerTermDetailContract extends KhmerTermSummaryContract {
  usageRegister?: string;
  culturalNote?: string;
  meanings: KhmerTermMeaningContract[];
  examples: KhmerTermExampleContract[];
  pronunciations: KhmerPronunciationContract[];
  topics: { slug: string; titleVi: string }[];
  collections: { slug: string; title: string }[];
  relatedHeritageEntity?: { slug: string; canonicalCode: string };
  relatedPlace?: { slug: string; name: string };
}

export interface HandbookTopicContract {
  id: string;
  slug: string;
  titleVi: string;
  titleKm?: string;
  description?: string;
  termCount: number;
}

export interface HandbookCollectionSummaryContract {
  id: string;
  slug: string;
  title: string;
  description?: string;
  difficulty?: string;
  itemCount: number;
}

export interface HandbookCollectionDetailContract extends HandbookCollectionSummaryContract {
  terms: KhmerTermSummaryContract[];
}

export interface HandbookTermProgressContract {
  termId: string;
  status: 'NEW' | 'LEARNING' | 'LEARNED';
  lastReviewedAt: string;
  reviewCount: number;
}

export interface HandbookCollectionProgressContract {
  collectionId: string;
  learnedTermCount: number;
  totalTermCount: number;
  isCompleted: boolean;
  startedAt: string;
  completedAt?: string;
}

export interface UpdateTermProgressRequestContract {
  status: 'LEARNING' | 'LEARNED';
}

export interface HandbookProgressSummaryContract {
  totalLearnedTerms: number;
  totalLearningTerms: number;
  completedCollectionsCount: number;
  recentTerms: HandbookTermProgressContract[];
}

export interface CompleteCollectionResponseContract {
  status: string;
  message: string;
  pointsAwarded: number;
}

export interface HandbookErrorContract {
  errorCode:
    | 'HANDBOOK_TERM_NOT_FOUND'
    | 'HANDBOOK_TOPIC_NOT_FOUND'
    | 'HANDBOOK_COLLECTION_NOT_FOUND'
    | 'HANDBOOK_AUDIO_NOT_FOUND'
    | 'HANDBOOK_AUDIO_ACCESS_DENIED'
    | 'HANDBOOK_INVALID_SEARCH_QUERY'
    | 'HANDBOOK_NO_PUBLISHED_CONTENT'
    | 'HANDBOOK_PASSPORT_SESSION_REQUIRED'
    | 'HANDBOOK_TERM_NOT_PUBLISHED'
    | 'HANDBOOK_COLLECTION_NOT_PUBLISHED'
    | 'HANDBOOK_INVALID_PROGRESS_STATUS'
    | 'HANDBOOK_COLLECTION_NOT_COMPLETE'
    | 'HANDBOOK_PROGRESS_UPDATE_FAILED';
  message: string;
  timestamp: string;
}

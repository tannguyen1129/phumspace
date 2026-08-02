export interface ContributionMediaContract {
  id: string;
  mediaType: 'IMAGE' | 'AUDIO';
  originalFileName: string;
  mimeType: string;
  sizeBytes: number;
  durationSeconds?: number;
}

export interface ContributionConsentContract {
  consentVersion: string;
  contributorOwnsRights: boolean;
  allowPublicDisplay: boolean;
  allowEducationalUse: boolean;
  allowResearchUse: boolean;
  allowCommercialUse: boolean;
  allowAiProcessing: boolean;
  attributionPreference: string;
  consentedAt: string;
}

export interface ContributionStatusHistoryContract {
  fromStatus: string;
  toStatus: string;
  publicMessage?: string;
  createdAt: string;
}

export interface ContributionSummaryContract {
  publicId: string;
  contributionType: string;
  status: string;
  title: string;
  languageCode: string;
  submittedAt?: string;
  createdAt: string;
  mediaCount: number;
}

export interface ContributionDetailContract extends ContributionSummaryContract {
  description: string;
  relatedHeritageEntity?: {
    id: string;
    slug: string;
    name: string;
  };
  relatedPlace?: {
    id: string;
    slug: string;
    name: string;
  };
  media: ContributionMediaContract[];
  consent?: ContributionConsentContract;
  statusHistory: ContributionStatusHistoryContract[];
}

export interface CreateContributionRequestContract {
  contributionType: string;
  title: string;
  description: string;
  languageCode?: string;
  relatedHeritageEntityId?: string;
  relatedPlaceId?: string;
  consent: {
    contributorOwnsRights: boolean;
    allowPublicDisplay?: boolean;
    allowEducationalUse?: boolean;
    allowResearchUse?: boolean;
    allowCommercialUse?: boolean;
    allowAiProcessing?: boolean;
    attributionPreference?: string;
  };
  submitImmediately?: boolean;
}

export interface ContributionErrorContract {
  errorCode:
    | 'CONTRIBUTION_NOT_FOUND'
    | 'CONTRIBUTION_SESSION_REQUIRED'
    | 'CONTRIBUTION_FORBIDDEN'
    | 'CONTRIBUTION_ALREADY_SUBMITTED'
    | 'CONTRIBUTION_NOT_EDITABLE'
    | 'CONTRIBUTION_INVALID_STATUS_TRANSITION'
    | 'CONTRIBUTION_CONSENT_REQUIRED'
    | 'CONTRIBUTION_FILE_TOO_LARGE'
    | 'CONTRIBUTION_UNSUPPORTED_MEDIA_TYPE'
    | 'CONTRIBUTION_MEDIA_INVALID'
    | 'CONTRIBUTION_WITHDRAW_NOT_ALLOWED';
  message: string;
  timestamp: string;
}

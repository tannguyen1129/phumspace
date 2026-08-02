export interface AdminContributionSummaryContract {
  publicId: string;
  contributionType: string;
  status: string;
  title: string;
  languageCode: string;
  submittedAt?: string;
  createdAt: string;
  mediaCount: number;
  assignedStaffEmail?: string;
  version: number;
}

export interface AdminReviewChecklistContract {
  culturalScope: boolean;
  verifiability: boolean;
  sourceValidity: boolean;
  contributorRightsConfirmed: boolean;
  publicDisplayConsent: boolean;
  educationalConsent: boolean;
  aiConsent: boolean;
  privacyPass: boolean;
  culturalSafetyPass: boolean;
  expertConsultationNeeded: boolean;
}

export interface AdminContributionReviewContract {
  id: string;
  reviewerEmail: string;
  recommendation: string;
  internalNote?: string;
  publicMessage?: string;
  checklistResult?: AdminReviewChecklistContract;
  reviewedAt: string;
}

export interface AdminContributionDetailContract extends AdminContributionSummaryContract {
  description: string;
  relatedHeritageEntity?: { id: string; slug: string; name: string };
  relatedPlace?: { id: string; slug: string; name: string };
  media: { id: string; mediaType: 'IMAGE' | 'AUDIO'; originalFileName: string; mimeType: string; sizeBytes: number }[];
  consent?: {
    consentVersion: string;
    contributorOwnsRights: boolean;
    allowPublicDisplay: boolean;
    allowEducationalUse: boolean;
    allowResearchUse: boolean;
    allowCommercialUse: boolean;
    allowAiProcessing: boolean;
    attributionPreference: string;
  };
  reviews: AdminContributionReviewContract[];
  statusHistory: { fromStatus: string; toStatus: string; publicMessage?: string; createdAt: string }[];
}

export interface AdminPublicationPlanContract {
  publicationTarget: 'NEW_ENTITY' | 'UPDATE_ENTITY';
  targetEntityId?: string;
  canonicalCode: string;
  entityType: string;
  preferredViName: string;
  preferredKmName?: string;
  summary: string;
  culturalMeaning?: string;
  historicalContent?: string;
  categoryId?: string;
  placeId?: string;
  verificationOutcome: 'COMMUNITY_CONFIRMED' | 'SOURCE_VERIFIED' | 'EXPERT_REVIEWED';
  selectedMediaIds: string[];
}

export interface AdminModerationErrorContract {
  errorCode:
    | 'ADMIN_CONTRIBUTION_NOT_FOUND'
    | 'ADMIN_CONTRIBUTION_ALREADY_ASSIGNED'
    | 'ADMIN_CONTRIBUTION_NOT_ASSIGNED'
    | 'ADMIN_CONTRIBUTION_ASSIGNED_TO_OTHER'
    | 'ADMIN_INVALID_STATUS_TRANSITION'
    | 'ADMIN_REVIEW_CHECKLIST_INCOMPLETE'
    | 'ADMIN_CONSENT_NOT_SUFFICIENT'
    | 'ADMIN_EVIDENCE_REQUIRED'
    | 'ADMIN_APPROVAL_REQUIRED'
    | 'ADMIN_PUBLICATION_PLAN_INVALID'
    | 'ADMIN_PUBLICATION_CONFLICT'
    | 'ADMIN_MEDIA_ACCESS_DENIED'
    | 'ADMIN_OPTIMISTIC_LOCK_CONFLICT'
    | 'ADMIN_ROLE_REQUIRED';
  message: string;
  timestamp: string;
}

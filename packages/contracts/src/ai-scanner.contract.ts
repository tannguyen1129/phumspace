export interface ScanSourceCitationContract {
  id: string;
  title: string;
  creator?: string;
  locator?: string;
}

export interface ScanMatchedEntityContract {
  id: string;
  slug: string;
  canonicalCode: string;
  type: string;
  preferredViName: string;
  preferredKmName?: string;
  summary: string;
  culturalMeaning?: string;
  categories: string[];
  places: string[];
}

export interface ScanResponseContract {
  scanId: string;
  status: 'SUCCESS' | 'FAILED';
  decision: 'MATCH' | 'SUGGEST' | 'UNKNOWN' | 'HUMAN_REVIEW';
  confidenceBand: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
  observationSummary: {
    objectTypes: string[];
    visibleFeatures: string[];
    imageQuality: string;
  };
  matchedEntity?: ScanMatchedEntityContract;
  candidates?: ScanMatchedEntityContract[];
  verificationLabel?: string;
  sources: ScanSourceCitationContract[];
  warnings: string[];
  createdAt: string;
}

export interface ScanErrorContract {
  errorCode:
    | 'INVALID_IMAGE'
    | 'IMAGE_TOO_LARGE'
    | 'UNSUPPORTED_IMAGE_TYPE'
    | 'AI_PROVIDER_UNAVAILABLE'
    | 'AI_RESPONSE_INVALID'
    | 'NO_PUBLISHED_CANDIDATES'
    | 'SCAN_RATE_LIMITED';
  message: string;
  timestamp: string;
}

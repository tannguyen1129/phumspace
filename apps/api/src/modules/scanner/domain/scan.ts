import type {
  ModelSynthesisOutput,
  ScanDecisionKind,
  ScanRequestStatus,
} from "@phumspace/contracts";

export interface ScanRequest {
  id: string;
  userId: string;
  mediaKey: string;
  mimeType: string;
  placeId: string | null;
  status: ScanRequestStatus;
  errorMessage: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ScanResultRecord {
  id: string;
  scanRequestId: string;
  decision: ScanDecisionKind;
  confidence: number;
  entityId: string | null;
  alternativeEntityIds: string[];
  synthesis: ModelSynthesisOutput;
  requiresHumanReview: boolean;
  citationCoverageComplete: boolean;
  createdAt: Date;
}

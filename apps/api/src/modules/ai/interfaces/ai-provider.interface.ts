export interface VisualObservationResult {
  objectTypes: string[];
  visibleFeatures: string[];
  colors: string[];
  shapes: string[];
  architecturalElements: string[];
  possibleSymbols: string[];
  visibleText?: string;
  imageQuality: 'HIGH' | 'MEDIUM' | 'LOW';
  ambiguityFlags: string[];
}

export interface PhumDataCandidateBundle {
  entityId: string;
  slug: string;
  canonicalCode: string;
  type: string;
  preferredViName: string;
  preferredKmName?: string;
  summary: string;
  culturalMeaning?: string;
  categories: string[];
  places: string[];
  sources: {
    id: string;
    title: string;
    creator?: string;
    locator?: string;
  }[];
}

export interface GroundedSynthesisResult {
  selectedCandidateId: string | null;
  alternativeCandidateIds: string[];
  explanationGrounded: string;
  observedFeatureAgreement: string[];
  unsupportedClaimsAvoided: boolean;
}

export interface AiProvider {
  analyzeImageObservation(params: {
    imageBuffer: Buffer;
    mimeType: string;
  }): Promise<VisualObservationResult>;

  synthesizeGroundedAnalysis(params: {
    observation: VisualObservationResult;
    candidates: PhumDataCandidateBundle[];
  }): Promise<GroundedSynthesisResult>;
}

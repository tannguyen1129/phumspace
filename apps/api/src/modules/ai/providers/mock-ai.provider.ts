import { Injectable } from '@nestjs/common';
import {
  AiProvider,
  VisualObservationResult,
  PhumDataCandidateBundle,
  GroundedSynthesisResult,
} from '../interfaces/ai-provider.interface';

@Injectable()
export class MockAiProvider implements AiProvider {
  public mockObservation: VisualObservationResult = {
    objectTypes: ['temple', 'statue', 'roof_spire'],
    visibleFeatures: ['multi-tiered roof', 'naga balustrade', 'golden spire'],
    colors: ['gold', 'red', 'terracotta'],
    shapes: ['curved spire', 'rectangular base'],
    architecturalElements: ['khmer samneang roof', 'kbach ornamentation'],
    possibleSymbols: ['naga', 'garuda'],
    visibleText: 'Wat Kompong Chray',
    imageQuality: 'HIGH',
    ambiguityFlags: [],
  };

  public mockSynthesisResult: GroundedSynthesisResult = {
    selectedCandidateId: null,
    alternativeCandidateIds: [],
    explanationGrounded: 'Chưa có candidate phù hợp.',
    observedFeatureAgreement: [],
    unsupportedClaimsAvoided: true,
  };

  async analyzeImageObservation(): Promise<VisualObservationResult> {
    return { ...this.mockObservation };
  }

  async synthesizeGroundedAnalysis(params: {
    observation: VisualObservationResult;
    candidates: PhumDataCandidateBundle[];
  }): Promise<GroundedSynthesisResult> {
    if (params.candidates.length > 0 && this.mockSynthesisResult.selectedCandidateId === null) {
      return {
        selectedCandidateId: params.candidates[0].entityId,
        alternativeCandidateIds: params.candidates.slice(1).map((c) => c.entityId),
        explanationGrounded: `Đặc điểm hình ảnh khớp với di sản ${params.candidates[0].preferredViName}.`,
        observedFeatureAgreement: ['khmer samneang roof', 'naga balustrade'],
        unsupportedClaimsAvoided: true,
      };
    }
    return { ...this.mockSynthesisResult };
  }
}

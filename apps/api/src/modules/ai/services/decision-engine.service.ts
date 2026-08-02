import { Injectable } from '@nestjs/common';
import {
  VisualObservationResult,
  PhumDataCandidateBundle,
  GroundedSynthesisResult,
} from '../interfaces/ai-provider.interface';

export interface DecisionEvaluationOutcome {
  decision: 'MATCH' | 'SUGGEST' | 'UNKNOWN' | 'HUMAN_REVIEW';
  confidenceBand: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
  matchedEntity?: PhumDataCandidateBundle;
  candidates?: PhumDataCandidateBundle[];
  warnings: string[];
}

@Injectable()
export class DecisionEngineService {
  evaluateDecision(params: {
    observation: VisualObservationResult;
    candidates: PhumDataCandidateBundle[];
    synthesis: GroundedSynthesisResult;
  }): DecisionEvaluationOutcome {
    const { observation, candidates, synthesis } = params;
    const warnings: string[] = [];

    if (observation.imageQuality === 'LOW') {
      warnings.push('Chất lượng hình ảnh thấp hoặc mờ nhòe.');
    }

    if (observation.ambiguityFlags.length > 0) {
      warnings.push(`Cảnh báo hình ảnh: ${observation.ambiguityFlags.join(', ')}`);
    }

    // 1. Case UNKNOWN: No candidates retrieved or image quality too low
    if (candidates.length === 0 || !synthesis.selectedCandidateId) {
      return {
        decision: 'UNKNOWN',
        confidenceBand: 'NONE',
        warnings: [...warnings, 'Không tìm thấy dữ liệu di sản đã công bố phù hợp với hình ảnh.'],
      };
    }

    const primaryCandidate = candidates.find((c) => c.entityId === synthesis.selectedCandidateId);
    if (!primaryCandidate) {
      return {
        decision: 'UNKNOWN',
        confidenceBand: 'NONE',
        warnings: [...warnings, 'Thực thể di sản được gợi ý không tồn tại trong PhumData PUBLISHED.'],
      };
    }

    // 2. Case HUMAN_REVIEW: Ambiguous flags or multiple conflicting interpretations
    if (observation.ambiguityFlags.includes('conflicting_sources') || observation.ambiguityFlags.includes('sensitive_content')) {
      return {
        decision: 'HUMAN_REVIEW',
        confidenceBand: 'LOW',
        matchedEntity: primaryCandidate,
        candidates: candidates.slice(0, 3),
        warnings: [...warnings, 'Hình ảnh cần sự kiểm chứng của chuyên gia văn hóa.'],
      };
    }

    // 3. Case MATCH: Strong evidence agreement (>= 2 features), HIGH/MEDIUM quality, clear top candidate
    if (
      synthesis.observedFeatureAgreement.length >= 2 &&
      observation.imageQuality !== 'LOW' &&
      candidates.length === 1
    ) {
      return {
        decision: 'MATCH',
        confidenceBand: 'HIGH',
        matchedEntity: primaryCandidate,
        warnings,
      };
    }

    // 4. Case SUGGEST: Multiple candidates (2-3) or moderate evidence agreement
    const suggestedCandidates = candidates.slice(0, 3);
    return {
      decision: 'SUGGEST',
      confidenceBand: 'MEDIUM',
      matchedEntity: primaryCandidate,
      candidates: suggestedCandidates,
      warnings: [...warnings, 'Tìm thấy một số di sản có đặc điểm tương đồng. Vui lòng đối chiếu thêm.'],
    };
  }
}

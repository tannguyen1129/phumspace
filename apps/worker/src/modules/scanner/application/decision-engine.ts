import type {
  ModelSynthesisOutput,
  ScanDecision,
  ScanDecisionKind,
} from "@phumspace/contracts";
import type { ScannerThresholds } from "@phumspace/config";
import type { RetrievalCandidate } from "../infrastructure/retrieval.repository";

export interface DecisionInput {
  topCandidate: RetrievalCandidate | null;
  synthesis: ModelSynthesisOutput | null;
  thresholds: ScannerThresholds;
  geminiAvailable: boolean;
}

const FALLBACK_NOTE =
  "Dich vu AI hien khong kha dung hoac khong tim thay ung vien phu hop trong PhumData — can nguoi kiem duyet xem xet.";

/**
 * Decide (buoc cuoi pipeline, AI_Specification). Pure function co chu y — khong goi DB/Gemini —
 * de co the unit test day du logic phan nguong ma khong can hạ tang that.
 *
 * Nguyen tac: model (synthesis.decisionHint) CHI la goi y; quyet dinh cuoi cung luon dua tren
 * final_score = diem tuong dong truy xuat (RetrievalCandidate.score), co giam tru neu model
 * chon primaryCandidateId khac voi ung vien co diem cao nhat (bat dong tin hieu).
 */
export function decide(input: DecisionInput): ScanDecision {
  if (!input.geminiAvailable || !input.synthesis || !input.topCandidate) {
    return buildFallback(input.synthesis);
  }

  const { synthesis, topCandidate, thresholds } = input;

  if (synthesis.decisionHint === "NO_MATCH") {
    return {
      decision: "UNKNOWN",
      confidence: 0,
      entityId: null,
      alternativeEntityIds: [],
      synthesis,
      requiresHumanReview: true,
      citationCoverageComplete: synthesis.citationIds.length > 0,
    };
  }

  const agreesWithTopCandidate =
    synthesis.primaryCandidateId === topCandidate.entityId;
  // Bat dong giua retrieval va model la tin hieu rui ro — giam manh diem thay vi tin tuyet doi model.
  const DISAGREEMENT_PENALTY = 0.5;
  const finalScore = agreesWithTopCandidate
    ? topCandidate.score
    : topCandidate.score * DISAGREEMENT_PENALTY;
  const citationCoverageComplete = synthesis.citationIds.length > 0;

  let decision: ScanDecisionKind;
  if (
    finalScore >= thresholds.matchThreshold &&
    citationCoverageComplete &&
    agreesWithTopCandidate
  ) {
    decision = "MATCH";
  } else if (finalScore >= thresholds.suggestThreshold) {
    decision = "SUGGEST";
  } else {
    decision = "UNKNOWN";
  }

  return {
    decision,
    confidence: finalScore,
    entityId: agreesWithTopCandidate ? topCandidate.entityId : null,
    alternativeEntityIds: synthesis.alternativeCandidateIds,
    synthesis,
    requiresHumanReview: decision !== "MATCH" || !citationCoverageComplete,
    citationCoverageComplete,
  };
}

function buildFallback(synthesis: ModelSynthesisOutput | null): ScanDecision {
  const fallbackSynthesis: ModelSynthesisOutput = synthesis ?? {
    decisionHint: "NO_MATCH",
    primaryCandidateId: null,
    alternativeCandidateIds: [],
    observedFeatures: [],
    title: "Chưa thể nhận diện",
    summary: FALLBACK_NOTE,
    citationIds: [],
    verificationLabel: "UNVERIFIED",
    uncertaintyNote: FALLBACK_NOTE,
    nextActions: ["RETAKE_PHOTO"],
  };

  return {
    decision: "UNKNOWN",
    confidence: 0,
    entityId: null,
    alternativeEntityIds: [],
    synthesis: fallbackSynthesis,
    requiresHumanReview: true,
    citationCoverageComplete: false,
  };
}

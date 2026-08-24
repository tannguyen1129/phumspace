import type { VerificationLevel } from "./vocabulary";

/**
 * Hop dong cho AI Cultural Scanner.
 * Nguon: docs/PhumSpace_AI_Specification (pipeline 9 buoc Intake->Present, Phu luc A)
 * va docs/PhumSpace_Tai_lieu_mo_ta_chi_tiet_du_an (muc 12.3 Schema dau ra minh hoa).
 *
 * Hai lop tach biet co chu y:
 *  - `ModelSynthesisOutput`: dung cho JSON structured output ma Gemini phai tra ve (buoc Synthesize).
 *  - `ScanDecision`: ket qua sau cung cua Decision Engine (buoc Decide), ket hop
 *    model output + retrieval score + location prior — day moi la thu duoc luu/tra ve client.
 * Khong duoc gop hai khai niem nay lam mot: model khong duoc tu quyet dinh MATCH/SUGGEST/UNKNOWN.
 */

/** Goi y cua model — CHUA phai quyet dinh cuoi cung. Decision Engine se doi chieu lai. */
export const DECISION_HINTS = ["MATCH_CANDIDATE", "NEED_MORE_CONTEXT", "NO_MATCH"] as const;
export type DecisionHint = (typeof DECISION_HINTS)[number];

/**
 * Hanh dong tiep theo duoc phep goi y cho nguoi dung sau ket qua scan.
 * CHU Y: khong duoc them hanh dong mang tinh diem thuong/sưu tap (vi pham nguyen tac
 * "khong gamification o khong gian van hoa/ton giao" — xem SRS BR-007/BR-008).
 */
export const NEXT_ACTIONS = [
  "OPEN_MAP",
  "PLAY_AUDIO",
  "START_QUIZ",
  "SAVE_ITEM",
  "VIEW_RELATED_TERM",
  "RETAKE_PHOTO",
] as const;
export type NextAction = (typeof NEXT_ACTIONS)[number];

/** JSON structured output ma buoc Synthesize bat buoc Gemini phai tra ve — validate bang JSON Schema o schemas/scan-result.schema.json. */
export interface ModelSynthesisOutput {
  decisionHint: DecisionHint;
  primaryCandidateId: string | null;
  /** Toi da 2 ung vien thay the, chi lay tu evidence bundle da retrieve — khong duoc bia them. */
  alternativeCandidateIds: string[];
  observedFeatures: string[];
  title: string;
  /** Toi da 900 ky tu, chi duoc tong hop tu cac claim da duyet trong evidence bundle. */
  summary: string;
  culturalMeaning?: string;
  /** >=1 khi decisionHint = MATCH_CANDIDATE; rong khi NO_MATCH. */
  citationIds: string[];
  verificationLabel: VerificationLevel;
  uncertaintyNote?: string;
  nextActions: NextAction[];
}

/** Quyet dinh cuoi cung cua Decision Engine — day la thu duoc tra ve cho client/reviewer. */
export const SCAN_DECISIONS = ["MATCH", "SUGGEST", "UNKNOWN", "HUMAN_REVIEW"] as const;
export type ScanDecisionKind = (typeof SCAN_DECISIONS)[number];

export interface ScanDecision {
  decision: ScanDecisionKind;
  /** final_score theo cong thuc co trong so trong AI Spec — KHONG dung confidence tu sinh cua model. */
  confidence: number;
  entityId: string | null;
  alternativeEntityIds: string[];
  synthesis: ModelSynthesisOutput;
  requiresHumanReview: boolean;
  citationCoverageComplete: boolean;
}

/** Vong doi mot scan_request (buoc Intake->Present dieu phoi bat dong bo qua queue "ai-scan"). */
export const SCAN_REQUEST_STATUSES = ["PENDING", "PROCESSING", "COMPLETED", "FAILED"] as const;
export type ScanRequestStatus = (typeof SCAN_REQUEST_STATUSES)[number];

/** Chat luong anh danh gia o buoc Sanitize/Observe — dung de goi y "chup lai" som, truoc khi ton chi phi Synthesize. */
export const IMAGE_QUALITY_LEVELS = ["GOOD", "BLURRY", "TOO_DARK", "UNUSABLE"] as const;
export type ImageQuality = (typeof IMAGE_QUALITY_LEVELS)[number];

/**
 * Ket qua buoc Observe (Gemini vision, CHUA suy luan van hoa — chi mo ta dac diem quan sat duoc).
 * Rut gon so voi "Vision contract" day du trong AI_Specification Phu luc A de vua voi scope M3.
 */
export interface VisionObservation {
  observedFeatures: string[];
  sceneContext: string;
  imageQuality: ImageQuality;
  clarificationNeeded: boolean;
}

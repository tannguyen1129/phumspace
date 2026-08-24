import { describe, expect, it } from "vitest";
import type { ModelSynthesisOutput } from "@phumspace/contracts";
import { decide } from "../decision-engine";
import type { RetrievalCandidate } from "../../infrastructure/retrieval.repository";

const THRESHOLDS = { matchThreshold: 0.78, suggestThreshold: 0.55 };

const CANDIDATE: RetrievalCandidate = {
  entityId: "entity-1",
  versionId: "version-1",
  preferredLabel: "Chùa Âng",
  description: "Ngôi chùa Khmer cổ",
  verificationLevel: "EXPERT_REVIEWED",
  score: 0.9,
};

function buildSynthesis(
  overrides: Partial<ModelSynthesisOutput> = {},
): ModelSynthesisOutput {
  return {
    decisionHint: "MATCH_CANDIDATE",
    primaryCandidateId: CANDIDATE.entityId,
    alternativeCandidateIds: [],
    observedFeatures: ["kien truc chua"],
    title: "Chùa Âng",
    summary: "Ngôi chùa Khmer cổ tại Trà Vinh.",
    citationIds: ["source-1"],
    verificationLabel: "EXPERT_REVIEWED",
    nextActions: ["OPEN_MAP"],
    ...overrides,
  };
}

describe("decide", () => {
  it("fallback UNKNOWN khi Gemini khong kha dung", () => {
    const result = decide({
      topCandidate: null,
      synthesis: null,
      thresholds: THRESHOLDS,
      geminiAvailable: false,
    });
    expect(result.decision).toBe("UNKNOWN");
    expect(result.requiresHumanReview).toBe(true);
    expect(result.confidence).toBe(0);
  });

  it("fallback UNKNOWN khi khong co ung vien retrieval", () => {
    const result = decide({
      topCandidate: null,
      synthesis: buildSynthesis(),
      thresholds: THRESHOLDS,
      geminiAvailable: true,
    });
    expect(result.decision).toBe("UNKNOWN");
  });

  it("UNKNOWN khi model tra ve NO_MATCH du co candidate", () => {
    const result = decide({
      topCandidate: CANDIDATE,
      synthesis: buildSynthesis({
        decisionHint: "NO_MATCH",
        primaryCandidateId: null,
        citationIds: [],
      }),
      thresholds: THRESHOLDS,
      geminiAvailable: true,
    });
    expect(result.decision).toBe("UNKNOWN");
    expect(result.confidence).toBe(0);
  });

  it("MATCH khi model dong y voi top candidate, score cao va co citation", () => {
    const result = decide({
      topCandidate: CANDIDATE,
      synthesis: buildSynthesis(),
      thresholds: THRESHOLDS,
      geminiAvailable: true,
    });
    expect(result.decision).toBe("MATCH");
    expect(result.entityId).toBe(CANDIDATE.entityId);
    expect(result.confidence).toBe(CANDIDATE.score);
    expect(result.requiresHumanReview).toBe(false);
  });

  it("khong the MATCH neu thieu citation (requiresHumanReview du score cao)", () => {
    const result = decide({
      topCandidate: CANDIDATE,
      synthesis: buildSynthesis({ citationIds: [] }),
      thresholds: THRESHOLDS,
      geminiAvailable: true,
    });
    expect(result.decision).not.toBe("MATCH");
    expect(result.requiresHumanReview).toBe(true);
    expect(result.citationCoverageComplete).toBe(false);
  });

  it("SUGGEST khi score nam giua suggestThreshold va matchThreshold", () => {
    const mediumCandidate: RetrievalCandidate = { ...CANDIDATE, score: 0.6 };
    const result = decide({
      topCandidate: mediumCandidate,
      synthesis: buildSynthesis(),
      thresholds: THRESHOLDS,
      geminiAvailable: true,
    });
    expect(result.decision).toBe("SUGGEST");
    expect(result.requiresHumanReview).toBe(true);
  });

  it("UNKNOWN khi score duoi suggestThreshold", () => {
    const lowCandidate: RetrievalCandidate = { ...CANDIDATE, score: 0.3 };
    const result = decide({
      topCandidate: lowCandidate,
      synthesis: buildSynthesis(),
      thresholds: THRESHOLDS,
      geminiAvailable: true,
    });
    expect(result.decision).toBe("UNKNOWN");
  });

  it("giam diem va tra entityId=null khi model chon candidate khac voi top candidate", () => {
    const result = decide({
      topCandidate: CANDIDATE,
      synthesis: buildSynthesis({ primaryCandidateId: "entity-khac" }),
      thresholds: THRESHOLDS,
      geminiAvailable: true,
    });
    expect(result.entityId).toBeNull();
    expect(result.confidence).toBeLessThan(CANDIDATE.score);
    expect(result.decision).not.toBe("MATCH");
  });
});

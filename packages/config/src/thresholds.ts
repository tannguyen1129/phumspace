import type { AppEnv } from "./env";

/**
 * Nguong quyet dinh cua AI Scanner (AI_Specification.docx, muc "Confidence, Retrieval, Safety").
 * Nguyen tac: nguong nam trong config, khong hard-code trong prompt/service, de hieu chinh
 * bang golden dataset ma khong phai deploy lai code.
 */
export interface ScannerThresholds {
  /** final_score >= nguong nay -> decision MATCH */
  matchThreshold: number;
  /** final_score >= nguong nay (nhung < matchThreshold) -> decision SUGGEST */
  suggestThreshold: number;
}

export function getScannerThresholds(env: Pick<AppEnv,
  "SCANNER_CONFIDENCE_MATCH_THRESHOLD" | "SCANNER_CONFIDENCE_SUGGEST_THRESHOLD"
>): ScannerThresholds {
  const matchThreshold = env.SCANNER_CONFIDENCE_MATCH_THRESHOLD;
  const suggestThreshold = env.SCANNER_CONFIDENCE_SUGGEST_THRESHOLD;

  if (suggestThreshold >= matchThreshold) {
    throw new Error(
      `SCANNER_CONFIDENCE_SUGGEST_THRESHOLD (${suggestThreshold}) phai nho hon ` +
      `SCANNER_CONFIDENCE_MATCH_THRESHOLD (${matchThreshold}).`
    );
  }

  return { matchThreshold, suggestThreshold };
}

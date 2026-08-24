import { describe, expect, it } from "vitest";
import { getScannerThresholds } from "../thresholds";

describe("getScannerThresholds", () => {
  it("tra ve nguong hop le khi suggest < match", () => {
    const result = getScannerThresholds({
      SCANNER_CONFIDENCE_MATCH_THRESHOLD: 0.78,
      SCANNER_CONFIDENCE_SUGGEST_THRESHOLD: 0.55,
    });
    expect(result).toEqual({ matchThreshold: 0.78, suggestThreshold: 0.55 });
  });

  it("nem loi khi suggest >= match (cau hinh sai)", () => {
    expect(() =>
      getScannerThresholds({
        SCANNER_CONFIDENCE_MATCH_THRESHOLD: 0.5,
        SCANNER_CONFIDENCE_SUGGEST_THRESHOLD: 0.6,
      })
    ).toThrowError(/phai nho hon/);
  });
});

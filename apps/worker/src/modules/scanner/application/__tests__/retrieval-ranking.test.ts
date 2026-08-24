import { describe, expect, it } from "vitest";
import { rankCandidate } from "../../infrastructure/retrieval.repository";
describe("retrieval ranking", () => {
  it("tăng hạng ứng viên khi địa điểm tự nguyện khớp", () => {
    const withoutContext = rankCandidate(0.55, "SOURCE_VERIFIED", false);
    const withContext = rankCandidate(0.55, "SOURCE_VERIFIED", true);
    expect(withContext).toBeGreaterThan(withoutContext);
    expect(withContext - withoutContext).toBeCloseTo(0.18);
  });
  it("ưu tiên nội dung đã xác minh cao hơn khi tín hiệu ảnh bằng nhau", () => {
    expect(rankCandidate(0.6, "EXPERT_REVIEWED", false)).toBeGreaterThan(
      rankCandidate(0.6, "UNVERIFIED", false),
    );
  });
});

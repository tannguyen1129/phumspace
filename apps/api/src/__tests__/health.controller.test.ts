import { describe, expect, it } from "vitest";
import { HealthController } from "../common/health/health.controller";

describe("HealthController", () => {
  it("tra ve status ok", () => {
    const controller = new HealthController();
    const result = controller.check();
    expect(result.status).toBe("ok");
    expect(result.service).toBe("api");
    expect(() => new Date(result.timestamp)).not.toThrow();
  });
});

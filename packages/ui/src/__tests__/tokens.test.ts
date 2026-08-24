import { describe, expect, it } from "vitest";
import { BOTTOM_NAV_TABS, colors } from "../tokens";

describe("design tokens", () => {
  it("bottom nav toi da 4 tab (UX-V11-07)", () => {
    expect(BOTTOM_NAV_TABS.length).toBeLessThanOrEqual(4);
  });

  it("moi mau la hex hop le", () => {
    for (const value of Object.values(colors)) {
      expect(value).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });
});

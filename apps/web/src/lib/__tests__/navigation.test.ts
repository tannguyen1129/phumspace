import { describe, expect, it } from "vitest";
import { ALL_BOTTOM_NAV_TABS, getBottomNavHref, getBottomNavLabel, isBottomNavTabActive } from "../navigation";

describe("bottom nav helpers", () => {
  it("toi da 4 tab (UX-V11-07)", () => {
    expect(ALL_BOTTOM_NAV_TABS.length).toBeLessThanOrEqual(4);
  });

  it("highlight dung tab cho route con", () => {
    expect(isBottomNavTabActive("explore", "/handbook/term-1")).toBe(true);
    expect(isBottomNavTabActive("map", "/map")).toBe(true);
    expect(isBottomNavTabActive("scan", "/scan/history")).toBe(true);
    expect(isBottomNavTabActive("me", "/me")).toBe(true);
    expect(isBottomNavTabActive("explore", "/me")).toBe(false);
  });

  it("moi tab deu co href bat dau bang / va label khong rong", () => {
    for (const tab of ALL_BOTTOM_NAV_TABS) {
      expect(getBottomNavHref(tab)).toMatch(/^\//);
      expect(getBottomNavLabel(tab).length).toBeGreaterThan(0);
    }
  });
});

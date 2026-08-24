import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const user = { id: "a11y-user", email: "a11y@example.org", displayName: "Người kiểm thử", role: "SYSTEM_ADMIN", preferredLanguage: "vi", interests: [], accessibilityPreferences: null, emailVerifiedAt: new Date().toISOString() };
const place = { entityId: "a11y-place", placeType: "PAGODA", localName: null, latitude: 9.93, longitude: 106.34, visitorSummary: "Không gian văn hóa đã xác minh.", administrativeArea: "Trà Vinh", preferredLabel: "Chùa kiểm thử", verificationLevel: "EXPERT_REVIEWED", lastVerifiedAt: null, distanceMeters: null };

test("authenticated core flows have no serious or critical accessibility violations", async ({ context, page }) => {
  test.setTimeout(60_000);
  await context.addCookies([{ name: "ps_auth", value: "1", url: "http://127.0.0.1:3000" }]);
  await page.addInitScript(() => localStorage.setItem("ps_access_token", "a11y-token"));
  await page.route("http://localhost:3001/v1/**", route => {
    const url = route.request().url();
    const body = url.endsWith("/identity/me") ? user : url.includes("/discovery/places") ? [place] : [];
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(body) });
  });

  for (const path of ["/", "/map", "/scan", "/me", "/moderation"]) {
    await page.goto(path);
    await expect(page.locator("main")).toBeVisible();
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
    const blocking = results.violations.filter(violation => violation.impact === "serious" || violation.impact === "critical");
    expect(blocking, `${path}: ${blocking.map(item => `${item.id} (${item.nodes.length})`).join(", ")}`).toEqual([]);
  }
});

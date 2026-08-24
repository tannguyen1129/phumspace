import { expect, test } from "@playwright/test";

test("home refreshes an expired access token once and renders content", async ({ context, page }) => {
  let refreshCount = 0;
  await context.addCookies([{ name: "ps_auth", value: "1", url: "http://127.0.0.1:3000" }]);
  await page.addInitScript(() => {
    localStorage.setItem("ps_access_token", "expired-access-token");
    localStorage.setItem("ps_refresh_token", "valid-refresh-token");
  });

  await page.route("http://localhost:3001/v1/**", async (route) => {
    const authorization = route.request().headers().authorization;
    if (authorization !== "Bearer fresh-access-token") return route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ message: "expired" }) });
    const url = route.request().url();
    if (url.endsWith("/identity/me")) return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ id: "user-1", email: "tester@example.org", displayName: "Người kiểm thử", role: "REGISTERED_USER", preferredLanguage: "vi", interests: [], accessibilityPreferences: null, emailVerifiedAt: null }) });
    if (url.includes("/discovery/places")) return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([{ entityId: "place-1", placeType: "PAGODA", localName: null, latitude: 9.9, longitude: 106.3, visitorSummary: "Không gian văn hóa đã xác minh.", administrativeArea: "Trà Vinh", preferredLabel: "Chùa kiểm thử", verificationLevel: "EXPERT_REVIEWED", lastVerifiedAt: null, distanceMeters: null }]) });
    if (url.includes("/festivals")) return route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
    return route.fulfill({ status: 404, contentType: "application/json", body: "{}" });
  });
  // Playwright evaluates the most recently registered matching route first, so the specific
  // refresh interceptor must be registered after the API wildcard above.
  await page.route("http://localhost:3001/v1/identity/refresh", async (route) => {
    refreshCount += 1;
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ tokens: { accessToken: "fresh-access-token", refreshToken: "rotated-refresh-token" } }) });
  });

  await page.goto("/");
  await expect(page.getByText("Xin chào, Người kiểm thử")).toBeVisible();
  await expect(page.getByText("Chùa kiểm thử")).toBeVisible();
  await expect(page.getByText("Chưa tải được nội dung mới")).toHaveCount(0);
  expect(refreshCount).toBe(1);
  expect(await page.evaluate(() => localStorage.getItem("ps_refresh_token"))).toBe("rotated-refresh-token");
});

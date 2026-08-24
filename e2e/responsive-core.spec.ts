import { expect, test, type Page } from "@playwright/test";

const user = {
  id: "user-responsive",
  email: "responsive@example.org",
  displayName: "Người kiểm thử",
  role: "REGISTERED_USER",
  preferredLanguage: "vi",
  interests: [],
  accessibilityPreferences: null,
  emailVerifiedAt: new Date().toISOString(),
};
const places = [
  {
    entityId: "place-1",
    placeType: "PAGODA",
    localName: null,
    latitude: 9.93,
    longitude: 106.34,
    visitorSummary: "Không gian văn hóa đã xác minh.",
    administrativeArea: "Trà Vinh",
    preferredLabel: "Chùa kiểm thử",
    verificationLevel: "EXPERT_REVIEWED",
    lastVerifiedAt: null,
    distanceMeters: null,
    address: "Trà Vinh",
    facilities: ["PARKING"],
    visitStatus: "OPEN",
    suggestedVisitMinutes: 60,
    hasUpcomingEvent: false,
    recommendationReason: null,
  },
  {
    entityId: "place-2",
    placeType: "MUSEUM",
    localName: null,
    latitude: 9.9,
    longitude: 106.29,
    visitorSummary: "Không gian trưng bày cộng đồng.",
    administrativeArea: "Trà Vinh",
    preferredLabel: "Bảo tàng kiểm thử",
    verificationLevel: "EXPERT_REVIEWED",
    lastVerifiedAt: null,
    distanceMeters: null,
    address: "Trà Vinh",
    facilities: ["PARKING", "RESTROOM"],
    visitStatus: "UNKNOWN",
    suggestedVisitMinutes: 90,
    hasUpcomingEvent: true,
    recommendationReason: null,
  },
];
const now = new Date().toISOString();
const term = {
  id: "term-1",
  khmerText: "សួស្តី",
  latinTransliteration: "suostei",
  meaningVi: "Xin chào",
  meaningEn: "Hello",
  entityId: "place-1",
  examples: [
    { id: "example-1", exampleKhmer: "សួស្តី", exampleVi: "Xin chào" },
  ],
  audio: [],
  progress: "NEW",
};
const organization = {
  id: "org-1",
  name: "Tổ chức kiểm thử",
  orgType: "SCHOOL",
  status: "ACTIVE",
  brandColor: "#682c3e",
  homePlaceId: null,
  createdBy: user.id,
};
const contribution = {
  id: "contribution-1",
  contributorId: user.id,
  termId: null,
  proposedKhmerText: "សួស្តី",
  proposedLatinTransliteration: "suostei",
  proposedMeaningVi: "Xin chào",
  mediaKey: "audio.webm",
  audioUrl: "data:audio/webm;base64,",
  region: "Trà Vinh",
  consentScope: "PUBLIC_EDUCATIONAL",
  aiPermission: "NOT_ALLOWED",
  attributionName: "Người kiểm thử",
  sensitive: false,
  status: "SUBMITTED",
  resultTermId: null,
  resultAudioId: null,
  createdAt: now,
};

function responseFor(url: string): unknown {
  if (url.endsWith("/identity/me")) return user;
  if (url.includes("/discovery/places/place-1"))
    return {
      ...places[0],
      description: "Nội dung địa điểm đã xác minh.",
      openingHoursNote: "07:00–17:00",
      etiquetteNote: "Ăn mặc phù hợp.",
      contactNote: null,
      photoGuidanceNote: null,
      accessibilityNote: null,
      publicationStatus: "PUBLISHED",
      sources: [
        {
          id: "source-1",
          title: "Nguồn kiểm thử",
          author: "Ban quản lý",
          url: "https://example.org/source",
          reliability: "HIGH",
        },
      ],
    };
  if (url.includes("/discovery/places")) return places;
  if (url.includes("/handbook/terms/term-1")) return term;
  if (url.includes("/contribution/drafts")) return [];
  if (url.includes("/analytics/admin/overview")) return {content_count:"4",review_backlog:"1",scan_success:"3",scan_failure:"0",usage_30d:"12"};
  if (url.includes("/analytics/admin/technical")) return {queue_depth:"1",delivery_failures:"0",events_last_hour:"2",generatedAt:now};
  if (url.includes("/handbook/practice/deck")) return [term];
  if (url.includes("/festivals/boat-teams/team-1"))
    return {
      id: "team-1",
      organizationId: null,
      displayName: "Đội ghe kiểm thử",
      homePlaceId: null,
      symbolColor: "#275747",
      story: "Câu chuyện cộng đồng đã được kiểm duyệt.",
    };
  if (url.includes("/festivals/festival-1"))
    return {
      id: "festival-1",
      entityId: "festival-1",
      preferredLabel: "Lễ hội kiểm thử",
      description: "Lễ hội văn hóa cộng đồng.",
      verificationLevel: "EXPERT_REVIEWED",
      publicationStatus: "PUBLISHED",
      recurrenceRule: null,
      organizerOrgId: null,
      occurrences: [
        {
          id: "occurrence-1",
          startsAt: now,
          endsAt: null,
          status: "CONFIRMED",
          events: [],
          facilities: [],
        },
      ],
    };
  if (url.includes("/moderation/contributions/contribution-1/history"))
    return [];
  if (url.includes("/moderation/contributions/contribution-1"))
    return contribution;
  if (url.includes("/olympiad/organizations/org-1/report")) return [];
  if (url.includes("/organizations/org-1/members")) return [];
  if (url.includes("/organizations/org-1")) return organization;
  if (url.includes("/olympiad/competitions/room/ROOM01"))
    return {
      id: "competition-1",
      title: "Phòng thi kiểm thử",
      status: "OPEN",
      roomCode: "ROOM01",
    };
  if (url.includes("/olympiad/competitions/competition-1/questions")) return [];
  if (url.includes("/olympiad/competitions/competition-1/leaderboard"))
    return [];
  return [];
}

async function mockAuthenticatedApp(page: Page) {
  await page
    .context()
    .addCookies([
      { name: "ps_auth", value: "1", url: "http://127.0.0.1:3000" },
    ]);
  await page.addInitScript(() =>
    localStorage.setItem("ps_access_token", "responsive-token"),
  );
  await page.route("http://localhost:3001/v1/**", async (route) => {
    const url = route.request().url();
    const body = responseFor(url);
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(body),
    });
  });
}

test("core authenticated screens never overflow horizontally", async ({
  page,
}) => {
  await mockAuthenticatedApp(page);
  for (const viewport of [
    { width: 375, height: 812 },
    { width: 768, height: 1024 },
    { width: 1440, height: 900 },
  ]) {
    await page.setViewportSize(viewport);
    for (const path of ["/", "/map"]) {
      await page.goto(path);
      await expect(page.locator("main")).toBeVisible();
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      );
      expect(overflow, `${path} at ${viewport.width}px`).toBeLessThanOrEqual(1);
    }
  }
});

test("map keeps a visible canvas and responsive result panel", async ({
  page,
}) => {
  await mockAuthenticatedApp(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/map");
  await expect(page.locator(".heritage-map__marker")).toHaveCount(2);
  const desktop = await page.evaluate(() => {
    const canvas = document.querySelector<HTMLElement>(".map-layout__canvas")!;
    const map = document.querySelector<HTMLElement>(".heritage-map")!;
    const results = document.querySelector<HTMLElement>(".map-results")!;
    return {
      canvas: canvas.getBoundingClientRect(),
      map: map.getBoundingClientRect(),
      results: results.getBoundingClientRect(),
    };
  });
  expect(desktop.map.height).toBeGreaterThan(500);
  expect(desktop.canvas.width).toBeGreaterThan(desktop.results.width);

  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/map");
  const mobile = await page.evaluate(() => {
    const canvas = document
      .querySelector<HTMLElement>(".map-layout__canvas")!
      .getBoundingClientRect();
    const results = document
      .querySelector<HTMLElement>(".map-results")!
      .getBoundingClientRect();
    return { canvas, results };
  });
  expect(mobile.canvas.width).toBeCloseTo(mobile.results.width, 0);
  expect(mobile.results.top).toBeGreaterThanOrEqual(mobile.canvas.bottom - 1);
});

test("feature hubs remain usable on phone and wide desktop", async ({
  page,
}) => {
  test.setTimeout(60_000);
  await mockAuthenticatedApp(page);
  const routes = [
    "/scan",
    "/handbook",
    "/handbook/practice",
    "/quiz",
    "/contribute",
    "/contribute/drafts",
    "/festivals",
    "/festivals/boat-teams",
    "/me",
    "/moderation",
    "/admin/organizations",
    "/admin/analytics",
    "/organizations/new",
  ];
  for (const viewport of [
    { width: 375, height: 812 },
    { width: 1440, height: 900 },
  ]) {
    await page.setViewportSize(viewport);
    for (const path of routes) {
      await page.goto(path);
      await expect(page.locator("main")).toBeVisible();
      await expect(page.locator("main")).not.toContainText("Runtime Error");
      const layout = await page.evaluate(() => ({
        overflow:
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
        minTouchTarget: Math.min(
          ...Array.from(
            document.querySelectorAll<HTMLElement>(
              "button:not(.heritage-map__marker), a.ps-btn",
            ),
          )
            .filter((element) => element.offsetParent !== null)
            .map((element) => element.getBoundingClientRect().height),
        ),
      }));
      expect(
        layout.overflow,
        `${path} at ${viewport.width}px`,
      ).toBeLessThanOrEqual(1);
      if (Number.isFinite(layout.minTouchTarget))
        expect(
          layout.minTouchTarget,
          `${path} touch targets`,
        ).toBeGreaterThanOrEqual(40);
    }
  }
});

test("dynamic detail views remain responsive with real content shapes", async ({
  page,
}) => {
  test.setTimeout(60_000);
  await mockAuthenticatedApp(page);
  const routes = [
    "/places/place-1",
    "/handbook/term-1",
    "/festivals/festival-1",
    "/festivals/boat-teams/team-1",
    "/organizations/org-1",
    "/organizations/org-1/report",
    "/moderation/contribution-1",
    "/quiz/room/ROOM01",
  ];
  for (const viewport of [
    { width: 375, height: 812 },
    { width: 1440, height: 900 },
  ]) {
    await page.setViewportSize(viewport);
    for (const path of routes) {
      await page.goto(path);
      await expect(page.locator("main")).toBeVisible();
      await expect(page.locator("main")).not.toContainText("Runtime Error");
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      );
      expect(overflow, `${path} at ${viewport.width}px`).toBeLessThanOrEqual(1);
    }
  }
});

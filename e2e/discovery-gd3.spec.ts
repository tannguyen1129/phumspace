import { expect, test } from "@playwright/test";

const place = {
  entityId: "place-gd3",
  placeType: "PAGODA",
  localName: "Wat kiểm thử",
  latitude: 9.93,
  longitude: 106.34,
  visitorSummary: "Điểm đến có nguồn.",
  administrativeArea: "Trà Vinh",
  preferredLabel: "Chùa Âng",
  verificationLevel: "EXPERT_REVIEWED",
  lastVerifiedAt: new Date().toISOString(),
  distanceMeters: null,
  address: "Phường 8, Trà Vinh",
  facilities: ["PARKING", "RESTROOM"],
  visitStatus: "OPEN",
  suggestedVisitMinutes: 60,
  hasUpcomingEvent: true,
  recommendationReason: null,
};
const placeTwo = {
  ...place,
  entityId: "place-gd3-2",
  preferredLabel: "Bảo tàng Khmer",
  placeType: "MUSEUM",
  latitude: 9.94,
  longitude: 106.35,
};

test.beforeEach(async ({ context, page }) => {
  await context.addCookies([
    { name: "ps_auth", value: "1", url: "http://127.0.0.1:3000" },
  ]);
  await page.addInitScript(() =>
    localStorage.setItem("ps_access_token", "discovery-token"),
  );
  await page.route("http://localhost:3001/v1/**", async (route) => {
    const url = route.request().url();
    const body = url.includes("/discovery/itinerary")
      ? {
          stops: [place, placeTwo].map((item, index) => ({
            order: index + 1,
            entityId: item.entityId,
            preferredLabel: item.preferredLabel,
            distanceFromPreviousMeters: index ? 1200 : 0,
            travelMinutesFromPrevious: index ? 3 : 0,
            suggestedVisitMinutes: 60,
          })),
          totalTravelMinutes: 3,
          totalVisitMinutes: 120,
          totalDurationMinutes: 123,
          note: "Lộ trình chỉ là gợi ý.",
        }
      : url.includes("/discovery/places/place-gd3")
        ? {
            ...place,
            description: "Nội dung đã công bố.",
            openingHoursNote: "07:00–17:00",
            etiquetteNote: "Tôn trọng không gian nghi lễ.",
            contactNote: null,
            photoGuidanceNote: null,
            accessibilityNote: null,
            publicationStatus: "PUBLISHED",
            sources: [
              {
                id: "source-gd3",
                title: "Hồ sơ địa điểm",
                author: "Ban quản lý",
                url: "https://example.org/source",
                reliability: "HIGH",
              },
            ],
          }
        : url.includes("/discovery/")
          ? [place, placeTwo]
          : url.includes("/phumdata/search")
            ? [
                {
                  id: "version-gd3",
                  entityId: place.entityId,
                  preferredLabel: place.preferredLabel,
                  description: "Nội dung có nguồn.",
                  verificationLevel: "EXPERT_REVIEWED",
                  sensitivityLevel: "PUBLIC",
                },
              ]
            : [];
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(body),
    });
  });
});

test("map filters and selected place are reflected in the URL", async ({
  page,
}) => {
  await page.goto("/map");
  await page.getByRole("button", { name: /^Lọc/ }).click();
  await page.getByLabel("Trạng thái tham quan").selectOption("OPEN");
  await page.getByLabel("Tiện ích").selectOption("PARKING");
  await page.getByRole("button", { name: "Danh sách" }).click();
  await expect(page).toHaveURL(/status=OPEN/);
  await expect(page).toHaveURL(/facility=PARKING/);
  await expect(page).toHaveURL(/selected=place-gd3/);
  await expect(page).toHaveURL(/view=list/);
  await expect(page.getByRole("heading", { name: "Chùa Âng" })).toBeVisible();
});

test("place detail exposes verified practical information and source", async ({
  page,
}) => {
  await page.goto("/places/place-gd3");
  await expect(page.getByRole("heading", { name: "Chùa Âng" })).toBeVisible();
  await expect(page.getByText("Phường 8, Trà Vinh")).toBeVisible();
  await expect(page.getByText("Hồ sơ địa điểm")).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Mở Google Maps/ }),
  ).toHaveAttribute("href", /google\.com\/maps\/dir/);
});

test("global search and multi-stop itinerary complete the discovery flow", async ({
  page,
}) => {
  await page.goto("/search?q=chua%20ang");
  await expect(page.getByRole("heading", { name: "Chùa Âng" })).toBeVisible();
  await page.goto("/map?view=list");
  await page.getByRole("button", { name: "Thêm vào lộ trình" }).nth(0).click();
  await page.getByRole("button", { name: "Thêm vào lộ trình" }).click();
  await page.getByRole("button", { name: "Sắp xếp lộ trình" }).click();
  await expect(
    page.getByText("Tổng 123 phút (3 phút di chuyển)"),
  ).toBeVisible();
});

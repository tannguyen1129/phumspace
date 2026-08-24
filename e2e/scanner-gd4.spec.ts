import { expect, test } from "@playwright/test";

test("scanner validates, processes an image and stores explicit feedback", async ({
  context,
  page,
}) => {
  await context.addCookies([
    { name: "ps_auth", value: "1", url: "http://127.0.0.1:3000" },
  ]);
  await page.addInitScript(() =>
    localStorage.setItem("ps_access_token", "scanner-token"),
  );
  await page.route("http://localhost:3001/v1/**", async (route) => {
    const url = route.request().url();
    const body = url.includes("/scanner/scans/scan-gd4/feedback")
      ? { id: "feedback-1" }
      : url.endsWith("/scanner/scans")
        ? { id: "scan-gd4", status: "PENDING" }
        : url.includes("/scanner/scans/scan-gd4")
          ? {
              id: "scan-gd4",
              status: "COMPLETED",
              errorMessage: null,
              result: {
                decision: "SUGGEST",
                confidence: 0.64,
                entityId: "entity-1",
                alternativeEntityIds: ["entity-2"],
                requiresHumanReview: true,
                citationCoverageComplete: true,
                synthesis: {
                  decisionHint: "POSSIBLE_MATCH",
                  primaryCandidateId: "entity-1",
                  alternativeCandidateIds: ["entity-2"],
                  observedFeatures: ["mái cong"],
                  title: "Ứng viên văn hóa",
                  summary: "Kết quả được đối chiếu từ PhumData.",
                  citationIds: ["source-1"],
                  verificationLabel: "SOURCE_VERIFIED",
                  uncertaintyNote: "Cần thêm góc chụp.",
                  nextActions: ["OPEN_MAP", "VIEW_RELATED_TERM", "START_QUIZ"],
                },
              },
            }
          : url.includes("/discovery/places")
            ? []
            : [];
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(body),
    });
  });
  await page.goto("/scan");
  const bytes = await page.evaluate(async () => {
    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 400;
    const context = canvas.getContext("2d")!;
    context.fillStyle = "#c7a45b";
    context.fillRect(0, 0, 400, 400);
    context.fillStyle = "#3d1725";
    for (let x = 0; x < 400; x += 20) context.fillRect(x, 0, 10, 400);
    const blob = await new Promise<Blob>((resolve) =>
      canvas.toBlob((value) => resolve(value!), "image/png"),
    );
    return Array.from(new Uint8Array(await blob.arrayBuffer()));
  });
  await page
    .getByLabel("Chọn ảnh từ thư viện")
    .setInputFiles({
      name: "scanner.png",
      mimeType: "image/png",
      buffer: Buffer.from(bytes),
    });
  await page.getByRole("button", { name: "Phân tích ảnh này" }).click();
  await expect(
    page.getByRole("heading", { name: "Ứng viên văn hóa" }),
  ).toBeVisible();
  await expect(
    page.getByText("Đây là gợi ý cần được xem thận trọng."),
  ).toBeVisible();
  await page.getByRole("button", { name: "Không chắc" }).click();
  await expect(page.getByRole("status")).toContainText(
    "Phản hồi đã được lưu riêng",
  );
  await expect(page.getByRole("link", { name: "Mở cẩm nang" })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Làm quiz liên quan" }),
  ).toBeVisible();
});

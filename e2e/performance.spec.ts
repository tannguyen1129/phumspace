import { expect, test } from "@playwright/test";

const BUDGET = { domNodes: 1_500, totalBytes: 2_500_000, scriptBytes: 900_000, cls: 0.1 };

test("welcome stays within the frontend performance budget", async ({ page }) => {
  await page.addInitScript(() => {
    (window as typeof window & { __phumspaceCls?: number }).__phumspaceCls = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as Array<PerformanceEntry & { value: number; hadRecentInput: boolean }>) {
        if (!entry.hadRecentInput) (window as typeof window & { __phumspaceCls?: number }).__phumspaceCls! += entry.value;
      }
    }).observe({ type: "layout-shift", buffered: true });
  });
  await page.goto("/welcome", { waitUntil: "networkidle" });
  const metrics = await page.evaluate(() => {
    const resources = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
    return {
      domNodes: document.getElementsByTagName("*").length,
      totalBytes: resources.reduce((sum, item) => sum + (item.transferSize || item.encodedBodySize), 0),
      scriptBytes: resources.filter((item) => item.initiatorType === "script").reduce((sum, item) => sum + (item.transferSize || item.encodedBodySize), 0),
      cls: (window as typeof window & { __phumspaceCls?: number }).__phumspaceCls ?? 0,
    };
  });
  expect(metrics.domNodes).toBeLessThanOrEqual(BUDGET.domNodes);
  expect(metrics.totalBytes).toBeLessThanOrEqual(BUDGET.totalBytes);
  expect(metrics.scriptBytes).toBeLessThanOrEqual(BUDGET.scriptBytes);
  expect(metrics.cls).toBeLessThanOrEqual(BUDGET.cls);
});

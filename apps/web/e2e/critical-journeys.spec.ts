import { test, expect, Page } from '@playwright/test';

test.describe('PhumSpace Critical User Journeys (Sprint 8A E2E Tests)', () => {
  test('Journey 1: Discovery & Navigation Flow', async ({ page }: { page: Page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/PhumSpace/);

    // Navigate to Discovery
    await page.goto('/kham-pha');
    await expect(page.locator('h1')).toContainText('Khám phá');

    // Navigate to Map
    await page.goto('/ban-do');
    await expect(page.locator('h1')).toContainText('Bản đồ');
  });

  test('Journey 2: AI Cultural Scanner Route Check', async ({ page }: { page: Page }) => {
    await page.goto('/quet-di-san');
    await expect(page.locator('h1')).toContainText('AI Cultural Scanner');
  });

  test('Journey 3: Cultural Quiz Route Check', async ({ page }: { page: Page }) => {
    await page.goto('/thu-thach');
    await expect(page.locator('h1')).toContainText('Thử thách');
  });

  test('Journey 4: Interactive Khmer Handbook Flow', async ({ page }: { page: Page }) => {
    await page.goto('/so-tay');
    await expect(page.locator('h1')).toContainText('Sổ tay');

    // Navigate to Term Detail
    await page.goto('/so-tay/tu/wat-chua');
    await expect(page.locator('span[lang="km"]')).toBeVisible();

    // Navigate to Flashcards Learning
    await page.goto('/so-tay/bo-suu-tap/tu-vung-nhap-mon/hoc');
    await expect(page.locator('h1')).toContainText('Từ vựng Nhập môn');
  });

  test('Journey 5: Community Contribution Intake Route Check', async ({ page }: { page: Page }) => {
    await page.goto('/dong-gop');
    await expect(page.locator('h1')).toContainText('Đóng góp');
  });

  test('Journey 6: Admin Staff Login & Moderation Workspace Check', async ({ page }: { page: Page }) => {
    await page.goto('/admin/dang-nhap');
    await expect(page.locator('h1')).toContainText('Quản trị');
  });
});

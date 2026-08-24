import { expect, test } from "@playwright/test";

test("welcome renders the public application shell", async ({ page }) => {
  await page.goto("/welcome");
  await expect(page).toHaveTitle(/PhumSpace/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("link", { name: /Đăng nhập/i })).toBeVisible();
  await expect(page.locator("body")).not.toHaveCSS("overflow-x", "scroll");
});

test("account-required routes redirect anonymous visitors", async ({ page }) => {
  await page.goto("/scan");
  await expect(page).toHaveURL(/\/welcome$/);
  await page.goto("/me");
  await expect(page).toHaveURL(/\/welcome$/);
});

test("login and registration forms have accessible labels", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("textbox", { name: /email/i })).toBeVisible();
  await expect(page.getByLabel(/mật khẩu/i)).toBeVisible();
  await page.goto("/register");
  await expect(page.getByRole("button", { name: /tạo tài khoản/i })).toBeVisible();
});

import { test, expect } from "@playwright/test";

test("home muestra hero y enlace al catálogo", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /bienestar/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /explorar catálogo/i })).toBeVisible();
});

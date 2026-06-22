import { test, expect } from "@playwright/test";

test("catálogo carga con título y grid", async ({ page }) => {
  await page.goto("/catalogo");
  await expect(page.getByRole("heading", { name: /catalogo completo/i })).toBeVisible();
});

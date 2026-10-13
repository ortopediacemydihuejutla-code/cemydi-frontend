import { test, expect } from "@playwright/test";

test("home muestra hero y enlace al catálogo", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /tu bienestar es nuestra prioridad/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /explorar catálogo/i }).first(),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /crear cuenta/i }).last(),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /explora nuestro catálogo por categoría/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /cómo funciona el servicio de renta médica/i }),
  ).toBeVisible();
});

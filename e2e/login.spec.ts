import { test, expect } from "@playwright/test";

test("login muestra formulario", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByLabel(/correo/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /iniciar sesión/i })).toBeVisible();
});

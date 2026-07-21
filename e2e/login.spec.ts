import { test, expect } from "@playwright/test";

test("login muestra formulario", async ({ page }) => {
  await page.goto("/login");
  const main = page.getByRole("main");

  await expect(main.getByLabel("Correo electrónico")).toBeVisible();
  await expect(main.getByRole("button", { name: /iniciar sesión/i })).toBeVisible();
});

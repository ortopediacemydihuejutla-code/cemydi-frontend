import { test, expect } from "@playwright/test";

test("register muestra formulario", async ({ page }) => {
  await page.goto("/register");
  const main = page.getByRole("main");

  await expect(main.getByLabel("Nombre completo")).toBeVisible();
  await expect(main.getByLabel("Correo electrónico")).toBeVisible();
  await expect(main.getByRole("button", { name: /crear mi cuenta/i })).toBeVisible();
});

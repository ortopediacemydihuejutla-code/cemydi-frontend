import { test, expect } from "@playwright/test";

test("catálogo carga con título y grid", async ({ page }) => {
  await page.goto("/catalogo");
  await expect(page.getByRole("heading", { name: "Catálogo de productos" })).toBeVisible();
});

test("buscador móvil conserva espacio y permite buscar y limpiar", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/catalogo");
  const search = page.getByRole("searchbox", { name: "Buscar en el catálogo" });
  await expect(search).toBeVisible();
  const bounds = await search.boundingBox();
  expect(bounds?.width).toBeGreaterThan(230);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

  await search.fill("silla");
  await search.press("Enter");
  await expect(page.getByRole("heading", { name: 'Resultados para "silla"' })).toBeVisible();
  await expect(search).toHaveValue("silla");
  await page.getByRole("button", { name: "Limpiar búsqueda", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Catálogo de productos" })).toBeVisible();
  await expect(search).toBeEmpty();
});

test("aplicar filtros conserva el panel móvil y las secciones plegadas", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/catalogo");
  await page.getByRole("button", { name: "Filtros", exact: true }).click();
  const panel = page.getByRole("dialog", { name: "Filtros", exact: true });
  const category = panel.getByRole("button", { name: "Categoría", exact: true });
  await category.click();
  await panel.getByRole("checkbox", { name: "Solo renta", exact: true }).click();
  await expect(page).toHaveURL(/tipos=RENTA/);
  await expect(panel).toBeVisible();
  await expect(panel.getByRole("checkbox", { name: "Solo renta", exact: true })).toBeChecked();
  await expect(category).toHaveAttribute("aria-expanded", "false");
  await panel.getByRole("button", { name: "Cerrar", exact: true }).click();
  await expect(panel).toBeHidden();
});

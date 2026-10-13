import { test, expect } from "@playwright/test";

test("header conserva su distribución desde el HTML inicial hasta resolver la sesión", async ({ browser, page, baseURL }) => {
  const viewport = { width: 1440, height: 900 };
  const initialContext = await browser.newContext({ javaScriptEnabled: false, viewport, baseURL });
  try {
    const initialPage = await initialContext.newPage();
    await initialPage.goto("/catalogo");
    const initialHeader = initialPage.getByRole("banner");
    const initialSearch = initialHeader.locator("div.hidden.justify-center");
    await expect(initialSearch).toBeVisible();
    const initialHeaderBounds = await initialHeader.boundingBox();
    const initialSearchBounds = await initialSearch.boundingBox();
    const initialNavBounds = await initialHeader.getByRole("link", { name: "Catálogo", exact: true }).boundingBox();

    await page.setViewportSize(viewport);
    await page.route("**/users/me", (route) => route.fulfill({ status: 403, json: { message: "Sin sesión" } }));
    await page.goto("/catalogo");
    const header = page.getByRole("banner");
    await expect(header.getByRole("link", { name: "Iniciar sesión", exact: true })).toBeVisible();
    expect(await header.boundingBox()).toEqual(initialHeaderBounds);
    expect(await header.locator("div.hidden.justify-center").boundingBox()).toEqual(initialSearchBounds);
    expect(await header.getByRole("link", { name: "Catálogo", exact: true }).boundingBox()).toEqual(initialNavBounds);
  } finally {
    await initialContext.close();
  }
});

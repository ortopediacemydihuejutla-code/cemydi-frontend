import { expect, test } from "@playwright/test";

test.beforeEach(async ({ request }) => {
  await request.get("http://127.0.0.1:4199/__test/failure?on=0");
});

test("precarga ambos documentos desde catálogo y los abre offline sin visitas previas", async ({ page, context }) => {
  await page.goto("/catalogo");
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  const slugs = ["terminos-y-condiciones", "politicas-de-privacidad"];
  const titles = ["Términos y condiciones", "Política de privacidad"];
  for (const slug of slugs) {
    expect(await page.evaluate(async (slug) => {
      for (const name of await caches.keys()) {
        if (!name.startsWith("serwist-precache-")) continue;
        const cache = await caches.open(name);
        const response = await cache.match(`/pwa/legal/${slug}`, { ignoreSearch: true });
        if (response) return (await response.json()).slug;
      }
      return null;
    }, slug)).toBe(slug);
  }
  await context.setOffline(true);
  for (const [index, slug] of slugs.entries()) {
    await page.goto(`/${slug}`);
    await expect(page.getByRole("heading", { name: titles[index], exact: true })).toBeVisible();
    await expect(page.getByText(`Contenido publicado de ${titles[index]}`)).toBeVisible();
    await expect(page.getByText(/Documento precargado durante la instalación/)).toBeVisible();
    await page.reload();
    await expect(page.getByText(`Contenido publicado de ${titles[index]}`)).toBeVisible();
  }
  // Missing essentials must not trigger a download when the document is read.
  await page.evaluate(async () => {
    for (const name of await caches.keys()) {
      if (!name.startsWith("serwist-precache-")) continue;
      const cache = await caches.open(name);
      for (const key of await cache.keys()) {
        if (new URL(key.url).pathname === "/pwa/legal/politicas-de-privacidad") await cache.delete(key);
      }
    }
  });
  await page.reload();
  await expect(page.getByText(/El documento no está disponible en el precache/)).toBeVisible();
});

test("rechaza errores y slugs desconocidos e impide instalar documentos incompletos", async ({ page, request }) => {
  const invalid = await request.get("/pwa/legal/desconocido");
  expect(invalid.status()).toBe(404);
  await request.get("http://127.0.0.1:4199/__test/failure?on=1");
  try {
    const response = await request.get("/pwa/legal/terminos-y-condiciones");
    expect(response.status()).toBe(503);
    expect(await response.text()).not.toContain("Texto de demostración");
    await page.goto("/offline");
    const installed = await page.evaluate(async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
        const worker = registration.installing ?? registration.waiting ?? registration.active;
        if (!worker) return false;
        await new Promise<void>((resolve) => {
          const changed = () => {
            if (worker.state === "redundant" || worker.state === "activated") {
              worker.removeEventListener("statechange", changed);
              resolve();
            }
          };
          worker.addEventListener("statechange", changed);
          changed();
        });
        return worker.state === "activated";
      } catch { return false; }
    });
    expect(installed).toBe(false);
  } finally {
    await request.get("http://127.0.0.1:4199/__test/failure?on=0");
  }
});

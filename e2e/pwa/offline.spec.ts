import { expect, test, type Page } from "@playwright/test";
import { readFile, writeFile, mkdtemp } from "node:fs/promises";
import path from "node:path";
import os from "node:os";

async function ready(page: Page) {
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
}
async function countSaved(page: Page) {
  return page.evaluate(async () => {
    if (!(await indexedDB.databases()).some((database) => database.name === "cemydi-public-offline")) return 0;
    return new Promise<number>((resolve, reject) => {
    const request = indexedDB.open("cemydi-public-offline", 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction("products", "readonly");
      const count = transaction.objectStore("products").count();
      count.onsuccess = () => { db.close(); resolve(count.result); };
    };
    });
  });
}
test.beforeEach(async ({ request }) => {
  await request.get("http://127.0.0.1:4199/__test/failure?on=0");
  await request.get("http://127.0.0.1:4199/__test/images?on=0");
});

test("guarda páginas vistas, deduplica, filtra y pagina offline sin datos comerciales", async ({ page, context }) => {
  await page.goto("/catalogo");
  await ready(page);
  await expect.poll(() => countSaved(page)).toBe(24);
  await page.goto("/catalogo?page=2");
  await expect.poll(() => countSaved(page)).toBe(48);
  await page.goto("/catalogo");
  await expect.poll(() => countSaved(page)).toBe(48);
  await context.setOffline(true);
  await page.goto("/catalogo");
  await expect(page.getByRole("heading", { name: "Catálogo de productos", exact: true })).toBeVisible();
  await expect(page.locator("article")).toHaveCount(24);
  await expect(page.getByText("Consultar disponibilidad y precio al reconectar")).toHaveCount(24);
  await expect(page.locator("body")).not.toContainText("$1,350");
  await page.getByRole("button", { name: "Página siguiente" }).click();
  await expect(page.getByText("48 productos guardados · Página 2 de 2")).toBeVisible();
  await page.getByRole("checkbox", { name: "Marca B", exact: true }).check();
  await expect(page.getByText("24 productos guardados · Página 1 de 1")).toBeVisible();
  await page.getByRole("checkbox", { name: "Receta requerida", exact: true }).check();
  await expect(page.locator("article")).toHaveCount(24);
  await page.locator("main").getByRole("searchbox").fill("Producto 02");
  await page.locator("main").getByRole("button", { name: "Buscar", exact: true }).click();
  await expect(page.locator("article")).toHaveCount(1);
  await expect(page.getByRole("heading", { name: "Producto 02", exact: true })).toBeVisible();
  await expect(page.locator('option[value="precio-asc"]')).toHaveAttribute("disabled", "");
  await expect(page.getByText("Stock, precio y popularidad requieren conexión.")).toBeVisible();
});

test("abre detalle por ID y slug después de cerrar la pestaña", async ({ page, context }) => {
  await page.goto("/producto/producto-1");
  await ready(page);
  await expect.poll(() => countSaved(page)).toBe(1);
  await expect(page.getByText(/Ficha guardada para consultar sin conexión/)).toHaveCount(0);
  const layout = await page.locator("main > section").getAttribute("class");
  await page.close();
  await context.setOffline(true);
  const reopened = await context.newPage();
  await reopened.goto("http://localhost:3199/producto/1");
  await expect(reopened.getByRole("heading", { name: "Producto 01", exact: true })).toBeVisible();
  await expect(reopened.getByText("20 cm")).toBeVisible();
  await expect(reopened.locator("main > section")).toHaveAttribute("class", layout!);
  await expect(reopened.getByRole("heading", { name: "Ficha ortopédica" })).toBeVisible();
  await reopened.getByRole("button", { name: "Actualizar ficha", exact: true }).click();
  await expect(reopened.getByText("Necesitas conexión a Internet para actualizar esta ficha.")).toBeVisible();
  await expect(reopened.getByText("Consultar disponibilidad y precio al reconectar")).toBeVisible();
  await expect(reopened.locator("body")).not.toContainText("$1,350");
  await reopened.goto("http://localhost:3199/producto/producto-1");
  await expect(reopened.getByRole("heading", { name: "Producto 01", exact: true })).toBeVisible();
  await reopened.goto("http://localhost:3199/producto/no-guardado");
  await expect(reopened.getByRole("heading", { name: "Producto no guardado" })).toBeVisible();
});

test("conserva ambas páginas informativas y evita mapas offline", async ({ page, context }) => {
  await page.goto("/quienes-somos");
  await ready(page);
  await expect(page.getByText("Misión pública guardada")).toBeVisible();
  await page.goto("/contactanos");
  await expect(page.locator("main").getByText("contacto@cemydi.com")).toBeVisible();
  await expect.poll(() => page.evaluate(() => new Promise<boolean>((resolve) => {
    const request = indexedDB.open("cemydi-public-offline");
    request.onsuccess = () => {
      const db = request.result;
      const value = db.transaction("metadata").objectStore("metadata").get("contact-visited");
      value.onsuccess = () => { db.close(); resolve(value.result?.value === true); };
    };
  }))).toBe(true);
  await context.setOffline(true);
  await page.goto("/quienes-somos");
  await expect(page.getByText("Misión pública guardada")).toBeVisible();
  await expect(page.getByText(/Contenido público guardado\. Actualizado/)).toBeVisible();
  await page.goto("/contactanos");
  await expect(page.getByRole("heading", { name: "Atención sin vueltas." })).toBeVisible();
  await expect(page.locator("main").getByText("contacto@cemydi.com")).toBeVisible();
  await expect(page.locator("iframe")).toHaveCount(0);
  await expect(page.getByText(/CEMYDI no ha enviado el mensaje/)).toBeVisible();
});

test("5xx permite respaldo y no renueva productos ni contenido institucional", async ({ page, request }) => {
  await page.goto("/catalogo");
  await ready(page);
  await expect.poll(() => countSaved(page)).toBe(24);
  const before = await page.evaluate(() => new Promise<number>((resolve) => {
    const request = indexedDB.open("cemydi-public-offline");
    request.onsuccess = () => { const db = request.result; const value = db.transaction("products").objectStore("products").get(1); value.onsuccess = () => { db.close(); resolve(value.result.updatedAt); }; };
  }));
  await request.get("http://127.0.0.1:4199/__test/failure?on=1");
  await page.goto("/catalogo");
  await expect(page.getByRole("heading", { name: "Catálogo de productos", exact: true })).toBeVisible();
  await expect(page.getByText("Servicio temporalmente no disponible. Mostramos contenido guardado.")).toBeVisible();
  const after = await page.evaluate(() => new Promise<number>((resolve) => {
    const request = indexedDB.open("cemydi-public-offline");
    request.onsuccess = () => { const db = request.result; const value = db.transaction("products").objectStore("products").get(1); value.onsuccess = () => { db.close(); resolve(value.result.updatedAt); }; };
  }));
  expect(after).toBe(before);
  await request.get("http://127.0.0.1:4199/__test/failure?on=0");
  await page.reload();
  await expect(page.getByText("Consultar disponibilidad y precio al reconectar")).toHaveCount(0);
  await expect(page.locator("article")).toHaveCount(24);
});

test("expira registros, mantiene estado vacío y no cachea datos privados", async ({ page, context }) => {
  await page.goto("/catalogo");
  await ready(page);
  await expect.poll(() => countSaved(page)).toBe(24);
  await page.evaluate(() => new Promise<void>((resolve) => {
    const request = indexedDB.open("cemydi-public-offline");
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction("products", "readwrite");
      const store = transaction.objectStore("products");
      const all = store.getAll();
      all.onsuccess = () => { for (const product of all.result) store.put({ ...product, updatedAt: Date.now() - 30 * 86400 * 1000 - 1 }); };
      transaction.oncomplete = () => { db.close(); resolve(); };
    };
  }));
  expect(await page.evaluate(async () => {
    const profile = await fetch("/api/users/me?fixture=1", { credentials: "include" });
    const cart = await fetch("/api/cart?fixture=1", { credentials: "include" });
    return [profile.status, cart.status];
  })).toEqual([200, 200]);
  const cached = await page.evaluate(async () => {
    const urls: string[] = [];
    for (const name of await caches.keys()) for (const request of await (await caches.open(name)).keys()) urls.push(new URL(request.url).pathname);
    return urls;
  });
  expect(cached.filter((url) => /^(\/api\/|\/admin|\/mi-cuenta|\/carrito|\/catalogo$)/.test(url))).toEqual([]);
  expect(cached).toContain("/offline");
  await context.setOffline(true);
  await page.goto("/catalogo");
  await expect(page.getByRole("heading", { name: "No hay resultados guardados" })).toBeVisible();
  await expect.poll(() => countSaved(page)).toBe(0);
});

test("IndexedDB bloqueado no rompe la navegación online", async ({ page }) => {
  await page.addInitScript(() => { Object.defineProperty(window, "indexedDB", { configurable: true, get() { throw new DOMException("Bloqueado", "SecurityError"); } }); });
  await page.goto("/catalogo");
  await expect(page.locator("article")).toHaveCount(24);
  await expect(page.getByText(/No se pudieron guardar los nuevos productos/)).toBeVisible();
});

test("Quiénes somos avisa si IndexedDB está bloqueado sin ocultar contenido online", async ({ page }) => {
  await page.addInitScript(() => { Object.defineProperty(window, "indexedDB", { configurable: true, get() { throw new DOMException("Bloqueado", "SecurityError"); } }); });
  await page.goto("/quienes-somos");
  await expect(page.getByRole("heading", { name: "Quiénes somos", exact: true })).toBeVisible();
  await expect(page.getByText("Misión pública guardada")).toBeVisible();
  await expect(page.locator('[data-rht-toaster]').getByText(/No se pudo guardar el contenido institucional/)).toBeVisible();
});

test("un 404 confirmado por ID elimina producto, detalle y aliases sin borrar imágenes compartidas", async ({ page }) => {
  await page.goto("/catalogo?page=2");
  await ready(page);
  await expect.poll(() => countSaved(page)).toBe(24);
  await page.goto("/producto/48");
  await expect(page.getByRole("heading", { name: "Página no encontrada" })).toBeVisible();
  await expect.poll(() => countSaved(page)).toBe(23);
  expect(await page.evaluate(async () => {
    for (const name of await caches.keys()) {
      if ((await (await caches.open(name)).keys()).some((request) => new URL(request.url).pathname === "/icon-192.png")) return true;
    }
    return false;
  })).toBe(true);
});

test("manifiesto único, iconos y headers del worker", async ({ page, request }) => {
  await page.goto("/offline");
  await ready(page);
  await expect(page.locator('link[rel="manifest"]')).toHaveCount(1);
  const manifest = await (await request.get("/manifest.webmanifest")).json();
  expect(manifest.lang).toBe("es-MX");
  expect(manifest.start_url).toBe("/");
  expect(manifest.icons.filter((icon: { purpose: string }) => icon.purpose === "maskable")).toHaveLength(2);
  const worker = await request.get("/sw.js");
  expect(worker.headers()["cache-control"]).toContain("no-store");
  expect(worker.headers()["content-security-policy"]).not.toContain("unsafe-eval");
});

test("actualización silenciosa espera hasta cerrar todas las pestañas y conserva datos", async ({ page, context }) => {
  await page.goto("/catalogo");
  await ready(page);
  await expect.poll(() => countSaved(page)).toBe(24);
  await page.evaluate(() => { (window as Window & { pwaMarker?: string }).pwaMarker = "sin-recarga"; });
  const other = await context.newPage();
  await other.goto("http://localhost:3199/contactanos");
  await ready(other);
  await other.getByLabel("Nombre", { exact: true }).fill("Trabajo sin terminar");
  const workerPath = path.resolve("public/sw.js");
  const original = await readFile(workerPath, "utf8");
  const activationCache = `pwa-test-activation-${Date.now()}`;
  try {
    await page.evaluate(async () => { await caches.open("cemydi-public-images-v0"); });
    await writeFile(workerPath, `${original}\nself.addEventListener("activate", event => event.waitUntil(caches.open(${JSON.stringify(activationCache)})));\n`);
    await page.evaluate(async () => { await (await navigator.serviceWorker.getRegistration())?.update(); });
    await expect.poll(() => page.evaluate(async () => (await navigator.serviceWorker.getRegistration())?.waiting?.state)).toBe("installed");
    await expect(page.getByText("Nueva versión de CEMYDI disponible.")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Actualizar", exact: true })).toHaveCount(0);
    expect(await page.evaluate(() => (window as Window & { pwaMarker?: string }).pwaMarker)).toBe("sin-recarga");
    await expect(other.getByLabel("Nombre", { exact: true })).toHaveValue("Trabajo sin terminar");
    expect(await other.evaluate((name) => caches.has(name), activationCache)).toBe(false);
    await page.close();
    expect(await other.evaluate(async () => (await navigator.serviceWorker.getRegistration())?.waiting?.state)).toBe("installed");
    await expect(other.getByLabel("Nombre", { exact: true })).toHaveValue("Trabajo sin terminar");
    await other.close();
    const reopened = await context.newPage();
    await reopened.goto("http://localhost:3199/catalogo");
    await ready(reopened);
    await expect.poll(() => reopened.evaluate((name) => caches.has(name), activationCache)).toBe(true);
    await expect.poll(() => countSaved(reopened)).toBe(24);
    expect(await reopened.evaluate(() => caches.has("cemydi-public-images-v0"))).toBe(false);
    await expect(reopened.getByText("Nueva versión de CEMYDI disponible.")).toHaveCount(0);
  } finally { await writeFile(workerPath, original); }
});

test("la nueva versión se activa al cerrar y reabrir el navegador sin confirmación", async ({ playwright }) => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "cemydi-auto-update-"));
  let browser = await playwright.chromium.launchPersistentContext(directory, { headless: true });
  const workerPath = path.resolve("public/sw.js");
  const original = await readFile(workerPath, "utf8");
  const activationCache = `pwa-test-restart-${Date.now()}`;
  try {
    let page = await browser.newPage();
    await page.goto("http://localhost:3199/catalogo");
    await ready(page);
    await expect.poll(() => countSaved(page)).toBe(24);
    await writeFile(workerPath, `${original}\nself.addEventListener("activate", event => event.waitUntil(caches.open(${JSON.stringify(activationCache)})));\n`);
    await page.evaluate(async () => { await (await navigator.serviceWorker.getRegistration())?.update(); });
    await expect.poll(() => page.evaluate(async () => (await navigator.serviceWorker.getRegistration())?.waiting?.state)).toBe("installed");
    expect(await page.evaluate((name) => caches.has(name), activationCache)).toBe(false);
    await browser.close();
    browser = await playwright.chromium.launchPersistentContext(directory, { headless: true });
    page = await browser.newPage();
    await page.goto("http://localhost:3199/catalogo");
    await ready(page);
    await expect.poll(() => page.evaluate((name) => caches.has(name), activationCache)).toBe(true);
    await expect.poll(() => countSaved(page)).toBe(24);
    await expect(page.getByText("Nueva versión de CEMYDI disponible.")).toHaveCount(0);
  } finally { await browser.close(); await writeFile(workerPath, original); }
});

test("cuota transitoria permite un solo reintento y cuota permanente muestra aviso", async ({ page }) => {
  await page.addInitScript(() => {
    const put = IDBObjectStore.prototype.put;
    let attempts = 0;
    IDBObjectStore.prototype.put = function (...args: Parameters<IDBObjectStore["put"]>) {
      if (this.name === "products" && attempts++ === 0) throw new DOMException("Sin espacio", "QuotaExceededError");
      return put.apply(this, args);
    };
  });
  await page.goto("/catalogo");
  await ready(page);
  await expect.poll(() => countSaved(page)).toBe(24);
  await page.addInitScript(() => {
    const put = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function (...args: Parameters<IDBObjectStore["put"]>) {
      if (this.name === "products") throw new DOMException("Sin espacio", "QuotaExceededError");
      return put.apply(this, args);
    };
  });
  await page.goto("/catalogo?page=2");
  await expect(page.locator("article")).toHaveCount(24);
  await expect(page.getByText(/No se pudieron guardar los nuevos productos/)).toBeVisible();
  await expect.poll(() => countSaved(page)).toBe(24);
});

test("instalación nativa no se intercepta y no hay botón propio en desktop ni móvil", async ({ page }) => {
  await page.goto("/catalogo");
  await ready(page);
  expect(await page.evaluate(() => {
    const event = new Event("beforeinstallprompt", { cancelable: true });
    window.dispatchEvent(event);
    return event.defaultPrevented;
  })).toBe(false);
  await expect(page.getByRole("button", { name: "Instalar aplicación", exact: true })).toHaveCount(0);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Abrir menú", exact: true }).click();
  await expect(page.getByRole("button", { name: "Instalar aplicación", exact: true })).toHaveCount(0);
  for (const name of ["Inicio", "Catálogo", "Quiénes somos", "Contáctanos"]) await expect(page.getByRole("banner").getByRole("link", { name, exact: true })).toBeVisible();
});

test("reconecta sin presentar información comercial vieja y conserva imágenes públicas guardadas", async ({ page, context }) => {
  await page.goto("/catalogo");
  await ready(page);
  await expect.poll(() => countSaved(page)).toBe(24);
  await page.evaluate(() => new Promise<void>((resolve) => {
    const request = indexedDB.open("cemydi-public-offline");
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction("products", "readwrite");
      const store = transaction.objectStore("products");
      const value = store.get(1);
      value.onsuccess = () => store.put({ ...value.result, imageUrls: ["/icon-192.png"] });
      transaction.oncomplete = () => { db.close(); resolve(); };
    };
  }));
  await context.setOffline(true);
  await page.goto("/catalogo");
  await expect(page.getByRole("img", { name: "Producto 01", exact: true })).toBeVisible();
  await expect(page.getByText("Consultar disponibilidad y precio al reconectar")).toHaveCount(24);
  await context.setOffline(false);
  await expect(page.getByText("Consultar disponibilidad y precio al reconectar")).toHaveCount(0);
  await expect(page.locator("article")).toHaveCount(24);
  await expect(page.locator("body")).toContainText("$1,350");
});

test("persiste tras cerrar y reiniciar un navegador con el mismo perfil", async ({ playwright }) => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "cemydi-pwa-"));
  let browser = await playwright.chromium.launchPersistentContext(directory, { headless: true });
  try {
    let page = await browser.newPage();
    await page.goto("http://localhost:3199/catalogo");
    await ready(page);
    await expect.poll(() => countSaved(page)).toBe(24);
    await page.goto("http://localhost:3199/producto/producto-1");
    await expect(page.getByText("20 cm").first()).toBeVisible();
    await expect.poll(() => page.evaluate(() => new Promise<boolean>((resolve) => {
      const request = indexedDB.open("cemydi-public-offline");
      request.onsuccess = () => {
        const db = request.result;
        const value = db.transaction("products").objectStore("products").get(1);
        value.onsuccess = () => { db.close(); resolve(Boolean(value.result?.detail)); };
      };
    }))).toBe(true);
    await page.goto("http://localhost:3199/quienes-somos");
    await expect(page.getByText("Misión pública guardada")).toBeVisible();
    await page.goto("http://localhost:3199/contactanos");
    await expect.poll(() => page.evaluate(() => new Promise<boolean>((resolve) => {
      const request = indexedDB.open("cemydi-public-offline");
      request.onsuccess = () => {
        const db = request.result;
        const value = db.transaction("metadata").objectStore("metadata").get("contact-visited");
        value.onsuccess = () => { db.close(); resolve(value.result?.value === true); };
      };
    }))).toBe(true);
    await browser.close();
    browser = await playwright.chromium.launchPersistentContext(directory, { headless: true });
    await browser.setOffline(true);
    page = await browser.newPage();
    await page.goto("http://localhost:3199/catalogo");
    await expect(page.getByRole("heading", { name: "Catálogo de productos", exact: true })).toBeVisible();
    await expect(page.locator("article")).toHaveCount(24);
    for (const route of ["/producto/1", "/producto/producto-1"]) {
      await page.goto(`http://localhost:3199${route}`);
      await expect(page.getByRole("heading", { name: "Producto 01", exact: true })).toBeVisible();
      await expect(page.getByText("20 cm")).toBeVisible();
    }
    await page.goto("http://localhost:3199/quienes-somos");
    await expect(page.getByText("Misión pública guardada")).toBeVisible();
    await page.goto("http://localhost:3199/contactanos");
    await expect(page.getByRole("heading", { name: "Atención sin vueltas." })).toBeVisible();
    await expect(page.locator("iframe")).toHaveCount(0);
  } finally { await browser.close(); }
});

test("abre el inicio offline, navega por documentos y borra datos sin perder el respaldo esencial", async ({ page, context }) => {
  await page.goto("/catalogo");
  await ready(page);
  await expect.poll(() => countSaved(page)).toBe(24);
  await context.setOffline(true);
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Tu bienestar es nuestra prioridad", exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Explorar catálogo", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Catálogo de productos", exact: true })).toBeVisible();
  await page.goto("/offline");
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Borrar contenido guardado" }).click();
  await expect(page.getByText(/No hay productos guardados vigentes/)).toBeVisible();
  await expect.poll(() => countSaved(page)).toBe(0);
  await expect(page.getByRole("banner").getByRole("img", { name: "CEMYDI", exact: true })).toBeVisible();
});

test("conserva el header y las páginas públicas y avisa con toast al bloquear una ruta", async ({ page, context }) => {
  await page.goto("/catalogo");
  await ready(page);
  await expect.poll(() => countSaved(page)).toBe(24);
  const header = page.getByRole("banner");
  const onlineClass = await header.getAttribute("class");
  await context.setOffline(true);
  await page.goto("/catalogo");
  await expect(page.getByRole("heading", { name: "Catálogo de productos", exact: true })).toBeVisible();
  await expect(header).toHaveAttribute("class", onlineClass!);
  for (const name of ["Inicio", "Catálogo", "Quiénes somos", "Contáctanos"]) {
    await expect(header.getByRole("link", { name, exact: true })).toBeVisible();
  }
  await expect(page.locator("main")).not.toContainText("Sin conexión a Internet");
  await header.getByRole("link", { name: "Iniciar sesión", exact: true }).click();
  await expect(page).toHaveURL(/\/catalogo$/);
  await expect(page.getByText("Necesitas conexión a Internet para entrar a esta página.")).toBeVisible();
  await header.getByRole("link", { name: "Inicio", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Tu bienestar es nuestra prioridad", exact: true })).toBeVisible();
  await expect(page.locator("main")).not.toContainText("Sin conexión a Internet");
  await header.getByRole("link", { name: "Catálogo", exact: true }).click();
  await expect(page.locator("article")).toHaveCount(24);
});

test("conserva el menú móvil y el drawer de filtros sin conexión", async ({ page, context }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/catalogo");
  await ready(page);
  await expect.poll(() => countSaved(page)).toBe(24);
  await context.setOffline(true);
  await page.reload();
  const header = page.getByRole("banner");
  await header.getByRole("button", { name: "Abrir menú", exact: true }).click();
  for (const name of ["Inicio", "Catálogo", "Quiénes somos", "Contáctanos"]) {
    await expect(header.getByRole("link", { name, exact: true })).toBeVisible();
  }
  await header.getByRole("link", { name: "Contáctanos", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Atención sin vueltas." })).toBeVisible();
  await expect(page.locator("main")).not.toContainText("Sin conexión a Internet");
  await header.getByRole("button", { name: "Abrir menú", exact: true }).click();
  await header.getByRole("link", { name: "Catálogo", exact: true }).click();
  await page.locator("main").getByRole("button", { name: /Filtros/ }).click();
  const drawer = page.getByRole("dialog", { name: "Filtros", exact: true });
  await expect(drawer).toBeVisible();
  const closeFilters = drawer.getByRole("button", { name: "Cerrar", exact: true });
  await expect(closeFilters).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(drawer.getByRole("button", { name: "Ver 24 resultados", exact: true })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(closeFilters).toBeFocused();
  await drawer.getByRole("checkbox", { name: "Marca B", exact: true }).check();
  await drawer.getByRole("button", { name: "Ver 12 resultados", exact: true }).click();
  await expect(drawer).not.toBeVisible();
  await expect(page.locator("main").getByRole("button", { name: /Filtros/ })).toBeFocused();
  await expect(page.locator("article")).toHaveCount(12);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});


test("detalle básico avisa por toast y galería guardada conserva controles en móvil", async ({ page, context }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/catalogo");
  await ready(page);
  await expect.poll(() => countSaved(page)).toBe(24);
  await page.evaluate(async () => {
    const cache = await caches.open("cemydi-public-images-v1");
    for (const url of ["/icon-192.png", "/icon-512.png"]) await cache.put(url, await fetch(url));
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.open("cemydi-public-offline");
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction("products", "readwrite");
        const store = transaction.objectStore("products");
        const value = store.get(1);
        value.onsuccess = () => store.put({ ...value.result, imageUrls: ["/icon-192.png", "/icon-512.png"] });
        transaction.oncomplete = () => { db.close(); resolve(); };
      };
    });
  });
  await context.setOffline(true);
  await page.goto("/producto/1");
  await expect(page.getByRole("heading", { name: "Producto 01", exact: true })).toBeVisible();
  await expect(page.locator('[data-rht-toaster]').getByText(/Solo está guardada la ficha básica/)).toBeVisible();
  await expect(page.locator("main").getByText(/Solo está guardada la ficha básica/)).toHaveCount(0);
  await expect(page.getByText("1 de 2 imágenes")).toBeVisible();
  const galleryBox = await page.getByRole("button", { name: "Ampliar imagen del producto", exact: true }).boundingBox();
  expect(galleryBox?.height).toBeGreaterThanOrEqual(360);
  await page.getByRole("button", { name: "Imagen siguiente", exact: true }).click();
  await expect(page.getByText("2 de 2 imágenes")).toBeVisible();
  await page.getByRole("button", { name: "Ampliar imagen del producto", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("dialog").getByRole("img", { name: "Producto 01", exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  await expect(page.getByRole("button", { name: "Agregar al carrito" })).toHaveCount(0);
});


test("prepara las 24 fotos de la página inicial sin depender de scroll o del primer render", async ({ page, context, request }) => {
  await request.get("http://127.0.0.1:4199/__test/images?on=1");
  await page.goto("/catalogo");
  await ready(page);
  await expect.poll(() => countSaved(page)).toBe(24);
  // These unique URLs were not rendered/requested before worker activation.
  // PUBLIC_IMAGES must fetch all of them, including those below the fold.
  await expect.poll(() => page.evaluate(async () => {
    const cache = await caches.open("cemydi-public-images-v1");
    const keys = await cache.keys();
    return keys.filter((key) => new URL(key.url).searchParams.has("product")).length;
  }), { timeout: 15000 }).toBe(24);
  await expect(page.getByText(/Ficha guardada para consultar sin conexión/)).toHaveCount(0);
  await context.setOffline(true);
  await page.goto("/catalogo");
  await expect(page.locator("main article img")).toHaveCount(24);
  await expect(page.getByText("Imagen no disponible sin conexión", { exact: true })).toHaveCount(0);
  await expect(page.locator('[data-rht-toaster]').getByText("Sin conexión", { exact: true })).toBeVisible();
  const wifi = page.locator('[data-rht-toaster] .lucide-wifi-off');
  await expect(wifi).toHaveCount(1);
  await expect(wifi).toHaveClass(/text-red-600/);
  await expect(page.locator("main article img").first()).toBeVisible();
  await page.locator("main article img").last().scrollIntoViewIfNeeded();
  await expect(page.locator("main article img").last()).toBeVisible();
  await expect.poll(() => page.locator("main article img").evaluateAll((images) => images.every((image) => image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0))).toBe(true);
});

import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdir, writeFile, readFile } from "node:fs/promises";

const out = "docs/evidencias/actividad-6";
await mkdir(out, { recursive: true });
const base = "http://localhost:3001";
const results = { date: new Date().toISOString(), base, backend: "http://127.0.0.1:4000", mocks: false, checks: [], errors: [] };
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
const page = await context.newPage();
page.on("pageerror", (error) => results.errors.push(error.message));
async function check(name, run) {
  try { const detail = await run(); results.checks.push({ name, passed: true, detail }); }
  catch (error) { results.checks.push({ name, passed: false, error: error.message }); }
  await writeFile(`${out}/navegador-real.json`, JSON.stringify(results, null, 2));
}
await check("HTTP real y PostgreSQL por API", async () => {
  const response = await fetch(`${results.backend}/products?page=1&pageSize=24`);
  const data = await response.json();
  assert.equal(response.status, 200);
  assert.ok(data.products.length);
  results.product = { id: data.products[0].id, nombre: data.products[0].nombre, slug: data.products[0].slug };
  return { method: "GET", endpoint: "/products?page=1&pageSize=24", status: response.status, count: data.products.length, total: data.pagination.total };
});
await check("Home móvil y Service Worker", async () => {
  await page.goto(base);
  await page.getByRole("heading", { name: "Tu bienestar es nuestra prioridad" }).waitFor();
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await page.screenshot({ path: `${out}/figura-01-inicio-movil.png` });
  return page.evaluate(() => ({ worker: navigator.serviceWorker.controller.scriptURL, width: innerWidth, contentWidth: document.documentElement.scrollWidth }));
});
await check("Manifiesto e iconos servidos", async () => {
  const response = await context.request.get(`${base}/manifest.webmanifest`);
  const manifest = await response.json();
  assert.equal(manifest.display, "standalone");
  for (const icon of manifest.icons) {
    const response = await context.request.get(base + icon.src);
    assert.equal(response.status(), 200);
  }
  await writeFile(`${out}/manifest-verificado.json`, JSON.stringify(manifest, null, 2));
  const manifestPage = await context.newPage();
  await manifestPage.setViewportSize({ width: 640, height: 500 });
  await manifestPage.goto(`${base}/manifest.webmanifest`);
  await manifestPage.screenshot({ path: `${out}/figura-02-manifiesto-servido.png` });
  await manifestPage.close();
  return { status: response.status(), display: manifest.display, icons: manifest.icons, physicalDevice: false };
});
await check("Carga de catálogo con red lenta real emulada por CDP", async () => {
  const slow = await context.newPage();
  await slow.setViewportSize({ width: 1280, height: 900 });
  const cdp = await context.newCDPSession(slow);
  await cdp.send("Network.enable");
  await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 1500, downloadThroughput: 60 * 1024, uploadThroughput: 30 * 1024 });
  const navigation = slow.goto(`${base}/catalogo`, { waitUntil: "load", timeout: 120000 });
  // No DOM edits, delayed fixtures or fake responses: capture the actual fallback.
  await slow.getByText("Cargando productos…", { exact: true }).waitFor({ timeout: 45000 });
  await slow.screenshot({ path: `${out}/figura-03-carga-catalogo-red-lenta.png` });
  await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
  await navigation;
  await slow.close();
  return { latency: 1500, downloadBytesPerSecond: 61440, responseMocking: false };
});
await check("SSR comprobado en HTML HTTP y límite sin JavaScript", async () => {
  const rawResponse = await fetch(`${base}/catalogo`);
  const rawHtml = await rawResponse.text();
  const serverHtml = rawHtml.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
  assert.ok(serverHtml.includes(results.product.nombre));
  await writeFile(`${out}/ssr-html-sin-scripts.txt`, serverHtml);
  const nojs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 1000 }, serviceWorkers: "block" });
  const serverPage = await nojs.newPage();
  const response = await serverPage.goto(`${base}/catalogo`);
  assert.equal(response.status(), 200);
  const visibleWithoutJavascript = await serverPage.getByRole("heading", { name: results.product.nombre, exact: true }).first().isVisible();
  await serverPage.screenshot({ path: `${out}/limite-streaming-sin-javascript.png` });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${base}/catalogo`);
  await page.getByRole("heading", { name: results.product.nombre, exact: true }).first().waitFor();
  await page.screenshot({ path: `${out}/figura-04-catalogo-renderizado.png` });
  await page.setViewportSize({ width: 390, height: 844 });
  await writeFile(`${out}/componente-servidor.txt`, await readFile("src/app/catalogo/page.tsx", "utf8"));
  await nojs.close();
  return { status: rawResponse.status, productOutsideScripts: true, visibleWithoutJavascript, note: "El HTML incluye el producto; el streaming de Suspense necesita JavaScript para revelar el segmento en este navegador. La captura principal usa hidratación normal." };
});
await check("CSR búsqueda funcional", async () => {
  await page.goto(`${base}/catalogo`);
  const search = page.locator("main").getByRole("searchbox");
  await search.fill(results.product.nombre);
  await page.locator("main").getByRole("button", { name: "Buscar", exact: true }).click();
  await page.waitForURL(/q=/);
  await page.getByRole("heading", { name: results.product.nombre, exact: true }).first().waitFor();
  await page.screenshot({ path: `${out}/figura-05-busqueda-cliente.png` });
  await writeFile(`${out}/componente-cliente.txt`, await readFile("src/app/catalogo/components/CatalogClient.tsx", "utf8"));
  return { url: page.url(), query: results.product.nombre };
});
await check("IndexedDB y Cache Storage reales", async () => {
  await page.goto(`${base}/catalogo`);
  await page.waitForFunction(async () => {
    if (!(await indexedDB.databases()).some(db => db.name === "cemydi-public-offline")) return false;
    return new Promise(resolve => {
      const request = indexedDB.open("cemydi-public-offline", 1);
      request.onsuccess = () => {
        const db = request.result;
        const count = db.transaction("products").objectStore("products").count();
        count.onsuccess = () => { db.close(); resolve(count.result > 0); };
      };
    });
  });
  const storage = await page.evaluate(async () => {
    const db = await new Promise((resolve, reject) => { const r = indexedDB.open("cemydi-public-offline", 1); r.onsuccess = () => resolve(r.result); r.onerror = () => reject(r.error); });
    const products = await new Promise(resolve => { const r = db.transaction("products").objectStore("products").getAll(); r.onsuccess = () => resolve(r.result); });
    db.close();
    const cacheEntries = {};
    for (const name of await caches.keys()) { cacheEntries[name] = (await (await caches.open(name)).keys()).map(r => r.url); }
    return { worker: navigator.serviceWorker.controller?.scriptURL, products, cacheEntries, localStorageKeys: Object.keys(localStorage) };
  });
  assert.ok(storage.products.length);
  assert.ok(storage.products.every(p => !("precio" in p) && !("stock" in p) && !("proveedor" in p)));
  assert.ok(Object.values(storage.cacheEntries).flat().every(url => !/\/(users|auth|cart|admin)(\/|\?|$)/.test(new URL(url).pathname)));
  await writeFile(`${out}/almacenamiento-real.json`, JSON.stringify(storage, null, 2));
  return { savedProducts: storage.products.length, cachedResources: Object.values(storage.cacheEntries).flat().length, localStorageKeys: storage.localStorageKeys, sensitiveCommercialFields: false };
});
await check("HTTP backend visible en navegador", async () => {
  const apiPage = await context.newPage();
  await apiPage.setViewportSize({ width: 640, height: 500 });
  const response = await apiPage.goto(`${base}/api/products?page=1&pageSize=1`);
  assert.equal(response.status(), 200);
  await apiPage.screenshot({ path: `${out}/figura-08-respuesta-http-backend.png` });
  await writeFile(`${out}/http-backend.json`, JSON.stringify({ method: "GET", url: response.url(), status: response.status(), contentType: response.headers()["content-type"], upstream: `${results.backend}/products?page=1&pageSize=1` }, null, 2));
  await apiPage.close();
  return { method: "GET", url: response.url(), status: response.status() };
});
await check("Detalle previamente visitado offline", async () => {
  const path = `/producto/${results.product.slug || results.product.id}`;
  await page.goto(base + path);
  await page.getByRole("heading", { name: results.product.nombre, exact: true }).first().waitFor();
  await page.waitForFunction(() => new Promise(resolve => {
    const r = indexedDB.open("cemydi-public-offline", 1);
    r.onsuccess = () => { const db = r.result; const all = db.transaction("products").objectStore("products").getAll(); all.onsuccess = () => { db.close(); resolve(all.result.some(p => p.detail)); }; };
  }));
  await context.setOffline(true);
  await page.goto(base + path);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.getByRole("heading", { name: results.product.nombre, exact: true }).first().waitFor();
  await page.getByText("Consultar disponibilidad y precio al reconectar").first().waitFor();
  await page.screenshot({ path: `${out}/figura-09-detalle-sin-conexion.png` });
  await page.setViewportSize({ width: 390, height: 844 });
  return { path, offline: await page.evaluate(() => !navigator.onLine), commercialDataHidden: true };
});
await check("Catálogo offline y recuperación de conexión", async () => {
  await context.setOffline(true);
  await page.goto(`${base}/catalogo`);
  await page.getByText("Consultar disponibilidad y precio al reconectar").first().waitFor();
  await page.screenshot({ path: `${out}/figura-09b-catalogo-sin-conexion.png` });
  await context.setOffline(false);
  await page.waitForFunction(() => !document.body.innerText.includes("Consultar disponibilidad y precio al reconectar"), { timeout: 30000 });
  await page.getByRole("heading", { name: results.product.nombre, exact: true }).first().waitFor();
  await page.screenshot({ path: `${out}/reconexion-catalogo.png` });
  return { online: await page.evaluate(() => navigator.onLine), savedPresentationReplaced: true };
});
await check("Escritorio sin desbordamiento", async () => {
  await context.setOffline(false);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${base}/catalogo`);
  await page.getByRole("heading", { name: results.product.nombre, exact: true }).first().waitFor();
  const dimensions = await page.evaluate(() => ({ viewport: innerWidth, content: document.documentElement.scrollWidth }));
  assert.ok(dimensions.content <= dimensions.viewport);
  await page.screenshot({ path: `${out}/catalogo-escritorio.png` });
  return dimensions;
});
await browser.close();
await writeFile(`${out}/navegador-real.json`, JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
if (results.checks.some(c => !c.passed) || results.errors.length) process.exitCode = 1;

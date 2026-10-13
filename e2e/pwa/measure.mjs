import { chromium } from "@playwright/test";
import { spawn, spawnSync } from "node:child_process";
import { writeFile, open } from "node:fs/promises";
import path from "node:path";

const fixture = spawn(process.execPath, ["e2e/pwa/server.mjs"], { stdio: "ignore" });
const baseline = spawn(process.execPath, [path.resolve("node_modules/next/dist/bin/next"), "start", "--port", "3299"], {
  cwd: "output/pwa-baseline-20261011",
  env: { ...process.env, INTERNAL_API_URL: "http://127.0.0.1:4199" },
  stdio: "ignore",
});
async function waitServer(url) {
  for (let attempt = 0; attempt < 150; attempt++) {
    try { if ((await fetch(url)).ok) return; } catch { /* Server starting. */ }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error(`No se pudo iniciar ${url}`);
}
let browser;
try {
  await Promise.all([waitServer("http://localhost:3199/offline"), waitServer("http://localhost:3299/quienes-somos")]);
  browser = await chromium.launch({ headless: true });
  const results = { baseline: [], pwa: [] };
  for (let iteration = 0; iteration < 3; iteration++) {
    for (const [name, port] of [["baseline", 3299], ["pwa", 3199]]) {
      const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      const page = await context.newPage();
      await page.addInitScript(() => {
        window.pwaMetrics = { lcp: 0, cls: 0 };
        new PerformanceObserver((list) => { window.pwaMetrics.lcp = list.getEntries().at(-1)?.startTime ?? 0; }).observe({ type: "largest-contentful-paint", buffered: true });
        new PerformanceObserver((list) => { for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.pwaMetrics.cls += entry.value; }).observe({ type: "layout-shift", buffered: true });
      });
      await page.goto(`http://localhost:${port}/quienes-somos`);
      await page.waitForFunction(() => {
        const heading = document.querySelector("h1");
        return heading && Number(getComputedStyle(heading).opacity) === 1;
      });
      const metrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType("navigation")[0];
        const resources = performance.getEntriesByType("resource");
        return { ...window.pwaMetrics, domContentLoaded: navigation.domContentLoadedEventEnd, documentBytes: navigation.transferSize, resourceBytes: resources.reduce((sum, resource) => sum + resource.transferSize, 0), jsBytes: resources.filter((resource) => resource.name.includes(".js")).reduce((sum, resource) => sum + resource.transferSize, 0) };
      });
      results[name].push(metrics);
      await context.close();
    }
  }
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto("http://localhost:3199/catalogo");
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await page.waitForFunction(() => new Promise((resolve) => {
    const request = indexedDB.open("cemydi-public-offline");
    request.onsuccess = () => { const db = request.result; const count = db.transaction("products").objectStore("products").count(); count.onsuccess = () => { db.close(); resolve(count.result === 24); }; };
  }));
  const storedBytes = await page.evaluate(() => new Promise((resolve) => {
    const request = indexedDB.open("cemydi-public-offline");
    request.onsuccess = () => { const db = request.result; const all = db.transaction("products").objectStore("products").getAll(); all.onsuccess = () => { db.close(); resolve(new Blob([JSON.stringify(all.result)]).size); }; };
  }));
  await context.setOffline(true);
  await page.goto("http://localhost:3199/catalogo");
  await page.waitForSelector("article");
  const visuals = [];
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    const file = `docs/qa/pwa-${viewport.width === 390 ? "mobile" : "desktop"}.png`;
    await page.screenshot({ path: file, fullPage: false });
    visuals.push({ viewport, overflow, file });
  }
  await writeFile("docs/qa/PWA_PERFORMANCE.json", JSON.stringify({ scope: "Quiénes somos, producción local, tres contextos fríos por variante, sin throttling. Baseline reconstruida para esta ruta; no equivale a benchmark de todos los flujos.", results, storedBytesFor24FixtureProducts: storedBytes, visuals }, null, 2));
  console.log(JSON.stringify({ results, storedBytesFor24FixtureProducts: storedBytes, visuals }));
  await context.close();
  const baselineLog = await open("pwa-existing-baseline-e2e.log", "w");
  try {
    const check = spawnSync(process.execPath, ["node_modules/@playwright/test/cli.js", "test", "e2e/home.spec.ts", "e2e/hydration.spec.ts"], {
      env: { ...process.env, CI: "1", PLAYWRIGHT_BASE_URL: "http://localhost:3299" },
      stdio: ["ignore", baselineLog.fd, baselineLog.fd],
    });
    console.log(`Existing hero tests against pre-PWA reference: exit ${check.status}`);
  } finally { await baselineLog.close(); }
} finally {
  await browser?.close();
  fixture.kill();
  baseline.kill();
}

import { maintainProducts, mergeProducts, toOfflineProduct, type OfflineProduct, OFFLINE_TTL } from "./products";
import type { CatalogProduct } from "@/services/catalog";
import { aboutPageContentSchema } from "@/lib/schemas/about-page";
import type { AboutPageContent } from "@/services/about-page";
import type { CatalogAppliedParams } from "@/app/catalogo/utils/catalog-params";
import { catalogOrderKey, parseOfflineCatalogOrders } from "./catalog-order";
import { z } from "@/lib/zod";

export const OFFLINE_DB = "cemydi-public-offline";
// Details and aliases belong to their product record: eviction is atomic and
// cannot leave orphan aliases/details. Shared image caches have their own TTL.
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") { reject(new Error("El almacenamiento offline no está disponible.")); return; }
    const request = indexedDB.open(OFFLINE_DB, 1);
    let settled = false;
    const fail = () => { settled = true; reject(new Error("No se pudo abrir el almacenamiento offline.")); };
    const timer = setTimeout(fail, 2500);
    request.onblocked = () => { clearTimeout(timer); fail(); };
    request.onerror = () => { clearTimeout(timer); fail(); };
    request.onupgradeneeded = () => {
      if (settled) { request.transaction?.abort(); return; }
      request.result.createObjectStore("products", { keyPath: "id" });
      request.result.createObjectStore("metadata", { keyPath: "key" });
    };
    request.onsuccess = () => {
      clearTimeout(timer);
      if (settled) { request.result.close(); return; }
      settled = true;
      request.result.onversionchange = () => request.result.close();
      resolve(request.result);
    };
  });
}

async function withDatabase<T>(operation: (db: IDBDatabase) => Promise<T>): Promise<T> {
  const db = await openDatabase();
  try { return await operation(db); }
  finally { db.close(); }
}

async function changeProducts(change: (products: OfflineProduct[]) => OfflineProduct[]) {
  return withDatabase((db) => new Promise<OfflineProduct[]>((resolve, reject) => {
    const transaction = db.transaction("products", "readwrite");
    const store = transaction.objectStore("products");
    let products: OfflineProduct[] = [];
    let failure: unknown;
    const request = store.getAll();
    request.onsuccess = () => {
      try {
        products = change(maintainProducts(request.result));
        store.clear();
        for (const product of products) store.put(product);
      } catch (error) { failure = error; transaction.abort(); }
    };
    transaction.oncomplete = () => resolve(products);
    // The abort event has the final error (including QuotaExceededError).
    // Rejecting at the earlier bubbling request error can lose that cause.
    transaction.onabort = () => reject(failure ?? transaction.error ?? new Error("No se pudo guardar el contenido offline."));
  }));
}
export async function getOfflineProducts(): Promise<OfflineProduct[]> {
  const raw = await withDatabase((db) => new Promise<unknown[]>((resolve, reject) => {
    const transaction = db.transaction("products", "readonly");
    const request = transaction.objectStore("products").getAll();
    transaction.oncomplete = () => resolve(request.result);
    transaction.onabort = () => reject(transaction.error ?? new Error("No se pudo leer el catálogo guardado."));
  }));
  const valid = maintainProducts(raw);
  // A full quota must not prevent reading already saved products. Maintenance
  // failures do not make expired/incompatible records visible again.
  let needsMaintenance = true;
  try { needsMaintenance = JSON.stringify(raw) !== JSON.stringify(valid); }
  catch { /* Structured-clone data may contain cycles or unsupported JSON values. */ }
  if (needsMaintenance) {
    try { await changeProducts((products) => products); } catch { /* Retry maintenance on the next access. */ }
  }
  return valid;
}
export const removeOfflineProduct = (id: number) => changeProducts((products) => products.filter((product) => product.id !== id));
export async function saveOfflineProducts(products: CatalogProduct[], details = false, alias?: string) {
  const incoming = products.filter((product) => product.activo).map((product) => toOfflineProduct(product, details, alias));
  const inactiveIds = new Set(products.filter((product) => !product.activo).map((product) => product.id));
  const merge = (existing: OfflineProduct[]) => mergeProducts(existing.filter((product) => !inactiveIds.has(product.id)), incoming);
  try { await changeProducts(merge); }
  catch (error) {
    if (!(error instanceof DOMException) || error.name !== "QuotaExceededError") throw error;
    // Remove inactive products atomically, including when the first write fails.
    await changeProducts((existing) => existing.filter((product) => !inactiveIds.has(product.id)).slice(0, Math.max(0, existing.length - 20)));
    await changeProducts(merge);
  }
  registerPublicImages(incoming.flatMap((product) => details ? product.imageUrls : product.imageUrls.slice(0, 1)));
}

async function metadata<T>(key: string, write?: T): Promise<unknown> {
  return withDatabase((db) => new Promise<unknown>((resolve, reject) => {
    const transaction = db.transaction("metadata", write === undefined ? "readonly" : "readwrite");
    const store = transaction.objectStore("metadata");
    const request = write === undefined ? store.get(key) : store.put({ key, value: write });
    transaction.oncomplete = () => {
      const record: unknown = request.result;
      resolve(write === undefined ? (record && typeof record === "object" && "value" in record ? record.value : undefined) : write);
    };
    transaction.onabort = () => reject(transaction.error ?? new Error("No se pudo acceder al contenido informativo guardado."));
  }));
}
export async function saveOfflineAbout(content: AboutPageContent) {
  await metadata("about", { content: aboutPageContentSchema.parse(content), updatedAt: Date.now() });
  registerPublicImages([content.heroImageUrl, content.secondaryImageUrl].filter((value): value is string => Boolean(value)));
}
export async function getOfflineCatalogOrders() {
  return parseOfflineCatalogOrders(await metadata("catalog-orders"));
}
export async function saveOfflineCatalogOrder(products: CatalogProduct[], filters: CatalogAppliedParams) {
  // Read and merge in one transaction so simultaneous tabs cannot lose pages.
  await withDatabase((db) => new Promise<void>((resolve, reject) => {
    const transaction = db.transaction("metadata", "readwrite");
    const store = transaction.objectStore("metadata");
    const request = store.get("catalog-orders");
    let failure: unknown;
    request.onsuccess = () => {
      try {
        const orders = parseOfflineCatalogOrders(request.result?.value);
        const key = catalogOrderKey(filters);
        const pages = { ...orders[key]?.pages, [String(filters.page)]: products.filter((product) => product.activo).map((product) => product.id) };
        // Bound references to the capacity of the 200-product offline catalog.
        const boundedPages = Object.fromEntries(Object.entries(pages).sort(([a], [b]) => Number(a) - Number(b)).slice(0, 9));
        store.put({ key: "catalog-orders", value: parseOfflineCatalogOrders({ ...orders, [key]: { updatedAt: Date.now(), pages: boundedPages } }) });
      } catch (error) { failure = error; transaction.abort(); }
    };
    transaction.oncomplete = () => resolve();
    transaction.onabort = () => reject(failure ?? transaction.error ?? new Error("No se pudo guardar el orden del catálogo."));
  }));
}
const pendingImages: { urls: Set<string>; cleanup?: () => void } = { urls: new Set() };
function flushPublicImages() {
  const worker = navigator.serviceWorker.controller;
  if (!worker) return false;
  try { worker.postMessage({ type: "PUBLIC_IMAGES", urls: [...pendingImages.urls] }); }
  catch { return false; } // A replacement controller may still accept the queue.
  pendingImages.cleanup?.();
  pendingImages.urls.clear();
  return true;
}
function registerPublicImages(urls: string[]) {
  if (process.env.NODE_ENV !== "production" || typeof navigator === "undefined" || !("serviceWorker" in navigator) || !urls.length) return;
  // ready never rejects when installation fails. Keep a single, bounded queue
  // instead of retaining one promise/payload per save. Slow installs still work.
  for (const url of urls) {
    pendingImages.urls.delete(url);
    pendingImages.urls.add(url);
    if (pendingImages.urls.size > 120) pendingImages.urls.delete(pendingImages.urls.values().next().value!);
  }
  if (flushPublicImages() || pendingImages.cleanup) return;
  const workers = navigator.serviceWorker;
  const cleanup = () => {
    workers.removeEventListener("controllerchange", flushPublicImages);
    window.removeEventListener("pagehide", cleanup);
    pendingImages.urls.clear();
    pendingImages.cleanup = undefined;
  };
  pendingImages.cleanup = cleanup;
  workers.addEventListener("controllerchange", flushPublicImages);
  window.addEventListener("pagehide", cleanup, { once: true });
  flushPublicImages();
}

function clearWorkerImages(worker: ServiceWorker): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const channel = new MessageChannel();
    const finish = (handled: boolean, failed = false) => {
      clearTimeout(timer);
      channel.port1.close();
      channel.port2.close();
      if (failed) reject(new Error("No se pudieron borrar las imágenes guardadas."));
      else resolve(handled);
    };
    // Older active workers do not know this message. Retain the native cleanup
    // fallback while a new version waits for existing clients to close.
    const timer = setTimeout(() => finish(false), 3_000);
    channel.port1.onmessage = (event: MessageEvent<unknown>) => {
      const value = event.data;
      if (value && typeof value === "object" && "success" in value && typeof value.success === "boolean") finish(true, !value.success);
    };
    channel.port1.onmessageerror = () => finish(false);
    try { worker.postMessage({ type: "CLEAR_PUBLIC_IMAGES" }, [channel.port2]); }
    catch { finish(false); }
  });
}
const offlineAboutSchema = z.object({
  content: aboutPageContentSchema,
  updatedAt: z.number().finite().nonnegative(),
});
export async function getOfflineAbout(): Promise<{ content: AboutPageContent; updatedAt: number } | null> {
  const value = await metadata("about");
  const parsed = offlineAboutSchema.safeParse(value);
  const now = Date.now();
  if (!parsed.success || parsed.data.updatedAt > now || now - parsed.data.updatedAt >= OFFLINE_TTL) {
    // Failed housekeeping must not hide other valid public content on a full
    // disk. Invalid or expired data is never returned, even if cleanup fails.
    if (value !== undefined && value !== null) {
      try { await metadata("about", null); } catch { /* Retry on the next access. */ }
    }
    return null;
  }
  return parsed.data;
}
export const markContactVisited = () => metadata("contact-visited", true);
export const wasContactVisited = async () => (await metadata("contact-visited")) === true;
export async function clearOfflineContent() {
  pendingImages.cleanup?.();
  pendingImages.urls.clear();
  await withDatabase((db) => new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(["products", "metadata"], "readwrite");
    transaction.objectStore("products").clear();
    transaction.objectStore("metadata").clear();
    transaction.oncomplete = () => resolve();
    transaction.onabort = () => reject(transaction.error ?? new Error("No se pudo borrar el contenido guardado."));
  }));
  const worker = typeof navigator !== "undefined" && "serviceWorker" in navigator ? navigator.serviceWorker.controller : null;
  if (worker && typeof MessageChannel !== "undefined" && await clearWorkerImages(worker)) return;
  if (typeof caches !== "undefined") await caches.delete("cemydi-public-images-v1");
}

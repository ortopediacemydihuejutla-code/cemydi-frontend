import { maintainProducts, mergeProducts, toOfflineProduct, type OfflineProduct, OFFLINE_TTL } from "./products";
import type { CatalogProduct } from "@/services/catalog";
import { aboutPageContentSchema } from "@/lib/schemas/about-page";
import type { AboutPageContent } from "@/services/about-page";

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
      request.result.createObjectStore("products", { keyPath: "id" });
      request.result.createObjectStore("metadata", { keyPath: "key" });
    };
    request.onsuccess = () => {
      clearTimeout(timer);
      if (settled) { request.result.close(); return; }
      request.result.onversionchange = () => request.result.close();
      resolve(request.result);
    };
  });
}

async function changeProducts(change: (products: OfflineProduct[]) => OfflineProduct[]) {
  const db = await openDatabase();
  return new Promise<OfflineProduct[]>((resolve, reject) => {
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
    transaction.oncomplete = () => { db.close(); resolve(products); };
    transaction.onabort = transaction.onerror = () => { db.close(); reject(failure ?? transaction.error ?? new Error("No se pudo guardar el contenido offline.")); };
  });
}
export async function getOfflineProducts(): Promise<OfflineProduct[]> {
  const db = await openDatabase();
  const raw = await new Promise<unknown[]>((resolve, reject) => {
    const transaction = db.transaction("products", "readonly");
    const request = transaction.objectStore("products").getAll();
    transaction.oncomplete = () => { db.close(); resolve(request.result); };
    transaction.onabort = transaction.onerror = () => { db.close(); reject(new Error("No se pudo leer el catálogo guardado.")); };
  });
  const valid = maintainProducts(raw);
  // A full quota must not prevent reading already saved products. Maintenance
  // failures do not make expired/incompatible records visible again.
  if (JSON.stringify(raw) !== JSON.stringify(valid)) {
    try { await changeProducts((products) => products); } catch { /* Retry maintenance on the next access. */ }
  }
  return valid;
}
export const removeOfflineProduct = (id: number) => changeProducts((products) => products.filter((product) => product.id !== id));
export async function saveOfflineProducts(products: CatalogProduct[], details = false, alias?: string) {
  const incoming = products.filter((product) => product.activo).map((product) => toOfflineProduct(product, details, alias));
  try { await changeProducts((existing) => mergeProducts(existing, incoming)); }
  catch (error) {
    if (!(error instanceof DOMException) || error.name !== "QuotaExceededError") throw error;
    await changeProducts((existing) => existing.slice(0, Math.max(0, existing.length - 20)));
    await changeProducts((existing) => mergeProducts(existing, incoming));
  }
  for (const product of products.filter((product) => !product.activo)) await removeOfflineProduct(product.id);
  registerPublicImages(incoming.flatMap((product) => details ? product.imageUrls : product.imageUrls.slice(0, 1)));
}

async function metadata<T>(key: string, write?: T): Promise<unknown> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("metadata", write === undefined ? "readonly" : "readwrite");
    const store = transaction.objectStore("metadata");
    const request = write === undefined ? store.get(key) : store.put({ key, value: write });
    transaction.oncomplete = () => { db.close(); resolve(write === undefined ? request.result?.value : write); };
    transaction.onabort = transaction.onerror = () => { db.close(); reject(new Error("El contenido informativo no se pudo guardar.")); };
  });
}
export async function saveOfflineAbout(content: AboutPageContent) {
  await metadata("about", { content: aboutPageContentSchema.parse(content), updatedAt: Date.now() });
  registerPublicImages([content.heroImageUrl, content.secondaryImageUrl].filter((value): value is string => Boolean(value)));
}
function registerPublicImages(urls: string[]) {
  if (typeof navigator !== "undefined" && "serviceWorker" in navigator) void navigator.serviceWorker.ready.then((registration) => registration.active?.postMessage({ type: "PUBLIC_IMAGES", urls })).catch(() => {});
}
export async function getOfflineAbout(): Promise<{ content: AboutPageContent; updatedAt: number } | null> {
  const value = await metadata("about");
  if (!value || typeof value !== "object" || !("content" in value) || !("updatedAt" in value) || typeof value.updatedAt !== "number" || value.updatedAt > Date.now() || Date.now() - value.updatedAt >= OFFLINE_TTL) {
    if (value) await metadata("about", null);
    return null;
  }
  const parsed = aboutPageContentSchema.safeParse(value.content);
  if (!parsed.success) { await metadata("about", null); return null; }
  return { content: parsed.data, updatedAt: value.updatedAt };
}
export const markContactVisited = () => metadata("contact-visited", true);
export const wasContactVisited = async () => (await metadata("contact-visited")) === true;
export async function clearOfflineContent() {
  const db = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(["products", "metadata"], "readwrite");
    transaction.objectStore("products").clear();
    transaction.objectStore("metadata").clear();
    transaction.oncomplete = () => { db.close(); resolve(); };
    transaction.onabort = transaction.onerror = () => { db.close(); reject(new Error("No se pudo borrar el contenido guardado.")); };
  });
  if (typeof caches !== "undefined") await caches.delete("cemydi-public-images-v1");
}

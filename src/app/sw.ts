/// <reference lib="webworker" />
import { ExpirationPlugin, Serwist, StaleWhileRevalidate, type HandlerCallbackOptions, type PrecacheEntry, type SerwistGlobalConfig } from "serwist";
import { getPublicImageCacheUrl, isOfflinePublicPath, isUsableOfflineImage, OFFLINE_IMAGE_SAVED_AT, OFFLINE_TTL } from "@/lib/pwa/policy";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}
declare const self: ServiceWorkerGlobalScope;
const validResponse = {
  cacheWillUpdate: async ({ response }: { response: Response }) => {
    if (!isUsableOfflineImage(response, false)) return null;
    const headers = new Headers(response.headers);
    headers.set(OFFLINE_IMAGE_SAVED_AT, String(Date.now()));
    // OfflineImage reads blobs directly, bypassing ExpirationPlugin callbacks.
    // Preserve a local write timestamp so that path enforces the same TTL.
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
  },
};
const publicImages = new StaleWhileRevalidate({ cacheName: "cemydi-public-images-v1", plugins: [validResponse, new ExpirationPlugin({ maxEntries: 120, maxAgeSeconds: OFFLINE_TTL / 1000, purgeOnQuotaError: true })] });
const imageDownloads = new Map<string, Promise<void>>();
let imageMaintenance: Promise<void> = Promise.resolve();
let imageGeneration = 0;
let imageRequests = new AbortController();

async function prepareImages(urls: string[], event: ExtendableMessageEvent) {
  const generation = imageGeneration;
  await imageMaintenance;
  if (generation !== imageGeneration) return;
  const pending = [...new Set(urls.map((value) => getPublicImageCacheUrl(value, self.location.origin)).filter((value): value is string => value !== null))].slice(0, 120);
  // A rendered image may have loaded before the worker controlled the page,
  // before PUBLIC_IMAGES arrived, or only into the browser's HTTP cache.
  // Prepare one bounded-size public copy without depending on another render.
  await Promise.all(Array.from({ length: Math.min(4, pending.length) }, async () => {
    while (pending.length && generation === imageGeneration) {
      const url = pending.shift()!;
      try {
        const essential = new URL(url);
        essential.search = "";
        // These files already have a build-revisioned copy in the precache.
        if (serwist.getPrecacheKeyForUrl(essential.href)) continue;
        let download = imageDownloads.get(url);
        if (!download) {
          download = (async () => {
            const [response, complete] = publicImages.handleAll({ request: new Request(url, { credentials: "omit", signal: imageRequests.signal }), event });
            const results = await Promise.allSettled([response, complete]);
            const failure = results.find((result) => result.status === "rejected");
            if (failure?.status === "rejected") throw failure.reason;
          })().finally(() => imageDownloads.delete(url));
          imageDownloads.set(url, download);
        }
        await download;
      } catch { /* A failed image must not prevent saving other public images. */ }
    }
  }));
}
async function offlineDocument(): Promise<Response> {
  try {
    const response = await serwist.matchPrecache("/offline");
    if (response?.ok && response.headers.get("Content-Type")?.includes("text/html")) return response;
  } catch { /* Cache Storage can be blocked or evicted independently of the worker. */ }
  // This response needs neither storage nor JavaScript. Never turn a public
  // navigation into Response.error() when its installed shell is unavailable.
  return new Response('<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Sin conexión | CEMYDI</title><main><h1>Contenido no disponible</h1><p>No se pudo conectar con CEMYDI y el respaldo local no está disponible. Vuelve a intentar cuando tengas conexión.</p><a href="">Reintentar</a></main></html>', {
    status: 503,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "Content-Security-Policy": "default-src 'none'; base-uri 'none'; frame-ancestors 'none'" },
  });
}

async function publicDocument({ request }: HandlerCallbackOptions): Promise<Response> {
  // navigator.onLine is only a hint. Try the actual document even when the
  // browser reports offline; never store HTML carrying prices or session UI.
  try {
    const response = await fetch(request, { cache: "no-store" });
    if (response.status < 500) return response;
  } catch { /* A transport failure uses the same public shell as HTTP 5xx. */ }
  return offlineDocument();
}

const serwist: Serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  precacheOptions: {
    fetchOptions: { credentials: "omit" },
    urlManipulation: ({ url }) => {
      if (!/^\/icon-[\w-]+\.png$/.test(url.pathname) || !url.searchParams.has("v")) return [];
      const canonical = new URL(url);
      canonical.searchParams.delete("v");
      return [canonical];
    },
    plugins: [{
      cacheWillUpdate: async ({ request, response }) => {
        if (new URL(request.url).pathname !== "/offline") return response.status === 200 ? response : null;
        // Allow canonical trailing-slash redirects, but reject other routes,
        // error pages and non-HTML. Keep the shell paired with its build assets.
        const finalUrl = new URL(response.url || request.url);
        const shellUrl = finalUrl.origin === self.location.origin && finalUrl.pathname.replace(/\/$/, "") === "/offline";
        return response.status === 200 && shellUrl && response.headers.get("Content-Type")?.includes("text/html") ? response : null;
      },
      handlerDidError: async ({ request, event }) => {
        // Installation must fail if an essential entry cannot be precached.
        if (event.type === "install") return undefined;
        if (request.mode === "navigate" && isOfflinePublicPath(new URL(request.url).pathname)) return offlineDocument();
        try { return await fetch(request); }
        catch { return Response.error(); }
      },
    }],
  },
  skipWaiting: false,
  clientsClaim: true,
  navigationPreload: false,
  runtimeCaching: [
    {
      matcher: ({ request, url }) => request.method === "GET" && request.mode === "navigate" && url.origin === self.location.origin && isOfflinePublicPath(url.pathname),
      handler: publicDocument,
    },
    // Optional images are saved explicitly from public records, at one size.
    // Do not cache every responsive width/format rendered by next/image.
    // Unmatched API, RSC, auth, account, cart and admin requests use the
    // browser's network directly. No SW cache or HTML fallback applies.
  ],
});
serwist.addEventListeners();
self.addEventListener("activate", (event) => {
  const current = new Set(["cemydi-public-images-v1"]);
  imageMaintenance = (async () => {
    const names = await caches.keys();
    await Promise.all(names.filter((name) => /^cemydi-(public-navigation|public-images|brand)-v/.test(name) && !current.has(name)).map((name) => caches.delete(name)));
    if (!names.includes("cemydi-public-images-v1")) return;
    const cache = await caches.open("cemydi-public-images-v1");
    const retained = new Map<string, Request>();
    for (const request of await cache.keys()) {
      const key = getPublicImageCacheUrl(request.url, self.location.origin);
      const essential = new URL(key ?? request.url);
      essential.search = "";
      if (!key || serwist.getPrecacheKeyForUrl(essential.href)) {
        await cache.delete(request);
        continue;
      }
      const response = await cache.match(request);
      if (!response || !isUsableOfflineImage(response)) {
        await cache.delete(request);
        continue;
      }
      // Keep one copy per source, preferring 640px when available. Preserve a
      // legacy variant if it is the only saved image; activation needs no redownload.
      const previous = retained.get(key);
      if (!previous) retained.set(key, request);
      else if (request.url === key) {
        await cache.delete(previous);
        retained.set(key, request);
      } else await cache.delete(request);
    }
  })().catch(() => {
    // Cleanup is optional when the browser denies Cache Storage. Public
    // navigations can still return the storage-independent emergency page.
  });
  event.waitUntil(imageMaintenance);
});

// Updates use the browser lifecycle: wait for all controlled clients to close.
// Only public image preparation/cleanup is accepted from public clients here.
self.addEventListener("message", (event) => {
  if (!event.source || !("url" in event.source)) return;
  const clientUrl = new URL(event.source.url);
  if (clientUrl.origin !== self.location.origin || !isOfflinePublicPath(clientUrl.pathname)) return;
  if (event.data?.type === "PUBLIC_IMAGES" && Array.isArray(event.data.urls)) {
    event.waitUntil(prepareImages(event.data.urls.slice(0, 120).filter((value: unknown): value is string => typeof value === "string"), event));
  } else if (event.data?.type === "CLEAR_PUBLIC_IMAGES") {
    // A pending image download must not recreate the cache after explicit deletion.
    imageGeneration += 1;
    imageRequests.abort();
    imageRequests = new AbortController();
    const previousMaintenance = imageMaintenance;
    imageMaintenance = (async () => {
      try {
        await previousMaintenance;
        await Promise.allSettled([...imageDownloads.values()]);
        await caches.delete("cemydi-public-images-v1");
        event.ports[0]?.postMessage({ success: true });
      } catch { event.ports[0]?.postMessage({ success: false }); }
    })();
    event.waitUntil(imageMaintenance);
  }
});

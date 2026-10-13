/// <reference lib="webworker" />
import { CacheFirst, ExpirationPlugin, NetworkFirst, NetworkOnly, Serwist, StaleWhileRevalidate, type PrecacheEntry, type SerwistGlobalConfig } from "serwist";
import { isOfflinePublicPath, isPublicImage } from "@/lib/pwa/policy";
import { getOfflineProducts, getOfflineAbout } from "@/lib/pwa/storage";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}
declare const self: ServiceWorkerGlobalScope;
const observedImages = new Set<string>();
function rememberImages(urls: string[]) {
  for (const value of urls) {
    try {
      const url = new URL(value, self.location.origin);
      if (isPublicImage(url, self.location.origin)) observedImages.add(url.href);
    } catch { /* Ignore invalid URLs from messages. */ }
  }
}
async function restoreImages() {
  try {
    const [products, about] = await Promise.all([getOfflineProducts(), getOfflineAbout()]);
    rememberImages(products.flatMap((product) => product.imageUrls));
    if (about) rememberImages([about.content.heroImageUrl, about.content.secondaryImageUrl].filter((value): value is string => Boolean(value)));
  } catch { /* Image caching is optional; the public text remains available. */ }
}
const imagesReady = restoreImages();

const validResponse = {
  cacheWillUpdate: async ({ response }: { response: Response }) =>
    response.status === 200 && /^image\//i.test(response.headers.get("Content-Type") ?? "") && !/private|no-store/i.test(response.headers.get("Cache-Control") ?? "") ? response : null,
};
const publicImages = new StaleWhileRevalidate({ cacheName: "cemydi-public-images-v1", plugins: [validResponse, new ExpirationPlugin({ maxEntries: 120, maxAgeSeconds: 30 * 86400, purgeOnQuotaError: true })] });
const imageDownloads = new Map<string, Promise<void>>();

async function prepareImages(urls: string[], event: ExtendableMessageEvent) {
  await imagesReady;
  rememberImages(urls);
  const pending = [...new Set(urls)].slice(0, 120);
  // A rendered image may have loaded before the worker controlled the page,
  // before PUBLIC_IMAGES arrived, or only into the browser's HTTP cache.
  // Prepare one bounded-size public copy without depending on another render.
  await Promise.all(Array.from({ length: Math.min(4, pending.length) }, async () => {
    while (pending.length) {
      const value = pending.shift()!;
      try {
        const source = new URL(value, self.location.origin);
        if (!isPublicImage(source, self.location.origin)) continue;
        const url = source.origin === self.location.origin ? source.href : new URL(`/_next/image?url=${encodeURIComponent(source.href)}&w=640&q=75`, self.location.origin).href;
        let download = imageDownloads.get(url);
        if (!download) {
          download = (async () => {
            const [response, complete] = publicImages.handleAll({ request: new Request(url, { credentials: "omit" }), event });
            await Promise.all([response, complete]);
          })().finally(() => imageDownloads.delete(url));
          imageDownloads.set(url, download);
        }
        await download;
      } catch { /* A failed image must not prevent saving other public images. */ }
    }
  }));
}
const publicNavigation = new NetworkFirst({
  cacheName: "cemydi-public-navigation-v1",
  plugins: [{ cacheWillUpdate: async () => null }],
});

const serwist: Serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: false,
  clientsClaim: true,
  navigationPreload: false,
  runtimeCaching: [
    {
      matcher: ({ request, url }) => request.method === "GET" && request.mode === "navigate" && url.origin === self.location.origin && isOfflinePublicPath(url.pathname),
      handler: async (options): Promise<Response> => {
        if (!self.navigator.onLine) return (await serwist.matchPrecache("/offline")) ?? Response.error();
        try {
          // Public documents are requested first, but never stored: product HTML
          // carries commercial data. The safe precached shell is the only fallback.
          const response = await publicNavigation.handle(options);
          if (response.status < 500) return response;
        } catch { /* Network unavailable: use the public shell. */ }
        return (await serwist.matchPrecache("/offline")) ?? Response.error();
      },
    },
    {
      matcher: ({ request, url }) => request.method === "GET" && url.origin === self.location.origin && /^\/(?:logo-[\w-]+\.png|icon-[\w-]+\.png)$/.test(url.pathname),
      handler: new CacheFirst({ cacheName: "cemydi-brand-v1", plugins: [validResponse, new ExpirationPlugin({ maxEntries: 16, maxAgeSeconds: 30 * 86400 })] }),
    },
    {
      matcher: ({ request, url }) => {
        if (request.method !== "GET" || request.destination !== "image" || !isPublicImage(url, self.location.origin)) return false;
        const source = url.pathname === "/_next/image" ? url.searchParams.get("url") : url.href;
        return url.origin === self.location.origin && url.pathname !== "/_next/image" || Boolean(source && observedImages.has(new URL(source, self.location.origin).href));
      },
      handler: publicImages,
    },
    // No broad API, RSC, auth, account, cart or admin cache rules.
    { matcher: () => true, handler: new NetworkOnly() },
  ],
});
serwist.addEventListeners();
self.addEventListener("activate", (event) => {
  const current = new Set(["cemydi-public-navigation-v1", "cemydi-public-images-v1", "cemydi-brand-v1"]);
  event.waitUntil(caches.keys().then((names) => Promise.all(names.filter((name) => /^cemydi-(public-navigation|public-images|brand)-v/.test(name) && !current.has(name)).map((name) => caches.delete(name)))));
});

// Updates use the browser lifecycle: wait for all controlled clients to close.
// Only public image observations are accepted from clients here.
self.addEventListener("message", (event) => {
  if (event.data?.type === "PUBLIC_IMAGES" && Array.isArray(event.data.urls)) {
    event.waitUntil(prepareImages(event.data.urls.filter((value: unknown): value is string => typeof value === "string"), event));
  }
});

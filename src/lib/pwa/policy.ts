export const PUBLIC_OFFLINE_PATHS = ["/", "/offline", "/catalogo", "/quienes-somos", "/contactanos"];
export const OFFLINE_TTL = 30 * 86400 * 1000;
export const OFFLINE_IMAGE_SAVED_AT = "x-cemydi-cached-at";

export function isUsableOfflineImage(response: Response, expires = true) {
  if (response.status !== 200 || response.type === "opaque" || !/^image\//i.test(response.headers.get("Content-Type") ?? "") || /private|no-store/i.test(response.headers.get("Cache-Control") ?? "")) return false;
  if (!expires) return true;
  const writtenAt = response.headers.get(OFFLINE_IMAGE_SAVED_AT);
  // Legacy responses have no local timestamp. Retain their original HTTP Date.
  const timestamp = writtenAt !== null ? Number(writtenAt) : Date.parse(response.headers.get("Date") ?? "");
  const now = Date.now();
  if (writtenAt !== null && (!Number.isFinite(timestamp) || timestamp <= 0 || timestamp > now)) return false;
  return !Number.isFinite(timestamp) || now - timestamp < OFFLINE_TTL;
}

export function isOfflinePublicPath(path: string) {
  const normalized = path === "/" ? path : path.replace(/\/$/, "");
  return PUBLIC_OFFLINE_PATHS.includes(normalized) || /^\/producto\/[^/]+$/.test(normalized);
}

export function getOfflineProductAlias(path: string) {
  const segment = path.split("/").filter(Boolean).pop() ?? "";
  try { return decodeURIComponent(segment); } catch { return segment; }
}

export function isPublicImage(url: URL, origin: string) {
  if (url.username || url.password) return false;
  if (url.origin === origin) {
    if (url.pathname === "/_next/image") {
      const source = url.searchParams.get("url");
      if (!source) return false;
      try { return isPublicImage(new URL(source, origin), origin); } catch { return false; }
    }
    return /^\/(?:icon-[\w-]+\.png|logo-[\w-]+\.png|img_[\w-]+\.png|fondowan\.png)$/.test(url.pathname);
  }
  return url.protocol === "https:" && url.hostname === "res.cloudinary.com" && url.pathname.includes("/image/upload/");
}

// One bounded-resolution copy per public source, shared by the worker and UI.
// Online responsive variants remain in the browser's ordinary HTTP cache.
export function getPublicImageCacheUrl(value: string, origin: string): string | null {
  try {
    let source = new URL(value, origin);
    if (source.origin === origin && source.pathname === "/_next/image") {
      const original = source.searchParams.get("url");
      if (!original) return null;
      source = new URL(original, origin);
      if (source.origin === origin && source.pathname === "/_next/image") return null;
    }
    if (!isPublicImage(source, origin)) return null;
    source.hash = "";
    return source.origin === origin ? source.href : new URL(`/_next/image?url=${encodeURIComponent(source.href)}&w=640&q=75`, origin).href;
  } catch { return null; }
}

export const PUBLIC_OFFLINE_PATHS = ["/", "/offline", "/catalogo", "/quienes-somos", "/contactanos"];

export function isOfflinePublicPath(path: string) {
  return PUBLIC_OFFLINE_PATHS.includes(path) || /^\/producto\/[^/]+\/?$/.test(path);
}

export function isPublicImage(url: URL, origin: string) {
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

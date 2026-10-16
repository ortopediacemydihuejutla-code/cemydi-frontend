"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getPublicImageCacheUrl, isUsableOfflineImage } from "@/lib/pwa/policy";

export default function OfflineImage({ urls, name }: { urls: string[]; name: string }) {
  // Callers often pass an inline array. Key by its values so a rerender does
  // not revoke and rescan the same image; never reuse a previous selection.
  const candidates = JSON.stringify(urls);
  const [image, setImage] = useState<{ candidates: string; url: string } | null>(null);
  const source = image?.candidates === candidates ? image.url : null;
  useEffect(() => {
    let disposed = false;
    let objectUrl: string | undefined;
    const values: string[] = JSON.parse(candidates);
    const expected = new Set(values.flatMap((value) => {
      try { return [new URL(value, location.origin).href]; } catch { return []; }
    }));
    const canonical = [...new Set(values.map((value) => getPublicImageCacheUrl(value, location.origin)).filter((value): value is string => value !== null))];
    const readImage = async (response: Response | undefined, runtime: boolean) => {
      if (!response || !isUsableOfflineImage(response, runtime)) return false;
      objectUrl = URL.createObjectURL(await response.blob());
      if (disposed) URL.revokeObjectURL(objectUrl); else setImage({ candidates, url: objectUrl });
      return true;
    };
    if (typeof caches !== "undefined") void (async () => {
      // Only read the public image cache and brand precache, never arbitrary data.
      const names = (await caches.keys()).filter((name) => name === "cemydi-public-images-v1" || name.startsWith("serwist-precache-"));
      for (const cacheName of names) {
        if (disposed) return;
        const cache = await caches.open(cacheName);
        const runtime = cacheName === "cemydi-public-images-v1";
        if (runtime) {
          // New copies have a predictable key. Scan only when a legacy variant
          // is the only saved image or when looking up revisioned essentials.
          for (const key of canonical) {
            if (disposed) return;
            if (await readImage(await cache.match(key, { ignoreVary: true }), true)) return;
          }
        }
        for (const request of await cache.keys()) {
          if (disposed) return;
          const url = new URL(request.url);
          url.searchParams.delete("__WB_REVISION__");
          const original = url.pathname === "/_next/image" ? url.searchParams.get("url") : url.href;
          if (!original || !expected.has(new URL(original, location.origin).href)) continue;
          if (await readImage(await cache.match(request), runtime)) return;
        }
      }
    })().catch(() => { /* The text remains useful when images are absent. */ });
    return () => { disposed = true; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [candidates]);
  return source ? <Image src={source} alt={name} width={400} height={300} unoptimized className="h-full w-full object-contain" /> : <div role="img" aria-label={`Imagen no guardada de ${name}`} className="grid h-full min-h-40 place-items-center bg-muted px-4 text-center text-sm text-muted-foreground">Imagen no disponible sin conexión</div>;
}

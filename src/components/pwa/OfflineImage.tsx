"use client";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function OfflineImage({ urls, name }: { urls: string[]; name: string }) {
  const [source, setSource] = useState<string | null>(null);
  useEffect(() => {
    let disposed = false;
    let objectUrl: string | undefined;
    const expected = new Set(urls.flatMap((value) => {
      try { return [new URL(value, location.origin).href]; } catch { return []; }
    }));
    if (typeof caches !== "undefined") void (async () => {
      // Only read the public image cache and brand precache, never arbitrary data.
      const names = (await caches.keys()).filter((name) => name === "cemydi-public-images-v1" || name.includes("precache"));
      for (const cacheName of names) {
        const cache = await caches.open(cacheName);
        for (const request of await cache.keys()) {
          const url = new URL(request.url);
          url.searchParams.delete("__WB_REVISION__");
          const original = url.pathname === "/_next/image" ? url.searchParams.get("url") : url.href;
          if (!original || !expected.has(new URL(original, location.origin).href)) continue;
          const response = await cache.match(request);
          if (!response || response.type === "opaque" || response.status !== 200) continue;
          objectUrl = URL.createObjectURL(await response.blob());
          if (disposed) URL.revokeObjectURL(objectUrl); else setSource(objectUrl);
          return;
        }
      }
    })().catch(() => { /* The text remains useful when images are absent. */ });
    return () => { disposed = true; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [urls]);
  return source ? <Image src={source} alt={name} width={400} height={300} unoptimized className="h-full w-full object-contain" /> : <div role="img" aria-label={`Imagen no guardada de ${name}`} className="grid h-full min-h-40 place-items-center bg-muted px-4 text-center text-sm text-muted-foreground">Imagen no disponible sin conexión</div>;
}

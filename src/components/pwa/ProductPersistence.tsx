"use client";
import { useEffect } from "react";
import toast from "react-hot-toast";
import type { CatalogProduct } from "@/services/catalog";
import { saveOfflineProducts } from "@/lib/pwa/storage";

export default function ProductPersistence({ products, detail = false }: { products: CatalogProduct[]; detail?: boolean }) {
  useEffect(() => {
    let cancelled = false;
    if (navigator.onLine) void saveOfflineProducts(products, detail, detail ? decodeURIComponent(location.pathname.split("/").pop() ?? "") : undefined).catch(() => {
      if (!cancelled) toast.error("No se pudieron guardar los nuevos productos. El almacenamiento puede estar bloqueado o sin espacio; puedes continuar navegando con conexión. Vuelve a cargar la página para reintentar.", { id: "pwa-product-save" });
    });
    return () => { cancelled = true; };
  }, [products, detail]);
  return null;
}

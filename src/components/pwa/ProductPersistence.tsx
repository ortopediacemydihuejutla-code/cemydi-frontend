"use client";
import { useEffect } from "react";
import toast from "react-hot-toast";
import type { CatalogProduct } from "@/services/catalog";
import { saveOfflineCatalogOrder, saveOfflineProducts } from "@/lib/pwa/storage";
import type { CatalogAppliedParams } from "@/app/catalogo/utils/catalog-params";

export default function ProductPersistence({ products, detail = false, catalogFilters }: { products: CatalogProduct[]; detail?: boolean; catalogFilters?: CatalogAppliedParams }) {
  useEffect(() => {
    let cancelled = false;
    if (navigator.onLine) void saveOfflineProducts(products, detail, detail ? decodeURIComponent(location.pathname.split("/").pop() ?? "") : undefined).then(() => {
      if (catalogFilters) return saveOfflineCatalogOrder(products, catalogFilters);
    }).catch(() => {
      if (!cancelled) toast.error("No se pudieron guardar los nuevos productos. El almacenamiento puede estar bloqueado o sin espacio; puedes continuar navegando con conexión. Vuelve a cargar la página para reintentar.", { id: "pwa-product-save" });
    });
    return () => { cancelled = true; };
  }, [products, detail, catalogFilters]);
  return null;
}

"use client";
import { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import type { CatalogProduct } from "@/services/catalog";
import { saveOfflineCatalogOrder, saveOfflineProducts } from "@/lib/pwa/storage";
import type { CatalogAppliedParams } from "@/app/catalogo/utils/catalog-params";
import { getOfflineProductAlias } from "@/lib/pwa/policy";

export default function ProductPersistence({ products, detail = false, catalogFilters }: { products: CatalogProduct[]; detail?: boolean; catalogFilters?: CatalogAppliedParams }) {
  const saved = useRef<{ products: CatalogProduct[]; detail: boolean; catalogFilters?: CatalogAppliedParams } | null>(null);
  useEffect(() => {
    let cancelled = false;
    // Resuming a hidden boundary is not a fresh server response. Do not extend
    // the offline TTL merely because connectivity changed.
    const previous = saved.current;
    if (previous && previous.products === products && previous.detail === detail && previous.catalogFilters === catalogFilters) return;
    if (navigator.onLine) void saveOfflineProducts(products, detail, detail ? getOfflineProductAlias(location.pathname) : undefined).then(() => {
      if (catalogFilters) return saveOfflineCatalogOrder(products, catalogFilters);
    }).then(() => {
      saved.current = { products, detail, catalogFilters };
    }).catch(() => {
      if (!cancelled) toast.error("No se pudieron guardar los nuevos productos. El almacenamiento puede estar bloqueado o sin espacio; puedes continuar navegando con conexión. Vuelve a cargar la página para reintentar.", { id: "pwa-product-save" });
    });
    return () => { cancelled = true; };
  }, [products, detail, catalogFilters]);
  return null;
}

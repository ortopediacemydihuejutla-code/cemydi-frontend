"use client";
import { useEffect } from "react";
import NotFoundPage from "@/app/not-found";
import { ApiError } from "@/lib/api-error";
import { getCatalogProductById } from "@/services/catalog";
import { getOfflineProducts, removeOfflineProduct } from "@/lib/pwa/storage";

export default function ProductNotFound() {
  useEffect(() => {
    const id = Number(location.pathname.split("/").pop());
    if (!navigator.onLine || !Number.isInteger(id) || id <= 0) return;
    let cancelled = false;
    void getOfflineProducts().then(async (products) => {
      if (!products.some((product) => product.id === id)) return;
      // Confirm the numeric resource endpoint, not the compatibility slug route.
      try {
        const { product } = await getCatalogProductById(id);
        if (!cancelled && !product.activo) await removeOfflineProduct(id);
      } catch (error) {
        if (!cancelled && error instanceof ApiError && error.status === 404) await removeOfflineProduct(id);
      }
    }).catch(() => {});
    return () => { cancelled = true; };
  }, []);
  return <NotFoundPage />;
}

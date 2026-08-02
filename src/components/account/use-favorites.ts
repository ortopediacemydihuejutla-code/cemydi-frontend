"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuth } from "@/providers/AuthContext";
import type { CatalogProduct } from "@/services/catalog";

const FAVORITES_EVENT = "cemydi:favorites-updated";

function getStorageKey(userId: number) {
  return `cemydi:favorites:${userId}`;
}

function readFavorites(userId: number): CatalogProduct[] {
  try {
    const stored = window.localStorage.getItem(getStorageKey(userId));
    if (!stored) return [];

    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (item): item is CatalogProduct =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as CatalogProduct).id === "number" &&
        typeof (item as CatalogProduct).nombre === "string",
    );
  } catch {
    return [];
  }
}

function writeFavorites(userId: number, products: CatalogProduct[]) {
  window.localStorage.setItem(getStorageKey(userId), JSON.stringify(products));
  window.dispatchEvent(
    new CustomEvent(FAVORITES_EVENT, {
      detail: { userId },
    }),
  );
}

function useOptionalAuth() {
  try {
    return useAuth();
  } catch {
    return { user: null };
  }
}

export function useFavorites() {
  const { user } = useOptionalAuth();
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loaded, setLoaded] = useState(false);

  const sync = useCallback(() => {
    if (!user) {
      setProducts([]);
      setLoaded(true);
      return;
    }

    setProducts(readFavorites(user.id));
    setLoaded(true);
  }, [user]);

  useEffect(() => {
    const initialSyncId = window.setTimeout(sync, 0);

    const handleUpdate = (event: Event) => {
      const detail = (event as CustomEvent<{ userId?: number }>).detail;
      if (!detail?.userId || detail.userId === user?.id) sync();
    };

    const handleStorage = (event: StorageEvent) => {
      if (!user || event.key !== getStorageKey(user.id)) return;
      sync();
    };

    window.addEventListener(FAVORITES_EVENT, handleUpdate);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.clearTimeout(initialSyncId);
      window.removeEventListener(FAVORITES_EVENT, handleUpdate);
      window.removeEventListener("storage", handleStorage);
    };
  }, [sync, user]);

  const favoriteIds = useMemo(
    () => new Set(products.map((product) => product.id)),
    [products],
  );

  const toggleFavorite = useCallback(
    (product: CatalogProduct) => {
      if (!user) return false;

      const current = readFavorites(user.id);
      const exists = current.some((item) => item.id === product.id);
      const next = exists
        ? current.filter((item) => item.id !== product.id)
        : [product, ...current];

      writeFavorites(user.id, next);
      setProducts(next);
      return !exists;
    },
    [user],
  );

  return {
    products,
    favoriteIds,
    loaded,
    toggleFavorite,
  };
}

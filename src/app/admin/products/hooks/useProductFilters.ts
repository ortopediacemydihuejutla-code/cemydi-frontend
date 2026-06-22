"use client";

import { useMemo, useState } from "react";

import type { AdminProduct } from "@/services/admin";

import { getModeLabel } from "@/features/admin/lib/product-shared";
import { productPassesAdvancedFilters, productPassesQuickFilter, productPassesSearch } from "../utils/product-filter-utils";
import {
  DEFAULT_TABLE_ADVANCED_FILTERS,
  type ProductQuickFilterId,
  type ProductTableAdvancedFilters,
} from "../utils/product-types";

type UseProductFiltersOptions = {
  products: AdminProduct[];
  brands: string[];
  classifications: string[];
};

export function useProductFilters({ products, brands, classifications }: UseProductFiltersOptions) {
  const [search, setSearch] = useState("");
  const [quickFilter, setQuickFilter] = useState<ProductQuickFilterId>("ALL");
  const [tableAdvancedFilters, setTableAdvancedFilters] =
    useState<ProductTableAdvancedFilters>(DEFAULT_TABLE_ADVANCED_FILTERS);
  const [draftTableAdvancedFilters, setDraftTableAdvancedFilters] =
    useState<ProductTableAdvancedFilters>(DEFAULT_TABLE_ADVANCED_FILTERS);
  const [tableFiltersMenuOpen, setTableFiltersMenuOpen] = useState(false);

  const quickFilterCounts = useMemo(
    () => ({
      ALL: products.length,
      ACTIVE: products.filter((p) => p.activo).length,
      INACTIVE: products.filter((p) => !p.activo).length,
      RECIPE: products.filter((p) => p.requiereReceta).length,
      LOW_STOCK: products.filter((p) => p.stock <= 5).length,
    }),
    [products],
  );

  const tableBrandOptions = useMemo(() => {
    const merge = new Set<string>();
    brands.forEach((b) => merge.add(b.trim()));
    products.forEach((p) => {
      if (p.marca.trim()) merge.add(p.marca.trim());
    });
    return Array.from(merge).sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }));
  }, [brands, products]);

  const tableClassificationOptions = useMemo(() => {
    const merge = new Set<string>();
    classifications.forEach((c) => merge.add(c.trim()));
    products.forEach((p) => {
      if (p.clasificacion.trim()) merge.add(p.clasificacion.trim());
    });
    return Array.from(merge).sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }));
  }, [classifications, products]);

  const exportSupplierOptions = useMemo(
    () =>
      Array.from(new Set(products.map((item) => item.proveedor.trim()).filter(Boolean))).sort(
        (a, b) => a.localeCompare(b, "es", { sensitivity: "base" }),
      ),
    [products],
  );

  const filteredProducts = useMemo(() => {
    return products.filter(
      (product) =>
        productPassesQuickFilter(product, quickFilter) &&
        productPassesAdvancedFilters(product, tableAdvancedFilters) &&
        productPassesSearch(product, search),
    );
  }, [products, quickFilter, tableAdvancedFilters, search]);

  const activeTableAdvancedFilterLabels = useMemo(() => {
    const items: string[] = [];
    const f = tableAdvancedFilters;

    if (f.supplier !== "ALL") {
      items.push(`Proveedor: ${f.supplier}`);
    }
    if (f.classification !== "ALL") {
      items.push(`Clasificación: ${f.classification}`);
    }
    if (f.brand !== "ALL") {
      items.push(`Marca: ${f.brand}`);
    }
    if (f.mode !== "ALL") {
      items.push(`Modo: ${getModeLabel(f.mode)}`);
    }
    if (f.recipe === "YES") {
      items.push("Solo con receta");
    }
    if (f.recipe === "NO") {
      items.push("Solo sin receta");
    }
    if (f.stockBand === "OUT") {
      items.push("Sin stock (0)");
    }
    if (f.stockBand === "LOW") {
      items.push("Stock bajo (1–5)");
    }
    if (f.stockBand === "OK") {
      items.push("Stock disponible (>5)");
    }

    return items;
  }, [tableAdvancedFilters]);

  const applyTableAdvancedFilters = () => {
    setTableAdvancedFilters(draftTableAdvancedFilters);
    setTableFiltersMenuOpen(false);
  };

  const clearTableAdvancedFilters = () => {
    setTableAdvancedFilters(DEFAULT_TABLE_ADVANCED_FILTERS);
    setDraftTableAdvancedFilters(DEFAULT_TABLE_ADVANCED_FILTERS);
  };

  const openTableFiltersMenu = (open: boolean) => {
    setTableFiltersMenuOpen(open);
    if (open) {
      setDraftTableAdvancedFilters(tableAdvancedFilters);
    }
  };

  return {
    search,
    setSearch,
    quickFilter,
    setQuickFilter,
    tableAdvancedFilters,
    setTableAdvancedFilters,
    draftTableAdvancedFilters,
    setDraftTableAdvancedFilters,
    tableFiltersMenuOpen,
    setTableFiltersMenuOpen,
    quickFilterCounts,
    tableBrandOptions,
    tableClassificationOptions,
    exportSupplierOptions,
    filteredProducts,
    activeTableAdvancedFilterLabels,
    applyTableAdvancedFilters,
    clearTableAdvancedFilters,
    openTableFiltersMenu,
  };
}

export type ProductFiltersState = ReturnType<typeof useProductFilters>;

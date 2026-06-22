import type { AdminProduct } from "@/services/admin";

import type {
  ProductColumnId,
  ProductQuickFilterId,
  ProductTableAdvancedFilters,
} from "./product-types";

type SortComparable = string | number | boolean;

export function compareProductSortValues(first: SortComparable, second: SortComparable) {
  if (typeof first === "number" && typeof second === "number") {
    return first - second;
  }
  if (typeof first === "boolean" && typeof second === "boolean") {
    return Number(first) - Number(second);
  }
  return String(first).localeCompare(String(second), "es", {
    numeric: true,
    sensitivity: "base",
  });
}

export function getProductSortValue(product: AdminProduct, column: ProductColumnId): SortComparable {
  switch (column) {
    case "detalle":
      return product.nombre;
    case "clasificacion":
      return product.clasificacion;
    case "proveedor":
      return product.proveedor;
    case "precio":
      return product.precio;
    case "stock":
      return product.stock;
    case "modo":
      return product.tipoAdquisicion;
    case "estado":
      return product.activo ? 1 : 0;
    case "alta":
      return product.createdAt ? new Date(product.createdAt).getTime() : 0;
    default:
      return "";
  }
}

export function getDefaultProductSortDirection(column: ProductColumnId): "asc" | "desc" {
  return column === "alta" || column === "precio" || column === "stock" ? "desc" : "asc";
}

export function productPassesQuickFilter(product: AdminProduct, quick: ProductQuickFilterId) {
  switch (quick) {
    case "ACTIVE":
      return product.activo;
    case "INACTIVE":
      return !product.activo;
    case "RECIPE":
      return product.requiereReceta;
    case "LOW_STOCK":
      return product.stock <= 5;
    case "ALL":
    default:
      return true;
  }
}

export function productPassesAdvancedFilters(
  product: AdminProduct,
  filters: ProductTableAdvancedFilters,
) {
  if (filters.supplier !== "ALL" && product.proveedor !== filters.supplier) {
    return false;
  }
  if (filters.classification !== "ALL" && product.clasificacion !== filters.classification) {
    return false;
  }
  if (filters.brand !== "ALL" && product.marca !== filters.brand) {
    return false;
  }
  if (filters.mode !== "ALL" && product.tipoAdquisicion !== filters.mode) {
    return false;
  }
  if (filters.recipe === "YES" && !product.requiereReceta) {
    return false;
  }
  if (filters.recipe === "NO" && product.requiereReceta) {
    return false;
  }
  if (filters.stockBand === "OUT" && product.stock !== 0) {
    return false;
  }
  if (filters.stockBand === "LOW" && (product.stock < 1 || product.stock > 5)) {
    return false;
  }
  if (filters.stockBand === "OK" && product.stock <= 5) {
    return false;
  }
  return true;
}

export function productPassesSearch(product: AdminProduct, query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;

  return [
    product.nombre,
    product.marca,
    product.modelo,
    product.descripcion,
    product.clasificacion,
    product.proveedor,
    product.tipoAdquisicion,
  ]
    .join(" ")
    .toLowerCase()
    .includes(normalized);
}

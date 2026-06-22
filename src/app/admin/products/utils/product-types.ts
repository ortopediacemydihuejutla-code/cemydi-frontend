import type { ProductMode } from "@/services/admin";

export type ProductColumnId =
  | "detalle"
  | "clasificacion"
  | "proveedor"
  | "precio"
  | "stock"
  | "modo"
  | "estado"
  | "alta";

export type ProductSortState = {
  column: ProductColumnId;
  direction: "asc" | "desc";
};

export const DEFAULT_PRODUCT_SORT: ProductSortState = {
  column: "alta",
  direction: "desc",
};

export const DEFAULT_PRODUCT_VISIBLE_COLUMNS: Record<ProductColumnId, boolean> = {
  detalle: true,
  clasificacion: true,
  proveedor: true,
  precio: true,
  stock: true,
  modo: true,
  estado: true,
  alta: true,
};

export const PRODUCT_COLUMN_ORDER: ProductColumnId[] = [
  "detalle",
  "clasificacion",
  "proveedor",
  "precio",
  "stock",
  "modo",
  "estado",
  "alta",
];

export const PRODUCT_COLUMN_WIDTHS: Record<ProductColumnId, number> = {
  detalle: 300,
  clasificacion: 150,
  proveedor: 168,
  precio: 120,
  stock: 128,
  modo: 110,
  estado: 120,
  alta: 130,
};

export const PRODUCT_COLUMN_LABELS: Record<ProductColumnId, string> = {
  detalle: "Producto",
  clasificacion: "Clasificación",
  proveedor: "Proveedor",
  precio: "Precio",
  stock: "Stock",
  modo: "Modo",
  estado: "Estado",
  alta: "Alta",
};

export type ProductQuickFilterId = "ALL" | "ACTIVE" | "INACTIVE" | "RECIPE" | "LOW_STOCK";

export const PRODUCT_QUICK_FILTERS: { id: ProductQuickFilterId; label: string }[] = [
  { id: "ALL", label: "Todos" },
  { id: "ACTIVE", label: "Activos" },
  { id: "INACTIVE", label: "Inactivos" },
  { id: "RECIPE", label: "Con receta" },
  { id: "LOW_STOCK", label: "Stock bajo" },
];

export type ProductTableAdvancedFilters = {
  supplier: string;
  classification: string;
  brand: string;
  mode: ProductMode | "ALL";
  recipe: "ALL" | "YES" | "NO";
  stockBand: "ALL" | "OUT" | "LOW" | "OK";
};

export const DEFAULT_TABLE_ADVANCED_FILTERS: ProductTableAdvancedFilters = {
  supplier: "ALL",
  classification: "ALL",
  brand: "ALL",
  mode: "ALL",
  recipe: "ALL",
  stockBand: "ALL",
};

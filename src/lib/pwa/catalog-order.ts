import { z } from "@/lib/zod";
import { buildCatalogQueryParams, type CatalogAppliedParams } from "@/app/catalogo/utils/catalog-params";
import { OFFLINE_TTL } from "./products";

const catalogOrdersSchema = z.record(z.string(), z.object({
  updatedAt: z.number().finite().nonnegative(),
  pages: z.record(z.string(), z.array(z.number().int()).max(24)),
}));
export type OfflineCatalogOrders = z.infer<typeof catalogOrdersSchema>;

export function catalogOrderKey(filters: CatalogAppliedParams) {
  return buildCatalogQueryParams({
    ...filters,
    clasificaciones: [...filters.clasificaciones].sort(),
    marcas: [...filters.marcas].sort(),
    tipos: [...filters.tipos].sort(),
    view: "grid",
    page: 1,
  }).toString();
}

export function parseOfflineCatalogOrders(value: unknown, now = Date.now()): OfflineCatalogOrders {
  const parsed = catalogOrdersSchema.safeParse(value);
  if (!parsed.success) return {};
  return Object.fromEntries(Object.entries(parsed.data)
    .filter(([, entry]) => entry.updatedAt <= now && now - entry.updatedAt < OFFLINE_TTL)
    .sort(([, a], [, b]) => b.updatedAt - a.updatedAt).slice(0, 20));
}

export function getSavedCatalogOrder(orders: OfflineCatalogOrders, filters: CatalogAppliedParams) {
  const entry = orders[catalogOrderKey(filters)];
  if (!entry) return [];
  return [...new Set(Object.entries(entry.pages).sort(([a], [b]) => Number(a) - Number(b)).flatMap(([, ids]) => ids))];
}

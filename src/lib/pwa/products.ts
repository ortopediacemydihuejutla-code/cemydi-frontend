import { z } from "@/lib/zod";
import { catalogProductSchema } from "@/lib/schemas/catalog";
import { getProductSlug } from "@/lib/product-share";
import type { CatalogProduct } from "@/services/catalog";
import type { CatalogAppliedParams } from "@/app/catalogo/utils/catalog-params";
import { normalizeClassificationKey } from "@/app/catalogo/utils/catalog-formatters";
import { normalizeMarcaKey } from "@/app/catalogo/utils/catalog-params";

export const OFFLINE_TTL = 30 * 86400 * 1000;
export const OFFLINE_LIMIT = 200;
const publicFields = catalogProductSchema.pick({ id: true, slug: true, nombre: true, marca: true, modelo: true, descripcion: true, clasificacion: true, tipoAdquisicion: true, requiereReceta: true });
const detailFields = catalogProductSchema.pick({ medidas: true, pesoSoportado: true, material: true, contenidoCaja: true, indicacionesUso: true });
export const offlineProductSchema = publicFields.extend({
  imageUrls: z.array(z.string()).max(12),
  aliases: z.array(z.string()).max(20),
  updatedAt: z.number().finite().nonnegative(),
  detail: detailFields.extend({ updatedAt: z.number().finite().nonnegative() }).optional(),
});
export type OfflineProduct = z.infer<typeof offlineProductSchema>;

export function toOfflineProduct(input: CatalogProduct, details = false, alias?: string, now = Date.now()): OfflineProduct {
  const product = catalogProductSchema.parse(input);
  return offlineProductSchema.parse({
    ...publicFields.parse(product),
    imageUrls: [...new Set([product.imageUrl, ...product.images.map((image) => image.imageUrl)].filter((url): url is string => Boolean(url)))].slice(0, 12),
    aliases: [...new Set([String(product.id), getProductSlug(product), alias].filter((value): value is string => Boolean(value)))],
    updatedAt: now,
    ...(details ? { detail: { ...detailFields.parse(product), updatedAt: now } } : {}),
  });
}

export function maintainProducts(inputs: unknown[], now = Date.now(), limit = OFFLINE_LIMIT): OfflineProduct[] {
  const products = new Map<number, OfflineProduct>();
  for (const input of inputs) {
    const parsed = offlineProductSchema.safeParse(input);
    if (!parsed.success || parsed.data.updatedAt > now || now - parsed.data.updatedAt >= OFFLINE_TTL) continue;
    const product = parsed.data;
    if (product.detail && (product.detail.updatedAt > now || now - product.detail.updatedAt >= OFFLINE_TTL)) delete product.detail;
    const current = products.get(product.id);
    if (!current || current.updatedAt <= product.updatedAt) products.set(product.id, product);
  }
  return [...products.values()].sort((a, b) => b.updatedAt - a.updatedAt || a.id - b.id).slice(0, limit);
}

export function mergeProducts(existing: OfflineProduct[], incoming: OfflineProduct[], now = Date.now()) {
  const merged = new Map(existing.map((product) => [product.id, product]));
  for (const next of incoming) {
    const old = merged.get(next.id);
    merged.set(next.id, { ...next, aliases: [...new Set([...next.aliases, ...(old?.aliases ?? [])])].slice(0, 20), detail: next.detail ?? old?.detail });
  }
  return maintainProducts([...merged.values()], now);
}

export function findOfflineProduct(products: OfflineProduct[], alias: string) {
  const numeric = products.find((product) => String(product.id) === alias);
  if (numeric) return numeric;
  const matches = products.filter((product) => product.aliases.includes(alias));
  return matches.length === 1 ? matches[0] : null;
}

export function filterOfflineProducts(products: OfflineProduct[], filters: CatalogAppliedParams) {
  const query = filters.searchQuery.trim().toLocaleLowerCase("es");
  const filtered = products.filter((product) =>
    (!query || `${product.nombre} ${product.marca} ${product.modelo} ${product.descripcion}`.toLocaleLowerCase("es").includes(query)) &&
    (!filters.clasificaciones.length || filters.clasificaciones.some((value) => normalizeClassificationKey(value) === normalizeClassificationKey(product.clasificacion))) &&
    (!filters.marcas.length || filters.marcas.some((value) => normalizeMarcaKey(value) === normalizeMarcaKey(product.marca))) &&
    (!filters.tipos.length || filters.tipos.includes(product.tipoAdquisicion)) &&
    (!filters.receta || product.requiereReceta === (filters.receta === "con"))
  ).sort((a, b) => (filters.sort === "nombre-desc" ? -1 : 1) * a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" }) || a.id - b.id);
  const totalPages = Math.max(1, Math.ceil(filtered.length / 24));
  const page = Math.min(Math.max(1, filters.page), totalPages);
  return { products: filtered.slice((page - 1) * 24, page * 24), total: filtered.length, totalPages, page };
}

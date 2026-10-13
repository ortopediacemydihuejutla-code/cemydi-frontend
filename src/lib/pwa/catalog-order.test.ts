import { describe, expect, it } from "vitest";
import { parseCatalogSearchParams } from "@/app/catalogo/utils/catalog-params";
import { catalogOrderKey, getSavedCatalogOrder, parseOfflineCatalogOrders } from "./catalog-order";
import { OFFLINE_TTL } from "./products";

describe("orden del catálogo guardado", () => {
  const filters = parseCatalogSearchParams(new URLSearchParams());
  it("reúne páginas por posición sin mezclar búsquedas, filtros ni orden", () => {
    const key = catalogOrderKey(filters);
    const orders = { [key]: { updatedAt: Date.now(), pages: { "2": [2, 1], "1": [3, 2] } } };
    expect(getSavedCatalogOrder(orders, { ...filters, page: 2, view: "list" })).toEqual([3, 2, 1]);
    expect(getSavedCatalogOrder(orders, { ...filters, sort: "nombre-asc" })).toEqual([]);
    expect(getSavedCatalogOrder(orders, { ...filters, searchQuery: "silla" })).toEqual([]);
  });
  it("rechaza datos inválidos y órdenes vencidos sin romper datos anteriores", () => {
    const now = Date.now();
    expect(parseOfflineCatalogOrders(undefined, now)).toEqual({});
    expect(parseOfflineCatalogOrders({ invalid: { updatedAt: now, pages: { "1": ["1"] } } }, now)).toEqual({});
    expect(parseOfflineCatalogOrders({ old: { updatedAt: now - OFFLINE_TTL, pages: { "1": [1] } } }, now)).toEqual({});
  });
});

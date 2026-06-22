import { describe, expect, it } from "vitest";

import {
  buildCatalogQueryParams,
  catalogPathFromParams,
  countActiveFilters,
  mergeAvailableBrands,
  parseCatalogSearchParams,
} from "@/app/catalogo/utils/catalog-params";

describe("catalog-params", () => {
  it("parsea search params del catálogo", () => {
    const applied = parseCatalogSearchParams({
      q: "silla",
      clasificaciones: "Movilidad,Soporte",
      marcas: "Invacare,Drive",
      tipos: "VENTA,RENTA",
      receta: "con",
      disponible: "1",
      sort: "precio-asc",
      v: "list",
      page: "2",
    });

    expect(applied.searchQuery).toBe("silla");
    expect(applied.clasificaciones).toEqual(["Movilidad", "Soporte"]);
    expect(applied.marcas).toEqual(["Invacare", "Drive"]);
    expect(applied.tipos).toEqual(["VENTA", "RENTA"]);
    expect(applied.receta).toBe("con");
    expect(applied.soloDisponibles).toBe(true);
    expect(applied.sort).toBe("precio-asc");
    expect(applied.view).toBe("list");
    expect(applied.page).toBe(2);
  });

  it("construye ruta de catálogo con query", () => {
    const params = buildCatalogQueryParams({
      searchQuery: "muletas",
      marcas: ["Invacare"],
      sort: "popular",
      soloDisponibles: true,
      view: "list",
      page: 3,
    });

    expect(catalogPathFromParams(params)).toBe(
      "/catalogo?q=muletas&marcas=Invacare&disponible=1&sort=popular&v=list&page=3",
    );
  });

  it("cuenta filtros activos sin incluir búsqueda ni orden", () => {
    const applied = parseCatalogSearchParams({
      q: "silla",
      clasificaciones: "Movilidad",
      marcas: "Invacare",
      tipos: "VENTA",
      receta: "sin",
      disponible: "1",
    });

    expect(countActiveFilters(applied)).toBe(5);
  });

  it("ordena marcas disponibles", () => {
    expect(mergeAvailableBrands(["Zeta", "Alpha", "Alpha"])).toEqual([
      "Alpha",
      "Zeta",
    ]);
  });
});

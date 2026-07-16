import { describe, expect, it } from "vitest";

import { buildCatalogSearchPath } from "./HeaderSearch";

describe("buildCatalogSearchPath", () => {
  it("crea una búsqueda limpia desde cualquier página", () => {
    const currentParams = new URLSearchParams("q=anterior&page=4&marcas=Drive");

    expect(
      buildCatalogSearchPath("  silla de ruedas  ", currentParams, false),
    ).toBe("/catalogo?q=silla+de+ruedas");
  });

  it("conserva los filtros del catálogo y reinicia la paginación", () => {
    const currentParams = new URLSearchParams(
      "q=anterior&clasificaciones=Movilidad&marcas=Drive&tipos=RENTA&receta=sin&disponible=1&sort=precio-asc&v=list&page=4",
    );

    expect(buildCatalogSearchPath("andadera", currentParams, true)).toBe(
      "/catalogo?q=andadera&clasificaciones=Movilidad&marcas=Drive&tipos=RENTA&receta=sin&disponible=1&sort=precio-asc&v=list",
    );
  });

  it("permite limpiar la búsqueda sin perder filtros activos", () => {
    const currentParams = new URLSearchParams(
      "q=muletas&clasificaciones=Movilidad&page=2",
    );

    expect(buildCatalogSearchPath("   ", currentParams, true)).toBe(
      "/catalogo?clasificaciones=Movilidad",
    );
  });
});

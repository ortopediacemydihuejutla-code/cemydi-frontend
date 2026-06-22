export const CATALOG_PAGE_SIZE = 24;

export const CATALOG_SORT_OPTIONS = [
  { value: "reciente", label: "Más recientes" },
  { value: "precio-asc", label: "Menor precio" },
  { value: "precio-desc", label: "Mayor precio" },
  { value: "disponibles", label: "Disponibles primero" },
  { value: "popular", label: "Más populares" },
  { value: "nombre-asc", label: "Nombre A-Z" },
  { value: "nombre-desc", label: "Nombre Z-A" },
] as const;

export type CatalogSort = (typeof CATALOG_SORT_OPTIONS)[number]["value"];
export type CatalogView = "grid" | "list";

export type CatalogAppliedParams = {
  searchQuery: string;
  clasificaciones: string[];
  marcas: string[];
  tipos: Array<"VENTA" | "RENTA" | "MIXTO">;
  receta: "con" | "sin" | null;
  soloDisponibles: boolean;
  sort: CatalogSort;
  view: CatalogView;
  page: number;
};

type SearchParamsInput =
  | Record<string, string | string[] | undefined>
  | URLSearchParams
  | { get(name: string): string | null };

function getParamValue(
  params: SearchParamsInput,
  key: string,
): string | null {
  if (params instanceof URLSearchParams) {
    return params.get(key);
  }

  if ("get" in params && typeof params.get === "function") {
    return params.get(key);
  }

  const raw = (params as Record<string, string | string[] | undefined>)[key];
  if (Array.isArray(raw)) {
    return raw[0] ?? null;
  }

  return raw ?? null;
}

export function normalizeTipos(raw: string | null) {
  if (!raw) return [] as Array<"VENTA" | "RENTA" | "MIXTO">;

  return raw
    .split(",")
    .map((item) => item.trim())
    .filter((item): item is "VENTA" | "RENTA" | "MIXTO" =>
      item === "VENTA" || item === "RENTA" || item === "MIXTO",
    );
}

export function normalizePage(raw: string | null) {
  const parsed = Number(raw ?? "1");
  if (!Number.isInteger(parsed) || parsed <= 0) return 1;
  return parsed;
}

export function normalizeSort(raw: string | null): CatalogSort {
  const valid = CATALOG_SORT_OPTIONS.map((item) => item.value);
  if (raw && valid.includes(raw as CatalogSort)) {
    return raw as CatalogSort;
  }
  return "reciente";
}

export function normalizeView(raw: string | null): CatalogView {
  return raw === "list" ? "list" : "grid";
}

export function parseCatalogSearchParams(
  params: SearchParamsInput,
): CatalogAppliedParams {
  const clasificacionesRaw = getParamValue(params, "clasificaciones");
  const marcasRaw = getParamValue(params, "marcas");
  const recetaRaw = getParamValue(params, "receta");

  return {
    searchQuery: getParamValue(params, "q") ?? "",
    clasificaciones: clasificacionesRaw
      ? clasificacionesRaw
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      : [],
    marcas: marcasRaw
      ? marcasRaw
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      : [],
    tipos: normalizeTipos(getParamValue(params, "tipos")),
    receta: recetaRaw === "con" || recetaRaw === "sin" ? recetaRaw : null,
    soloDisponibles: getParamValue(params, "disponible") === "1",
    sort: normalizeSort(getParamValue(params, "sort")),
    view: normalizeView(getParamValue(params, "v")),
    page: normalizePage(getParamValue(params, "page")),
  };
}

export function buildCatalogQueryParams(options: {
  searchQuery?: string;
  clasificaciones?: string[];
  marcas?: string[];
  tipos?: Array<"VENTA" | "RENTA" | "MIXTO">;
  receta?: "con" | "sin" | null;
  soloDisponibles?: boolean;
  sort?: CatalogSort;
  view?: CatalogView;
  page?: number;
}) {
  const params = new URLSearchParams();

  if (options.searchQuery?.trim()) {
    params.set("q", options.searchQuery.trim());
  }

  if (options.clasificaciones && options.clasificaciones.length > 0) {
    params.set("clasificaciones", options.clasificaciones.join(","));
  }

  if (options.marcas && options.marcas.length > 0) {
    params.set("marcas", options.marcas.join(","));
  }

  if (options.tipos && options.tipos.length > 0) {
    params.set("tipos", options.tipos.join(","));
  }

  if (options.receta === "con" || options.receta === "sin") {
    params.set("receta", options.receta);
  }

  if (options.soloDisponibles) {
    params.set("disponible", "1");
  }

  if (options.sort && options.sort !== "reciente") {
    params.set("sort", options.sort);
  }

  if (options.view === "list") {
    params.set("v", "list");
  }

  if (options.page && options.page > 1) {
    params.set("page", String(options.page));
  }

  return params;
}

export function catalogPathFromParams(params: URLSearchParams) {
  const query = params.toString();
  return query ? `/catalogo?${query}` : "/catalogo";
}

export function appliedParamsToApiQuery(applied: CatalogAppliedParams) {
  return {
    search: applied.searchQuery,
    clasificaciones: applied.clasificaciones,
    marcas: applied.marcas,
    tipos: applied.tipos,
    requiereReceta:
      applied.receta === "con" ? true : applied.receta === "sin" ? false : null,
    soloDisponibles: applied.soloDisponibles,
    sort: applied.sort,
    page: applied.page,
    pageSize: CATALOG_PAGE_SIZE,
  };
}

export function countActiveFilters(applied: CatalogAppliedParams) {
  return (
    applied.clasificaciones.length +
    applied.marcas.length +
    applied.tipos.length +
    (applied.receta ? 1 : 0) +
    (applied.soloDisponibles ? 1 : 0)
  );
}

export function mergeAvailableBrands(serverBrands: string[] = []) {
  return [...new Set(serverBrands.map((item) => item.trim()).filter(Boolean))].sort(
    (a, b) => a.localeCompare(b, "es", { sensitivity: "base" }),
  );
}

export function normalizeMarcaKey(value: string) {
  return value.trim().toLowerCase();
}

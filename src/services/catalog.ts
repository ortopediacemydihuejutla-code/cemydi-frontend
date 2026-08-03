import { publicFetch } from "@/lib/api";
import { parseApiResponse } from "@/lib/api-error";
import {
  catalogProductDetailSchema,
  catalogResponseSchema,
} from "@/lib/schemas/catalog";

export type CatalogProduct = {
  id: number;
  slug?: string;
  nombre: string;
  marca: string;
  modelo: string;
  descripcion: string;
  medidas?: string | null;
  pesoSoportado?: string | null;
  material?: string | null;
  contenidoCaja?: string | null;
  indicacionesUso?: string | null;
  precio: number;
  clasificacion: string;
  stock: number;
  proveedor: string;
  tipoAdquisicion: "VENTA" | "RENTA" | "MIXTO";
  requiereReceta: boolean;
  rentalDailyPrice?: number | null;
  rentalMinDays?: number;
  rentalDeposit?: number;
  rentalTerms?: string | null;
  activo: boolean;
  imageUrl: string | null;
  images: Array<{
    id: number;
    imageUrl: string;
    sortOrder: number;
    createdAt: string;
  }>;
  createdAt: string;
};

export type RecommendedCatalogProduct = CatalogProduct & {
  recommendationScore: number;
  recommendationReasons: string[];
};

export type ActivePromotion = {
  id: number;
  productId: number;
  discountPercent: number;
  discountedPrice: number;
  imageStrategy?: "AUTO" | "CUSTOM";
  descripcion: string;
  startAt: string;
  endAt: string;
  imageUrl: string | null;
  createdAt: string;
  product: {
    id: number;
    slug?: string;
    nombre: string;
    marca: string;
    modelo: string;
    clasificacion: string;
    precio: number;
    stock: number;
    activo: boolean;
    tipoAdquisicion: "VENTA" | "RENTA" | "MIXTO";
    requiereReceta: boolean;
    imageUrl: string | null;
  };
};

export async function getCatalogProducts(params: {
  search?: string;
  clasificaciones?: string[];
  marcas?: string[];
  tipos?: Array<"VENTA" | "RENTA" | "MIXTO">;
  requiereReceta?: boolean | null;
  soloDisponibles?: boolean;
  sort?: string;
  page?: number;
  pageSize?: number;
}) {
  const searchParams = new URLSearchParams();

  if (params.search?.trim()) {
    searchParams.set("search", params.search.trim());
  }

  if (params.clasificaciones && params.clasificaciones.length > 0) {
    searchParams.set("clasificaciones", params.clasificaciones.join(","));
  }

  if (params.marcas && params.marcas.length > 0) {
    searchParams.set("marcas", params.marcas.join(","));
  }

  if (params.tipos && params.tipos.length > 0) {
    searchParams.set("tipos", params.tipos.join(","));
  }

  if (params.requiereReceta === true) {
    searchParams.set("requiereReceta", "true");
  } else if (params.requiereReceta === false) {
    searchParams.set("requiereReceta", "false");
  }

  if (params.soloDisponibles) {
    searchParams.set("soloDisponibles", "true");
  }

  if (params.sort && params.sort !== "reciente") {
    searchParams.set("sort", params.sort);
  }

  if (params.page && Number.isInteger(params.page) && params.page > 0) {
    searchParams.set("page", String(params.page));
  }

  if (
    params.pageSize &&
    Number.isInteger(params.pageSize) &&
    params.pageSize > 0
  ) {
    searchParams.set("pageSize", String(params.pageSize));
  }

  const query = searchParams.toString();
  const res = await publicFetch(`/products${query ? `?${query}` : ""}`);

  return parseApiResponse(
    res,
    "No se pudo cargar el catalogo",
    catalogResponseSchema,
  );
}

export async function getCatalogProductById(id: number) {
  const res = await publicFetch(`/products/${id}`);

  return parseApiResponse(
    res,
    "No se pudo cargar el producto",
    catalogProductDetailSchema,
  );
}

export async function getCatalogProductBySlug(slug: string) {
  const res = await publicFetch(`/products/slug/${encodeURIComponent(slug)}`);

  return parseApiResponse(
    res,
    "No se pudo cargar el producto",
    catalogProductDetailSchema,
  );
}

export async function getCatalogRecommendations(productId: number, limit = 5) {
  const res = await publicFetch(
    `/products/${productId}/recommendations?limit=${limit}`,
    {
      cache: "no-store",
    },
  );

  return parseApiResponse<{
    method: string;
    sourceProductId: number;
    recommendations: RecommendedCatalogProduct[];
  }>(res, "No se pudieron cargar las recomendaciones");
}

export async function getActivePromotions() {
  const res = await publicFetch("/promotions", { cache: "no-store" });

  return parseApiResponse<{ promotions: ActivePromotion[] }>(
    res,
    "No se pudo cargar promociones",
  );
}

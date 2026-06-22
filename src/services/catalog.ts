import { publicFetch } from "@/lib/api";
import { parseApiResponse } from "@/lib/api-error";
import {
  catalogProductDetailSchema,
  catalogResponseSchema,
} from "@/lib/schemas/catalog";

export type CatalogProduct = {
  id: number;
  nombre: string;
  marca: string;
  modelo: string;
  descripcion: string;
  precio: number;
  clasificacion: string;
  stock: number;
  proveedor: string;
  tipoAdquisicion: "VENTA" | "RENTA" | "MIXTO";
  requiereReceta: boolean;
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

export type ActivePromotion = {
  id: number;
  productId: number;
  descripcion: string;
  startAt: string;
  endAt: string;
  imageUrl: string | null;
  createdAt: string;
  product: {
    id: number;
    nombre: string;
    clasificacion: string;
    precio: number;
    stock: number;
    activo: boolean;
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

  if (params.pageSize && Number.isInteger(params.pageSize) && params.pageSize > 0) {
    searchParams.set("pageSize", String(params.pageSize));
  }

  const query = searchParams.toString();
  const res = await publicFetch(`/products${query ? `?${query}` : ""}`);

  return parseApiResponse(res, "No se pudo cargar el catalogo", catalogResponseSchema);
}

export async function getCatalogProductById(id: number) {
  const res = await publicFetch(`/products/${id}`);

  return parseApiResponse(res, "No se pudo cargar el producto", catalogProductDetailSchema);
}

export async function getActivePromotions() {
  const res = await publicFetch("/promotions", { cache: "no-store" });

  return parseApiResponse<{ promotions: ActivePromotion[] }>(
    res,
    "No se pudo cargar promociones",
  );
}

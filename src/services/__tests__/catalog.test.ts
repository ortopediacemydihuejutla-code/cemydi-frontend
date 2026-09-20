import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  getCatalogProducts,
  getCatalogProductById,
  getCatalogProductBySlug,
  getCatalogRecommendations,
  getActivePromotions,
} from "../catalog";
import * as api from "@/lib/api";

describe("Catalog Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("builds query parameters and fetches catalog products", async () => {
    const mockApiResponse = {
      ok: true,
      status: 200,
      json: async () => ({
        products: [
          {
            id: 1,
            slug: "silla-ruedas",
            nombre: "Silla de ruedas",
            marca: "Ortomex",
            modelo: "STD-01",
            descripcion: "Silla comoda",
            precio: 3500,
            clasificacion: "Movilidad",
            stock: 5,
            proveedor: "Medica",
            tipoAdquisicion: "VENTA",
            requiereReceta: false,
            activo: true,
            imageUrl: null,
            images: [],
            createdAt: "2026-01-01",
          },
        ],
        filters: {
          clasificaciones: ["Movilidad"],
          marcas: ["Ortomex"],
        },
        pagination: {
          page: 1,
          pageSize: 12,
          total: 1,
          totalPages: 1,
          hasPrevious: false,
          hasNext: false,
        },
      }),
    };

    const spy = vi.spyOn(api, "publicFetch").mockResolvedValue(mockApiResponse as unknown as Response);

    const result = await getCatalogProducts({
      search: "silla",
      clasificaciones: ["Movilidad"],
      marcas: ["Ortomex"],
      tipos: ["VENTA"],
      requiereReceta: false,
      soloDisponibles: true,
      sort: "precio_asc",
      page: 1,
      pageSize: 12,
    });

    expect(spy).toHaveBeenCalledTimes(1);
    const calledUrl = spy.mock.calls[0][0];
    expect(calledUrl).toContain("search=silla");
    expect(calledUrl).toContain("clasificaciones=Movilidad");
    expect(calledUrl).toContain("marcas=Ortomex");
    expect(calledUrl).toContain("tipos=VENTA");
    expect(calledUrl).toContain("requiereReceta=false");
    expect(calledUrl).toContain("soloDisponibles=true");
    expect(calledUrl).toContain("sort=precio_asc");
    expect(calledUrl).toContain("page=1");
    expect(calledUrl).toContain("pageSize=12");

    expect(result.products).toHaveLength(1);
    expect(result.products[0].nombre).toBe("Silla de ruedas");
  });

  it("fetches a single catalog product by id", async () => {
    const mockApiResponse = {
      ok: true,
      status: 200,
      json: async () => ({
        product: {
          id: 5,
          slug: "muleta-aluminio",
          nombre: "Muleta de aluminio",
          marca: "Ortomex",
          modelo: "M-1",
          descripcion: "Muleta ligera",
          precio: 450,
          clasificacion: "Movilidad",
          stock: 10,
          proveedor: "Medica",
          tipoAdquisicion: "VENTA",
          requiereReceta: false,
          activo: true,
          imageUrl: null,
          images: [],
          createdAt: "2026-01-01",
        },
      }),
    };

    const spy = vi.spyOn(api, "publicFetch").mockResolvedValue(mockApiResponse as unknown as Response);

    const result = await getCatalogProductById(5);
    expect(spy).toHaveBeenCalledWith("/products/5");
    expect(result.product.id).toBe(5);
  });

  it("fetches product by slug", async () => {
    const mockApiResponse = {
      ok: true,
      status: 200,
      json: async () => ({
        product: {
          id: 7,
          slug: "baston-4-apoyos",
          nombre: "Baston de 4 apoyos",
          marca: "Ortomex",
          modelo: "B-4",
          descripcion: "Baston comodo",
          precio: 300,
          clasificacion: "Movilidad",
          stock: 8,
          proveedor: "Medica",
          tipoAdquisicion: "VENTA",
          requiereReceta: false,
          activo: true,
          imageUrl: null,
          images: [],
          createdAt: "2026-01-01",
        },
      }),
    };

    const spy = vi.spyOn(api, "publicFetch").mockResolvedValue(mockApiResponse as unknown as Response);

    const result = await getCatalogProductBySlug("baston-4-apoyos");
    expect(spy).toHaveBeenCalledWith("/products/slug/baston-4-apoyos");
    expect(result.product.slug).toBe("baston-4-apoyos");
  });

  it("fetches product recommendations", async () => {
    const mockApiResponse = {
      ok: true,
      status: 200,
      json: async () => ({
        method: "CLUSTER",
        sourceProductId: 5,
        recommendations: [],
      }),
    };

    const spy = vi.spyOn(api, "publicFetch").mockResolvedValue(mockApiResponse as unknown as Response);

    const result = await getCatalogRecommendations(5, 3);
    expect(spy).toHaveBeenCalledWith("/products/5/recommendations?limit=3", {
      cache: "no-store",
    });
    expect(result.sourceProductId).toBe(5);
  });

  it("fetches active promotions", async () => {
    const mockApiResponse = {
      ok: true,
      status: 200,
      json: async () => ({
        promotions: [],
      }),
    };

    const spy = vi.spyOn(api, "publicFetch").mockResolvedValue(mockApiResponse as unknown as Response);

    const result = await getActivePromotions();
    expect(spy).toHaveBeenCalledWith("/promotions", { cache: "no-store" });
    expect(result.promotions).toEqual([]);
  });
});

import { describe, expect, it } from "vitest";
import { filterOfflineProducts, findOfflineProduct, maintainProducts, mergeProducts, OFFLINE_TTL, toOfflineProduct } from "./products";
import { canUseOfflineFallback } from "./errors";
import { ApiError, ApiResponseValidationError } from "@/lib/api-error";
import { isOfflinePublicPath, isPublicImage } from "./policy";
import type { CatalogProduct } from "@/services/catalog";
import { parseCatalogSearchParams } from "@/app/catalogo/utils/catalog-params";

const now = 1_800_000_000_000;
function product(id = 1): CatalogProduct {
  return { id, nombre: `Producto ${id}`, slug: `producto-${id}`, marca: "CEMYDI", modelo: "A", descripcion: "Movilidad", precio: 9876, stock: 3, proveedor: "Privado", clasificacion: "Movilidad", tipoAdquisicion: "VENTA", requiereReceta: false, activo: true, imageUrl: null, images: [], createdAt: "2026-10-11", medidas: "20 cm", rentalDeposit: 500 };
}
describe("productos públicos offline", () => {
  it("proyecta únicamente campos públicos y valida la frontera", () => {
    const saved = toOfflineProduct(product(), true, "alias-visto", now);
    expect(saved).not.toHaveProperty("precio");
    expect(saved).not.toHaveProperty("stock");
    expect(saved).not.toHaveProperty("proveedor");
    expect(saved).not.toHaveProperty("rentalDeposit");
    expect(saved.detail?.medidas).toBe("20 cm");
    expect(saved.aliases).toContain("alias-visto");
    expect(() => toOfflineProduct({ ...product(), nombre: undefined } as unknown as CatalogProduct)).toThrow();
  });
  it("deduplica y conserva el detalle y aliases al actualizar desde una lista", () => {
    const old = toOfflineProduct(product(), true, "anterior", now - 100);
    const next = toOfflineProduct(product(), false, "nuevo", now);
    const merged = mergeProducts([old], [next, next], now);
    expect(merged).toHaveLength(1);
    expect(merged[0].aliases).toEqual(expect.arrayContaining(["anterior", "nuevo", "1"]));
    expect(merged[0].detail?.updatedAt).toBe(now - 100);
    expect(merged[0].updatedAt).toBe(now);
  });
  it("expira a los 30 días exactos sin renovar por lectura", () => {
    const saved = toOfflineProduct(product(), true, undefined, now - OFFLINE_TTL + 1);
    expect(maintainProducts([saved], now)[0].updatedAt).toBe(saved.updatedAt);
    expect(maintainProducts([saved], now + 1)).toEqual([]);
  });
  it("una actualización de lista no renueva la vigencia del detalle", () => {
    const old = toOfflineProduct(product(), true, undefined, now - OFFLINE_TTL);
    const next = toOfflineProduct(product(), false, undefined, now);
    expect(mergeProducts([old], [next], now)[0].detail).toBeUndefined();
  });
  it("elimina registros incompatibles y fechas futuras", () => {
    expect(maintainProducts([{ id: 3 }, toOfflineProduct(product(), false, undefined, now + 1)], now)).toEqual([]);
  });
  it("limita a 200 y elimina los más antiguos con sus detalles y aliases", () => {
    const saved = Array.from({ length: 201 }, (_, index) => toOfflineProduct(product(index + 1), true, `alias-${index}`, now - index));
    const maintained = maintainProducts(saved, now);
    expect(maintained).toHaveLength(200);
    expect(findOfflineProduct(maintained, "201")).toBeNull();
    expect(findOfflineProduct(maintained, "alias-200")).toBeNull();
  });
  it("resuelve ID y slug y rechaza aliases ambiguos", () => {
    const a = toOfflineProduct(product(1), false, "compartido", now);
    const b = toOfflineProduct(product(2), false, "compartido", now);
    expect(findOfflineProduct([a, b], "1")?.id).toBe(1);
    expect(findOfflineProduct([a, b], "producto-2")?.id).toBe(2);
    expect(findOfflineProduct([a, b], "compartido")).toBeNull();
  });
  it("pagina 48 registros en dos páginas locales de 24", () => {
    const saved = Array.from({ length: 48 }, (_, index) => toOfflineProduct(product(index + 1), false, undefined, now));
    const filters = { searchQuery: "", clasificaciones: [], marcas: [], tipos: [], receta: null, soloDisponibles: false, sort: "nombre-asc", view: "grid", page: 2 } as const;
    const result = filterOfflineProducts(saved, { ...filters, clasificaciones: [], marcas: [], tipos: [] });
    expect(result.products).toHaveLength(24);
    expect(result.totalPages).toBe(2);
    expect(result.total).toBe(48);
  });
  it("aplica búsqueda, marca, clasificación, adquisición y receta sin red", () => {
    const a = toOfflineProduct(product(), false, undefined, now);
    const b = toOfflineProduct({ ...product(2), requiereReceta: true, tipoAdquisicion: "RENTA", marca: "Otra" }, false, undefined, now);
    const result = filterOfflineProducts([a, b], { searchQuery: "movilidad", clasificaciones: ["Movilidad"], marcas: ["otra"], tipos: ["RENTA"], receta: "con", soloDisponibles: false, sort: "nombre-desc", view: "grid", page: 1 });
    expect(result.products.map((item) => item.id)).toEqual([2]);
  });
  it("ordena por creación y conserva el orden del servidor en fechas iguales", () => {
    const a = toOfflineProduct({ ...product(1), nombre: "Zeta", createdAt: "2026-10-13" }, false, undefined, now - 100);
    const b = toOfflineProduct({ ...product(2), nombre: "Alfa", createdAt: "2026-10-10" }, false, undefined, now);
    const filters = parseCatalogSearchParams(new URLSearchParams());
    expect(filterOfflineProducts([b, a], filters).products.map((item) => item.id)).toEqual([1, 2]);
    const c = toOfflineProduct({ ...product(3), createdAt: a.createdAt! }, false, undefined, now);
    expect(filterOfflineProducts([a, c, b], filters, [3, 1, 2]).products.map((item) => item.id)).toEqual([3, 1, 2]);
    expect(filterOfflineProducts([a, c, b], { ...filters, sort: "precio-asc" }, [2, 3, 1]).products.map((item) => item.id)).toEqual([2, 3, 1]);
  });
  it("sigue leyendo productos antiguos sin fecha de creación", () => {
    const legacy = toOfflineProduct(product(), false, undefined, now);
    delete legacy.createdAt;
    expect(maintainProducts([legacy], now)).toHaveLength(1);
  });
});
describe("política offline", () => {
  it("permite fallos de transporte y 5xx, pero excluye errores de cliente", () => {
    expect(canUseOfflineFallback(new TypeError("fetch failed"))).toBe(true);
    expect(canUseOfflineFallback(new ApiError("down", 503))).toBe(true);
    expect(canUseOfflineFallback(new ApiResponseValidationError({}))).toBe(false);
    for (const status of [400, 401, 403, 404, 422]) expect(canUseOfflineFallback(new ApiError("error", status))).toBe(false);
  });
  it("no admite rutas privadas como navegaciones públicas", () => {
    for (const route of ["/admin", "/mi-cuenta", "/perfil", "/carrito", "/mis-pedidos", "/mis-rentas", "/favoritos", "/configuracion", "/login", "/register", "/auth/login", "/users/me"]) expect(isOfflinePublicPath(route)).toBe(false);
    expect(isOfflinePublicPath("/producto/silla-de-ruedas")).toBe(true);
  });
  it("valida el origen también dentro del optimizador Next", () => {
    const origin = "https://cemydi.test";
    expect(isPublicImage(new URL("/_next/image?url=https%3A%2F%2Fevil.test%2Fimage.png", origin), origin)).toBe(false);
    expect(isPublicImage(new URL("https://res.cloudinary.com/demo/image/upload/product.png"), origin)).toBe(true);
    expect(isPublicImage(new URL("/api/rentals/prescription.png", origin), origin)).toBe(false);
  });
});

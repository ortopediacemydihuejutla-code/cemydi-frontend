import { describe, expect, it, vi } from "vitest";

import type { CatalogProduct } from "@/services/catalog";
import {
  buildProductShareData,
  buildProductShareDescription,
  copyProductShareLink,
  getProductShareImageUrl,
  getProductSharePhrase,
  getWhatsAppShareUrl,
} from "@/lib/product-share";

const baseProduct: CatalogProduct = {
  id: 42,
  nombre: "Tanque oxigeno 2549L",
  marca: "INFRA",
  modelo: "TO220210C",
  descripcion: "",
  precio: 16900,
  clasificacion: "Equipo Medico",
  stock: 3,
  proveedor: "CEMYDI",
  tipoAdquisicion: "RENTA",
  requiereReceta: false,
  rentalDailyPrice: 500,
  rentalMinDays: 1,
  rentalDeposit: 0,
  rentalTerms: null,
  activo: true,
  imageUrl:
    "https://res.cloudinary.com/demo/image/upload/v1710000000/cemydi/tanque.png",
  images: [],
  createdAt: "2026-01-01T00:00:00.000Z",
};

describe("product-share", () => {
  it("construye texto de renta con tarifa y url publica", () => {
    const shareData = buildProductShareData(baseProduct, "https://cemydi.mx/");

    expect(shareData.title).toBe("Tanque oxigeno 2549L | CEMYDI");
    expect(shareData.url).toBe("https://cemydi.mx/producto/42");
    expect(shareData.text).toContain("Renta Tanque oxigeno 2549L en CEMYDI");
    expect(shareData.text).toContain("$500");
    expect(shareData.text).toContain("Ver producto: https://cemydi.mx/producto/42");
  });

  it("agrega nota medica cuando requiere receta", () => {
    const product = {
      ...baseProduct,
      requiereReceta: true,
      tipoAdquisicion: "VENTA" as const,
    };

    expect(getProductSharePhrase(product).length).toBeGreaterThan(0);
    expect(buildProductShareData(product, "https://cemydi.mx").text).toContain(
      "puede requerir receta",
    );
  });

  it("optimiza imagenes Cloudinary para tarjetas sociales", () => {
    const imageUrl = getProductShareImageUrl(baseProduct, "https://cemydi.mx");

    expect(imageUrl).toContain("/image/upload/c_fill,w_1200,h_630,q_auto,f_auto/");
    expect(imageUrl).toContain("https://res.cloudinary.com/");
  });

  it("usa descripcion automatica cuando el producto no tiene descripcion", () => {
    const description = buildProductShareDescription(baseProduct);

    expect(description).toContain("Disponible para renta en CEMYDI");
    expect(description).toContain("$500");
  });

  it("codifica el texto para WhatsApp", () => {
    const shareData = buildProductShareData(baseProduct, "https://cemydi.mx");

    expect(getWhatsAppShareUrl(shareData)).toContain("https://wa.me/?text=");
    expect(getWhatsAppShareUrl(shareData)).toContain("Tanque%20oxigeno");
  });

  it("copia solo la url del producto", async () => {
    const shareData = buildProductShareData(baseProduct, "https://cemydi.mx");
    const originalClipboard = navigator.clipboard;
    const writeText = vi.fn().mockResolvedValue(undefined);

    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    await expect(copyProductShareLink(shareData)).resolves.toBe("copied");
    expect(writeText).toHaveBeenCalledWith("https://cemydi.mx/producto/42");

    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: originalClipboard,
    });
  });
});

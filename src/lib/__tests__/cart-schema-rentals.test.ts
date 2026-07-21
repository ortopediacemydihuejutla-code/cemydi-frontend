import { describe, expect, it } from "vitest";
import { cartResponseSchema } from "@/lib/schemas/cart";

const baseProduct = {
  id: 1,
  slug: "silla-de-ruedas",
  nombre: "Silla de ruedas",
  marca: "Drive",
  modelo: "RX",
  descripcion: "Equipo de movilidad",
  precio: 1000,
  clasificacion: "Movilidad",
  stock: 3,
  proveedor: "CEMYDI",
  tipoAdquisicion: "MIXTO" as const,
  requiereReceta: false,
  rentalDailyPrice: 120,
  rentalMinDays: 2,
  rentalDeposit: 300,
  rentalTerms: "Sujeto a aprobación",
  activo: true,
  imageUrl: null,
};

describe("cartResponseSchema rentals", () => {
  it("accepts mixed sale and rental cart items", () => {
    const result = cartResponseSchema.parse({
      cart: {
        id: "cart_1",
        createdAt: "2026-06-23T00:00:00.000Z",
        updatedAt: "2026-06-23T00:00:00.000Z",
        items: [
          {
            id: 1,
            mode: "VENTA",
            quantity: 1,
            createdAt: "2026-06-23T00:00:00.000Z",
            updatedAt: "2026-06-23T00:00:00.000Z",
            lineTotal: 1000,
            availability: {
              isAvailable: true,
              maxQuantity: 3,
              reason: null,
            },
            product: baseProduct,
          },
          {
            id: 2,
            mode: "RENTA",
            quantity: 2,
            rentalStartDate: "2026-06-25T00:00:00.000Z",
            rentalEndDate: "2026-06-27T00:00:00.000Z",
            rentalDays: 3,
            rentalNotes: "Entrega por la tarde",
            createdAt: "2026-06-23T00:00:00.000Z",
            updatedAt: "2026-06-23T00:00:00.000Z",
            lineTotal: 1320,
            rentalSummary: {
              dailyPrice: 120,
              minDays: 2,
              deposit: 300,
              subtotal: 720,
              depositTotal: 600,
              total: 1320,
            },
            availability: {
              isAvailable: true,
              maxQuantity: 3,
              reason: null,
            },
            product: baseProduct,
          },
        ],
        summary: {
          distinctItems: 2,
          totalQuantity: 3,
          subtotal: 1720,
          saleSubtotal: 1000,
          rentalSubtotal: 720,
          rentalDepositTotal: 600,
          total: 2320,
          saleItems: 1,
          rentalItems: 1,
          hasUnavailableItems: false,
        },
      },
    });

    expect(result.cart.items.map((item) => item.mode)).toEqual(["VENTA", "RENTA"]);
    expect(result.cart.summary.rentalDepositTotal).toBe(600);
  });

  it("accepts an unconfigured rental with nullable totals and a safe document summary", () => {
    const result = cartResponseSchema.parse({
      cart: {
        id: "cart_1",
        createdAt: "2026-07-18T00:00:00.000Z",
        updatedAt: "2026-07-18T00:00:00.000Z",
        items: [
          {
            id: 2,
            mode: "RENTA",
            configurationStatus: "PENDING",
            quantity: 1,
            rentalStartDate: null,
            rentalEndDate: null,
            rentalDays: null,
            createdAt: "2026-07-18T00:00:00.000Z",
            updatedAt: "2026-07-18T00:00:00.000Z",
            lineTotal: null,
            rentalSummary: {
              dailyPrice: 120,
              minDays: 2,
              deposit: 300,
              subtotal: null,
              depositTotal: 300,
              total: null,
            },
            document: {
              id: "document-1",
              originalFilename: "receta.pdf",
              mimeType: "application/pdf",
              bytes: 500,
              status: "PENDIENTE",
              uploadedAt: "2026-07-18T00:00:00.000Z",
              associatedAt: null,
            },
            availability: { isAvailable: true, maxQuantity: 3, reason: null },
            product: { ...baseProduct, requiereReceta: true },
          },
        ],
        summary: {
          distinctItems: 1,
          totalQuantity: 1,
          subtotal: 0,
          saleSubtotal: 0,
          rentalSubtotal: 0,
          rentalDepositTotal: 0,
          total: 0,
          saleItems: 0,
          rentalItems: 1,
          hasUnavailableItems: false,
          hasUnconfiguredRentalItems: true,
        },
      },
    });

    expect(result.cart.items[0].lineTotal).toBeNull();
    expect(result.cart.items[0].document).not.toHaveProperty("publicId");
    expect(result.cart.items[0].document).not.toHaveProperty("assetId");
  });
});

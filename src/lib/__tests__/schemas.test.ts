import { describe, expect, it } from "vitest";

import { authProfileResponseSchema, authUserSchema } from "@/lib/schemas/auth";
import { cartResponseSchema } from "@/lib/schemas/cart";
import { catalogProductSchema, catalogResponseSchema } from "@/lib/schemas/catalog";

describe("zod schemas validation", () => {
  describe("authUserSchema", () => {
    it("validates valid user structure", () => {
      const valid = {
        id: 10,
        nombre: "Juan Pérez",
        correo: "juan@example.com",
        activo: true,
        rol: "CLIENT",
        emailVerified: true,
        emailVerifiedAt: "2026-02-01T10:00:00Z",
        telefono: "7711234567",
        direccion: "Calle Hidalgo 45",
      };

      const result = authUserSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("fails when required fields are missing", () => {
      const invalid = { id: 1, nombre: "Incompleto" };
      const result = authUserSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("validates authProfileResponseSchema with null or populated user", () => {
      expect(authProfileResponseSchema.safeParse({ user: null }).success).toBe(true);
    });
  });

  describe("catalogProductSchema & catalogResponseSchema", () => {
    it("validates catalog product with images array", () => {
      const product = {
        id: 101,
        nombre: "Silla de Ruedas Estándar",
        marca: "Drive",
        modelo: "Cruiser III",
        descripcion: "Silla de ruedas plegable resistente",
        precio: 3500,
        clasificacion: "Movilidad",
        stock: 5,
        proveedor: "Proveedor CEM",
        tipoAdquisicion: "MIXTO",
        requiereReceta: false,
        activo: true,
        imageUrl: "https://res.cloudinary.com/cemydi/image.jpg",
        images: [
          {
            id: 1,
            imageUrl: "https://res.cloudinary.com/cemydi/img1.jpg",
            sortOrder: 0,
            createdAt: "2026-01-01T00:00:00Z",
          },
        ],
        createdAt: "2026-01-01T00:00:00Z",
      };

      expect(catalogProductSchema.safeParse(product).success).toBe(true);
      expect(
        catalogResponseSchema.safeParse({
          products: [product],
          pagination: {
            page: 1,
            pageSize: 12,
            total: 1,
            totalPages: 1,
            hasPrevious: false,
            hasNext: false,
          },
        }).success,
      ).toBe(true);
    });
  });

  describe("cartResponseSchema", () => {
    it("validates a cart payload structure", () => {
      const cart = {
        cart: {
          id: "cart-123",
          createdAt: "2026-03-01T00:00:00Z",
          updatedAt: "2026-03-01T00:00:00Z",
          items: [],
          summary: {
            distinctItems: 0,
            totalQuantity: 0,
            subtotal: 0,
            hasUnavailableItems: false,
            hasUnconfiguredRentalItems: false,
          },
        },
      };

      expect(cartResponseSchema.safeParse(cart).success).toBe(true);
    });
  });
});

import { describe, expect, it } from "vitest";

import {
  defaultPromotionForm,
  localISODate,
  promotionStatus,
  validatePromotionForm,
} from "@/app/admin/promotions/utils/promotion-validators";

describe("promotion-validators", () => {
  it("rechaza una descripción demasiado corta", () => {
    const today = localISODate(new Date());
    const result = validatePromotionForm(
      {
        ...defaultPromotionForm,
        productIds: [1],
        startAt: today,
        endAt: today,
        descripcion: "abc",
      },
      today,
    );

    expect(result).toMatch(/Descripción inválida/);
  });

  it("acepta un formulario válido con varios productos", () => {
    const today = localISODate(new Date());
    const result = validatePromotionForm(
      {
        ...defaultPromotionForm,
        productIds: [10, 22],
        startAt: today,
        endAt: today,
        descripcion: "Descuento de verano en productos seleccionados",
      },
      today,
    );

    expect(result).toBeNull();
  });

  it("calcula el estado de una campaña activa", () => {
    const now = Date.now();
    const status = promotionStatus({
      id: 1,
      discountPercent: 20,
      descripcion: "Test",
      startAt: new Date(now - 86_400_000).toISOString(),
      endAt: new Date(now + 86_400_000).toISOString(),
      imageStrategy: "AUTO",
      imageUrl: null,
      displayImageUrl: null,
      productCount: 1,
      createdAt: new Date().toISOString(),
      products: [
        {
          id: 1,
          nombre: "Producto",
          clasificacion: "Movilidad",
          precio: 100,
          stock: 5,
          activo: true,
          imageUrl: null,
        },
      ],
    });

    expect(status.label).toBe("Activa");
  });

  it("rechaza descuentos fuera del rango permitido", () => {
    const today = localISODate(new Date());
    const result = validatePromotionForm(
      {
        ...defaultPromotionForm,
        productIds: [1],
        discountPercent: "0",
        startAt: today,
        endAt: today,
        descripcion: "Promoción de prueba",
      },
      today,
    );

    expect(result).toMatch(/entre 1% y 90%/);
  });
});

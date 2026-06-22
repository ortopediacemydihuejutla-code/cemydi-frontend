import { describe, expect, it } from "vitest";

import {
  defaultPromotionForm,
  localISODate,
  promotionStatus,
  validatePromotionForm,
} from "@/app/admin/promotions/utils/promotion-validators";

describe("promotion-validators", () => {
  it("rechaza descripción demasiado corta", () => {
    const today = localISODate(new Date());
    const result = validatePromotionForm(
      {
        ...defaultPromotionForm,
        productId: "1",
        startAt: today,
        endAt: today,
        descripcion: "abc",
      },
      today,
    );

    expect(result).toMatch(/Descripción inválida/);
  });

  it("acepta formulario válido", () => {
    const today = localISODate(new Date());
    const result = validatePromotionForm(
      {
        ...defaultPromotionForm,
        productId: "10",
        startAt: today,
        endAt: today,
        descripcion: "Descuento de verano en sillas",
      },
      today,
    );

    expect(result).toBeNull();
  });

  it("calcula estado de promoción activa", () => {
    const now = Date.now();
    const status = promotionStatus({
      id: 1,
      productId: 1,
      descripcion: "Test",
      startAt: new Date(now - 86_400_000).toISOString(),
      endAt: new Date(now + 86_400_000).toISOString(),
      imageUrl: null,
      createdAt: new Date().toISOString(),
      product: {
        id: 1,
        nombre: "Producto",
        clasificacion: "Movilidad",
        precio: 100,
        stock: 5,
        activo: true,
      },
    });

    expect(status.label).toBe("Activa");
  });
});

import { describe, expect, it } from "vitest";

import {
  buildAdminNotifications,
  searchAdminDestinations,
} from "./admin-header-data";

describe("searchAdminDestinations", () => {
  it("encuentra módulos por nombre, palabra clave y sin depender de acentos", () => {
    expect(searchAdminDestinations("inventario")[0]?.href).toBe("/admin/products");
    expect(searchAdminDestinations("resenas")[0]?.href).toBe("/admin/reviews");
    expect(searchAdminDestinations("privacidad")[0]?.href).toBe("/admin/legal");
  });

  it("no despliega resultados sin consulta", () => {
    expect(searchAdminDestinations("   ")).toEqual([]);
  });
});

describe("buildAdminNotifications", () => {
  it("crea alertas accionables con sus destinos", () => {
    const notifications = buildAdminNotifications({
      productsLowStock: 2,
      reviewsPending: 1,
      rentalsPending: 3,
    });

    expect(notifications.map((item) => item.href)).toEqual([
      "/admin/rentals",
      "/admin/reviews",
      "/admin/products",
    ]);
    expect(notifications.every((item) => item.actionable)).toBe(true);
  });

  it("muestra un estado saludable cuando no hay pendientes", () => {
    expect(
      buildAdminNotifications({
        productsLowStock: 0,
        reviewsPending: 0,
        rentalsPending: 0,
      }),
    ).toEqual([
      expect.objectContaining({ id: "all-clear", actionable: false }),
    ]);
  });
});

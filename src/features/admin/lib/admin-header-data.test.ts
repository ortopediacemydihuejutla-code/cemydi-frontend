import { describe, expect, it } from "vitest";

import {
  buildAdminNotifications,
  formatNotificationTime,
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

describe("formatNotificationTime", () => {
  const now = new Date("2026-07-20T18:00:00.000Z").getTime();

  it("formatea tiempos recientes de forma compacta", () => {
    expect(formatNotificationTime("2026-07-20T17:59:40.000Z", now)).toBe("Ahora");
    expect(formatNotificationTime("2026-07-20T17:48:00.000Z", now)).toBe("Hace 12 min");
    expect(formatNotificationTime("2026-07-20T16:00:00.000Z", now)).toBe("Hace 2 horas");
    expect(formatNotificationTime("2026-07-19T18:00:00.000Z", now)).toBe("Hace 1 día");
  });

  it("tolera fechas inválidas", () => {
    expect(formatNotificationTime("fecha-inválida", now)).toBe("Ahora");
  });
});

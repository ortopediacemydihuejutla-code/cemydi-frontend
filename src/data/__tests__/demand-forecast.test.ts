import { describe, expect, it } from "vitest";

import {
  getDemandDifference,
  getDemandStatus,
} from "../demand-forecast";
import type { DemandForecast } from "../demand-forecast";

const forecast = (shortage: number): DemandForecast => ({
  id: shortage,
  productName: "Producto de prueba",
  shortName: "Producto",
  classification: "Prueba",
  acquisitionType: "VENTA",
  active: true,
  price: 100,
  currentStock: 20,
  month: 8,
  previousMonthSales: 5,
  previousMonthRentals: 0,
  previousMonthViews: 10,
  activePromotion: false,
  predictedDemandDecimal: 20 + shortage,
  predictedDemand: 20 + shortage,
  shortage,
  recommendation: "Revisar inventario.",
});

describe("demandForecast", () => {
  it("calcula la diferencia sin modificar los registros", () => {
    const item = forecast(10);

    expect(getDemandDifference(item)).toBe(10);
    expect(item.currentStock).toBe(20);
    expect(item.predictedDemand).toBe(30);
  });

  it.each([
    [8, 18, "Faltante crítico"],
    [30, 38, "Posible faltante"],
    [17, 17, "Stock justo"],
    [24, 22, "Stock suficiente"],
  ] as const)("clasifica stock %i y demanda %i como %s", (stock, demand, status) => {
    expect(getDemandStatus(stock, demand)).toBe(status);
  });

  it("usa el faltante calculado por el API como diferencia", () => {
    const item = forecast(-4);

    expect(getDemandDifference(item)).toBe(-4);
    expect(getDemandStatus(item.currentStock, item.predictedDemand)).toBe(
      "Stock suficiente",
    );
  });
});

import { describe, expect, it } from "vitest";

import {
  demandForecast,
  getDemandDifference,
  getDemandStatus,
} from "../demand-forecast";

describe("demandForecast", () => {
  it("calcula la diferencia sin modificar los registros", () => {
    const forecast = demandForecast[0];

    expect(getDemandDifference(forecast)).toBe(10);
    expect(forecast.currentStock).toBe(8);
    expect(forecast.predictedDemand).toBe(18);
  });

  it.each([
    [8, 18, "Alta demanda"],
    [30, 38, "Posible faltante"],
    [17, 17, "Revisar inventario"],
    [24, 22, "Stock suficiente"],
  ] as const)("clasifica stock %i y demanda %i como %s", (stock, demand, status) => {
    expect(getDemandStatus(stock, demand)).toBe(status);
  });

  it("mantiene los indicadores derivados en valores consistentes", () => {
    const totalDemand = demandForecast.reduce(
      (total, forecast) => total + forecast.predictedDemand,
      0,
    );
    const shortages = demandForecast.filter(
      (forecast) => getDemandDifference(forecast) > 0,
    );
    const highDemand = demandForecast.filter(
      (forecast) =>
        getDemandStatus(forecast.currentStock, forecast.predictedDemand) ===
        "Alta demanda",
    );

    expect(totalDemand).toBe(150);
    expect(shortages).toHaveLength(5);
    expect(highDemand).toHaveLength(2);
  });
});

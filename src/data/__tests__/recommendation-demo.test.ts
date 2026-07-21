import { describe, expect, it } from "vitest";

import {
  getMatchingDemoRules,
  selectDemoRecommendations,
} from "@/data/recommendation-demo";

const products = [
  { id: 7, nombre: "Silla de Ruedas", clasificacion: "Movilidad" },
  { id: 22, nombre: "Llanta delantera silla ruedas", clasificacion: "Movilidad" },
  { id: 23, nombre: "Descansabrazo largo silla ruedas", clasificacion: "Movilidad" },
  { id: 35, nombre: "Asiento nylon silla ruedas", clasificacion: "Movilidad" },
  { id: 36, nombre: "Elevapiernas cromado silla ruedas", clasificacion: "Movilidad" },
  { id: 12, nombre: "Termómetro digital", clasificacion: "Diagnóstico" },
];

describe("recommendation demo", () => {
  it("matches the configured wheelchair product by its real catalog id", () => {
    const rules = getMatchingDemoRules([products[0]]);

    expect(rules).toHaveLength(1);
  });

  it("selects every available accessory in the configured order", () => {
    const result = selectDemoRecommendations([products[0]], products);

    expect(result.map((product) => product.id)).toEqual([22, 23, 35, 36]);
    expect(result.some((product) => product.id === products[0].id)).toBe(false);
  });

  it("returns no products when there is no demo rule", () => {
    const result = selectDemoRecommendations([products[5]], products);

    expect(result).toEqual([]);
  });
});

import { describe, expect, it } from "vitest";

import {
  formatCurrencyMx,
  formatDateEsMx,
  formatNumberEsMx,
  formatOfferEnd,
} from "@/lib/formatters";

describe("formatters", () => {
  it("formatea moneda MXN sin decimales", () => {
    expect(formatCurrencyMx(1500, { fractionDigits: 0 })).toContain("1,500");
    expect(formatCurrencyMx(1500, { fractionDigits: 0 })).toContain("$");
  });

  it("formatea números en es-MX", () => {
    expect(formatNumberEsMx(12345)).toBe("12,345");
  });

  it("formatea fechas cortas", () => {
    const formatted = formatDateEsMx("2024-06-15T12:00:00.000Z", { style: "short" });
    expect(formatted).not.toBe("Sin fecha");
    expect(formatted).toMatch(/2024/);
  });

  it("formatea fin de oferta", () => {
    const formatted = formatOfferEnd("2024-12-25T00:00:00.000Z");
    expect(formatted.length).toBeGreaterThan(0);
  });
});

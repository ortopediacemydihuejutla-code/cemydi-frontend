import { describe, expect, it } from "vitest";

import {
  calculateDiscountedPrice,
  getSavingsAmount,
} from "@/lib/promotion-pricing";

describe("promotion-pricing", () => {
  describe("calculateDiscountedPrice", () => {
    it("correctly calculates discount with 2 decimal precision", () => {
      expect(calculateDiscountedPrice(1000, 20)).toBe(800);
      expect(calculateDiscountedPrice(299.99, 15)).toBe(254.99);
      expect(calculateDiscountedPrice(50, 0)).toBe(50);
      expect(calculateDiscountedPrice(50, 100)).toBe(0);
    });
  });

  describe("getSavingsAmount", () => {
    it("correctly calculates absolute savings amount", () => {
      expect(getSavingsAmount(1000, 800)).toBe(200);
      expect(getSavingsAmount(299.99, 254.99)).toBe(45);
    });

    it("prevents negative savings when discountedPrice exceeds originalPrice", () => {
      expect(getSavingsAmount(100, 120)).toBe(0);
    });
  });
});

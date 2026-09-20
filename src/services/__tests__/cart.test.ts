import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  getMyCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearMyCart,
  clearMyRentalItems,
  applyCartCoupon,
  removeCartCoupon,
} from "../cart";
import * as apiFetchModule from "@/lib/api-fetch";

describe("Cart Service", () => {
  const dummyCart = {
    id: "cart-1",
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
    items: [],
    appliedCoupon: null,
    summary: {
      distinctItems: 0,
      totalQuantity: 0,
      subtotal: 0,
      saleSubtotal: 0,
      rentalSubtotal: 0,
      rentalDepositTotal: 0,
      total: 0,
      saleItems: 0,
      rentalItems: 0,
      promotionDiscountTotal: 0,
      couponDiscountTotal: 0,
      discountTotal: 0,
      hasUnavailableItems: false,
      hasUnconfiguredRentalItems: false,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getMyCart fetches current cart", async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      json: async () => ({ cart: dummyCart }),
    };
    const spy = vi.spyOn(apiFetchModule, "apiFetch").mockResolvedValue(mockResponse as unknown as Response);

    const result = await getMyCart();
    expect(spy).toHaveBeenCalledWith("/cart", { method: "GET" });
    expect(result.cart).toEqual(dummyCart);
  });

  it("addCartItem sends POST to /cart/items", async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      json: async () => ({ cart: dummyCart, message: "Agregado" }),
    };
    const spy = vi.spyOn(apiFetchModule, "apiFetch").mockResolvedValue(mockResponse as unknown as Response);

    const result = await addCartItem({ productId: 10, quantity: 2, mode: "VENTA" });
    expect(spy).toHaveBeenCalledWith("/cart/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: 10, quantity: 2, mode: "VENTA" }),
    });
    expect(result.message).toBe("Agregado");
  });

  it("updateCartItem sends PATCH to /cart/items/:id", async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      json: async () => ({ cart: dummyCart, message: "Actualizado" }),
    };
    const spy = vi.spyOn(apiFetchModule, "apiFetch").mockResolvedValue(mockResponse as unknown as Response);

    const result = await updateCartItem(5, { quantity: 3 });
    expect(spy).toHaveBeenCalledWith("/cart/items/5", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity: 3 }),
    });
    expect(result.message).toBe("Actualizado");
  });

  it("removeCartItem sends DELETE to /cart/items/:id", async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      json: async () => ({ cart: dummyCart, message: "Eliminado" }),
    };
    const spy = vi.spyOn(apiFetchModule, "apiFetch").mockResolvedValue(mockResponse as unknown as Response);

    const result = await removeCartItem(5);
    expect(spy).toHaveBeenCalledWith("/cart/items/5", { method: "DELETE" });
    expect(result.message).toBe("Eliminado");
  });

  it("clearMyCart and clearMyRentalItems send DELETE to cart endpoints", async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      json: async () => ({ cart: dummyCart, message: "Vaciado" }),
    };
    const spy = vi.spyOn(apiFetchModule, "apiFetch").mockResolvedValue(mockResponse as unknown as Response);

    await clearMyCart();
    expect(spy).toHaveBeenCalledWith("/cart", { method: "DELETE" });

    await clearMyRentalItems();
    expect(spy).toHaveBeenCalledWith("/cart/rentals", { method: "DELETE" });
  });

  it("applyCartCoupon and removeCartCoupon manage coupons", async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      json: async () => ({ cart: dummyCart, message: "Cupon gestionado" }),
    };
    const spy = vi.spyOn(apiFetchModule, "apiFetch").mockResolvedValue(mockResponse as unknown as Response);

    await applyCartCoupon("PROMO20");
    expect(spy).toHaveBeenCalledWith("/cart/coupon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: "PROMO20" }),
    });

    await removeCartCoupon();
    expect(spy).toHaveBeenCalledWith("/cart/coupon", { method: "DELETE" });
  });
});

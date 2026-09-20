import { renderHook, act, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { CartProvider, useCart } from "../CartContext";
import type { ShoppingCart } from "@/services/cart";

const mockUseAuth = vi.fn();
vi.mock("@/providers/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

const mockGetMyCart = vi.fn();
const mockAddCartItem = vi.fn();
const mockUpdateCartItem = vi.fn();
const mockRemoveCartItem = vi.fn();
const mockClearMyCart = vi.fn();
const mockClearMyRentalItems = vi.fn();
const mockApplyCartCoupon = vi.fn();
const mockRemoveCartCoupon = vi.fn();

vi.mock("@/services/cart", () => ({
  getMyCart: () => mockGetMyCart(),
  addCartItem: (payload: unknown) => mockAddCartItem(payload),
  updateCartItem: (id: number, payload: unknown) => mockUpdateCartItem(id, payload),
  removeCartItem: (id: number) => mockRemoveCartItem(id),
  clearMyCart: () => mockClearMyCart(),
  clearMyRentalItems: () => mockClearMyRentalItems(),
  applyCartCoupon: (code: string) => mockApplyCartCoupon(code),
  removeCartCoupon: () => mockRemoveCartCoupon(),
}));

describe("CartContext", () => {
  const dummyCart: ShoppingCart = {
    id: "cart-1",
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
    items: [
      {
        id: 10,
        mode: "VENTA",
        configurationStatus: "COMPLETE",
        quantity: 2,
        createdAt: "2026-01-01",
        updatedAt: "2026-01-01",
        lineTotal: 1000,
        availability: {
          isAvailable: true,
          maxQuantity: 10,
          reason: null,
        },
        product: {
          id: 100,
          nombre: "Faja lumbar",
          slug: "faja-lumbar",
          marca: "Ortomex",
          modelo: "FL-1",
          descripcion: "Faja lumbar de soporte",
          precio: 500,
          clasificacion: "Ortesis",
          stock: 10,
          proveedor: "Medica",
          tipoAdquisicion: "VENTA",
          requiereReceta: false,
          activo: true,
          imageUrl: null,
        },
      },
    ],
    appliedCoupon: null,
    summary: {
      distinctItems: 1,
      totalQuantity: 2,
      subtotal: 1000,
      saleSubtotal: 1000,
      rentalSubtotal: 0,
      rentalDepositTotal: 0,
      total: 1000,
      saleItems: 1,
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
    mockUseAuth.mockReturnValue({
      user: { id: 1, rol: "CLIENT" },
      loading: false,
    });
    mockGetMyCart.mockResolvedValue({ cart: dummyCart });
  });

  it("throws an error when useCart is used outside of CartProvider", () => {
    expect(() => renderHook(() => useCart())).toThrow(
      "useCart debe usarse dentro de CartProvider",
    );
  });

  it("fetches cart for authenticated client user on mount", async () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <CartProvider>{children}</CartProvider>
    );

    const { result } = renderHook(() => useCart(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.cart.items).toHaveLength(1);
    expect(result.current.cart.items[0].product.nombre).toBe("Faja lumbar");
  });

  it("initializes empty cart if user is not a client", async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
    });

    const wrapper = ({ children }: { children: ReactNode }) => (
      <CartProvider>{children}</CartProvider>
    );

    const { result } = renderHook(() => useCart(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.cart.items).toHaveLength(0);
    expect(mockGetMyCart).not.toHaveBeenCalled();
  });

  it("adds an item to cart", async () => {
    const updatedCart: ShoppingCart = {
      ...dummyCart,
      items: [
        ...dummyCart.items,
        {
          id: 11,
          mode: "VENTA",
          configurationStatus: "COMPLETE",
          quantity: 1,
          createdAt: "2026-01-01",
          updatedAt: "2026-01-01",
          lineTotal: 800,
          availability: {
            isAvailable: true,
            maxQuantity: 5,
            reason: null,
          },
          product: {
            id: 101,
            nombre: "Muletas",
            slug: "muletas",
            marca: "Ortomex",
            modelo: "M-1",
            descripcion: "Muletas de soporte",
            precio: 800,
            clasificacion: "Ortesis",
            stock: 5,
            proveedor: "Medica",
            tipoAdquisicion: "VENTA",
            requiereReceta: false,
            activo: true,
            imageUrl: null,
          },
        },
      ],
    };

    mockAddCartItem.mockResolvedValueOnce({
      cart: updatedCart,
      message: "Producto agregado",
    });

    const wrapper = ({ children }: { children: ReactNode }) => (
      <CartProvider>{children}</CartProvider>
    );

    const { result } = renderHook(() => useCart(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.addItem({ productId: 101, quantity: 1, mode: "VENTA" });
    });

    expect(mockAddCartItem).toHaveBeenCalledWith({
      productId: 101,
      quantity: 1,
      mode: "VENTA",
    });
    expect(result.current.cart.items).toHaveLength(2);
  });

  it("throws error when non-client attempts to add an item", async () => {
    mockUseAuth.mockReturnValue({
      user: { id: 2, rol: "ADMIN" },
      loading: false,
    });

    const wrapper = ({ children }: { children: ReactNode }) => (
      <CartProvider>{children}</CartProvider>
    );

    const { result } = renderHook(() => useCart(), { wrapper });

    await expect(
      result.current.addItem({ productId: 101, quantity: 1 }),
    ).rejects.toThrow("Solo las cuentas de cliente pueden usar el carrito.");
  });

  it("removes an item from cart", async () => {
    const emptyCartResult = {
      ...dummyCart,
      items: [],
      summary: { ...dummyCart.summary, distinctItems: 0, total: 0 },
    };
    mockRemoveCartItem.mockResolvedValueOnce({
      cart: emptyCartResult,
      message: "Item eliminado",
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CartProvider>{children}</CartProvider>
    );

    const { result } = renderHook(() => useCart(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.removeItem(10);
    });

    expect(mockRemoveCartItem).toHaveBeenCalledWith(10);
    expect(result.current.cart.items).toHaveLength(0);
  });
});

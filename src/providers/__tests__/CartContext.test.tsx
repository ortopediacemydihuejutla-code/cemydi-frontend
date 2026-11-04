import { renderHook, act, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
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
  updateCartItem: (id: number, payload: unknown) =>
    mockUpdateCartItem(id, payload),
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
    vi.resetAllMocks();
    mockUseAuth.mockReturnValue({
      user: { id: 1, rol: "CLIENT" },
      loading: false,
    });
    mockGetMyCart.mockResolvedValue({ cart: dummyCart });
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <CartProvider>{children}</CartProvider>
  );
  const changedCart: ShoppingCart = {
    ...dummyCart,
    items: [{ ...dummyCart.items[0], quantity: 4 }],
    summary: { ...dummyCart.summary, totalQuantity: 4, total: 2000 },
  };

  it("loads external changes on focus and after reconnect, preserving data on failure", async () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    mockGetMyCart.mockRejectedValueOnce(new Error("Sin conexión"));
    await act(async () => {
      window.dispatchEvent(new Event("focus"));
    });
    expect(result.current.cart).toEqual(dummyCart);
    expect(result.current.error).toBe("Sin conexión");
    mockGetMyCart.mockResolvedValue({ cart: changedCart });
    await act(async () => {
      window.dispatchEvent(new Event("online"));
    });
    expect(result.current.cart.items[0].quantity).toBe(4);
    expect(result.current.error).toBeNull();
  });

  it("polls while visible, pauses offline/hidden, and cleans up on unmount", async () => {
    vi.useFakeTimers();
    const { result, unmount } = renderHook(() => useCart(), { wrapper });
    await act(async () => {
      await Promise.resolve();
    });
    expect(result.current.loading).toBe(false);
    mockGetMyCart.mockResolvedValue({ cart: changedCart });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10_000);
    });
    expect(result.current.cart.items[0].quantity).toBe(4);
    const calls = mockGetMyCart.mock.calls.length;
    const visibility = vi
      .spyOn(document, "visibilityState", "get")
      .mockReturnValue("hidden");
    await act(async () => {
      await vi.advanceTimersByTimeAsync(20_000);
    });
    expect(mockGetMyCart).toHaveBeenCalledTimes(calls);
    visibility.mockReturnValue("visible");
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(false);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10_000);
    });
    expect(mockGetMyCart).toHaveBeenCalledTimes(calls);
    unmount();
    await vi.advanceTimersByTimeAsync(20_000);
    expect(mockGetMyCart).toHaveBeenCalledTimes(calls);
  });

  it("ignores an older read after a write and skips background sync during the write", async () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    let finishRead!: (value: { cart: ShoppingCart }) => void;
    mockGetMyCart.mockReturnValueOnce(
      new Promise((resolve) => {
        finishRead = resolve;
      }),
    );
    let read!: Promise<ShoppingCart>;
    act(() => {
      read = result.current.refreshCart();
    });
    let finishWrite!: (value: { cart: ShoppingCart; message: string }) => void;
    mockUpdateCartItem.mockReturnValueOnce(
      new Promise((resolve) => {
        finishWrite = resolve;
      }),
    );
    let write!: ReturnType<typeof result.current.updateItemQuantity>;
    act(() => {
      write = result.current.updateItemQuantity({ itemId: 10, quantity: 4 });
    });
    const calls = mockGetMyCart.mock.calls.length;
    await act(async () => {
      window.dispatchEvent(new Event("focus"));
    });
    expect(mockGetMyCart).toHaveBeenCalledTimes(calls);
    await act(async () => {
      finishWrite({ cart: changedCart, message: "Actualizado" });
      await write;
      finishRead({ cart: dummyCart });
      await read;
    });
    expect(result.current.cart.items[0].quantity).toBe(4);
  });

  it("discards a late write when changing accounts", async () => {
    const { result, rerender } = renderHook(() => useCart(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    let finish!: (value: { cart: ShoppingCart; message: string }) => void;
    mockUpdateCartItem.mockReturnValueOnce(
      new Promise((resolve) => {
        finish = resolve;
      }),
    );
    let write!: ReturnType<typeof result.current.updateItemQuantity>;
    act(() => {
      write = result.current.updateItemQuantity({ itemId: 10, quantity: 4 });
    });
    const otherCart = { ...dummyCart, id: "cart-2", items: [] };
    mockUseAuth.mockReturnValue({
      user: { id: 2, rol: "CLIENT" },
      loading: false,
    });
    mockGetMyCart.mockResolvedValue({ cart: otherCart });
    rerender();
    expect(result.current.cart.items).toHaveLength(0);
    await waitFor(() => expect(result.current.cart.id).toBe("cart-2"));
    await act(async () => {
      finish({ cart: changedCart, message: "Actualizado" });
      await expect(write).rejects.toThrow("La sesión cambió");
    });
    expect(result.current.cart.id).toBe("cart-2");
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
      await result.current.addItem({
        productId: 101,
        quantity: 1,
        mode: "VENTA",
      });
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

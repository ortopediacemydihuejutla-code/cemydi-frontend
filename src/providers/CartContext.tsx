"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAuth } from "@/providers/AuthContext";
import {
  addCartItem,
  applyCartCoupon,
  clearMyCart,
  clearMyRentalItems,
  getMyCart,
  removeCartItem,
  removeCartCoupon,
  type ShoppingCart,
  updateCartItem,
} from "@/services/cart";

type CartContextType = {
  cart: ShoppingCart;
  loading: boolean;
  error: string | null;
  refreshCart: () => Promise<ShoppingCart>;
  addItem: (payload: {
    productId: number;
    quantity: number;
    mode?: "VENTA" | "RENTA";
    rentalStartDate?: string;
    rentalEndDate?: string;
    rentalNotes?: string;
  }) => Promise<{
    cart: ShoppingCart;
    message: string;
  }>;
  updateItemQuantity: (payload: {
    itemId: number;
    quantity: number;
    rentalStartDate?: string;
    rentalEndDate?: string;
    rentalNotes?: string;
  }) => Promise<{
    cart: ShoppingCart;
    message: string;
  }>;
  removeItem: (itemId: number) => Promise<{
    cart: ShoppingCart;
    message: string;
  }>;
  clearCart: () => Promise<{
    cart: ShoppingCart;
    message: string;
  }>;
  clearRentals: () => Promise<{
    cart: ShoppingCart;
    message: string;
  }>;
  applyCoupon: (code: string) => Promise<{
    cart: ShoppingCart;
    message: string;
  }>;
  removeCoupon: () => Promise<{
    cart: ShoppingCart;
    message: string;
  }>;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

function createEmptyCart(): ShoppingCart {
  return {
    id: null,
    createdAt: null,
    updatedAt: null,
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
}

function preserveCartItemOrder(
  previousCart: ShoppingCart,
  nextCart: ShoppingCart,
): ShoppingCart {
  if (previousCart.items.length === 0 || nextCart.items.length <= 1) {
    return nextCart;
  }

  const nextItemsById = new Map(nextCart.items.map((item) => [item.id, item]));
  const nextItemsByProductAndMode = new Map(
    nextCart.items.map((item) => [`${item.product.id}:${item.mode}`, item]),
  );
  const orderedItems: ShoppingCart["items"] = [];
  const usedNextItemIds = new Set<number>();

  for (const previousItem of previousCart.items) {
    const nextItem =
      nextItemsById.get(previousItem.id) ??
      nextItemsByProductAndMode.get(
        `${previousItem.product.id}:${previousItem.mode}`,
      );

    if (!nextItem || usedNextItemIds.has(nextItem.id)) {
      continue;
    }

    orderedItems.push(nextItem);
    usedNextItemIds.add(nextItem.id);
  }

  for (const nextItem of nextCart.items) {
    if (!usedNextItemIds.has(nextItem.id)) {
      orderedItems.push(nextItem);
    }
  }

  return {
    ...nextCart,
    items: orderedItems,
  };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [state, setState] = useState<{
    ownerUserId: number | null;
    cart: ShoppingCart;
  }>(() => ({
    ownerUserId: null,
    cart: createEmptyCart(),
  }));
  const [error, setError] = useState<string | null>(null);
  const clientUserId = user?.rol === "CLIENT" ? user.id : null;
  const loading = authLoading || state.ownerUserId !== clientUserId;
  const emptyCart = useMemo(createEmptyCart, []);
  const cart =
    !authLoading && state.ownerUserId === clientUserId ? state.cart : emptyCart;
  const currentUserId = useRef(clientUserId);
  const sessionVersion = useRef(0);
  const requestVersion = useRef(0);
  const pendingWrites = useRef(0);
  useLayoutEffect(() => {
    currentUserId.current = authLoading ? null : clientUserId;
    sessionVersion.current += 1;
    requestVersion.current += 1;
    pendingWrites.current = 0;
  }, [authLoading, clientUserId]);
  const performMutation = useCallback(
    async <T,>(operation: () => Promise<T>): Promise<T> => {
      const expected = clientUserId;
      const session = sessionVersion.current;
      if (expected === null || currentUserId.current !== expected)
        throw new Error("La sesión cambió. Vuelve a iniciar sesión.");
      requestVersion.current += 1;
      pendingWrites.current += 1;
      try {
        const result = await operation();
        if (
          currentUserId.current !== expected ||
          sessionVersion.current !== session
        )
          throw new Error("La sesión cambió. Revisa el carrito de tu cuenta.");
        return result;
      } finally {
        if (sessionVersion.current === session) {
          pendingWrites.current -= 1;
          requestVersion.current += 1;
        }
      }
    },
    [clientUserId],
  );

  const refreshCart = useCallback(async () => {
    if (clientUserId === null) {
      const emptyCart = createEmptyCart();
      setState({
        ownerUserId: null,
        cart: emptyCart,
      });
      return emptyCart;
    }

    setError(null);
    const version = ++requestVersion.current;
    try {
      const result = await getMyCart();
      if (
        currentUserId.current === clientUserId &&
        version === requestVersion.current
      )
        setState((previous) => ({
          ownerUserId: clientUserId,
          cart: preserveCartItemOrder(previous.cart, result.cart),
        }));
      return result.cart;
    } catch (loadError) {
      if (
        currentUserId.current === clientUserId &&
        version === requestVersion.current
      )
        setError(
          loadError instanceof Error
            ? loadError.message
            : "No se pudo cargar el carrito.",
        );
      throw loadError;
    }
  }, [clientUserId]);

  useEffect(() => {
    if (loading || clientUserId === null) return;
    let active = true;
    let refreshing = false;
    const sync = () => {
      if (
        !active ||
        refreshing ||
        document.visibilityState !== "visible" ||
        !navigator.onLine ||
        pendingWrites.current > 0
      )
        return;
      refreshing = true;
      void refreshCart()
        .catch(() => undefined)
        .finally(() => {
          refreshing = false;
        });
    };
    const timer = window.setInterval(sync, 10_000);
    window.addEventListener("focus", sync);
    window.addEventListener("online", sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      active = false;
      window.clearInterval(timer);
      window.removeEventListener("focus", sync);
      window.removeEventListener("online", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [loading, clientUserId, refreshCart]);

  useEffect(() => {
    let cancelled = false;

    if (authLoading) {
      return () => {
        cancelled = true;
      };
    }

    if (clientUserId === null) {
      queueMicrotask(() => {
        if (cancelled) {
          return;
        }

        setState({
          ownerUserId: null,
          cart: createEmptyCart(),
        });
      });

      return () => {
        cancelled = true;
      };
    }

    const version = ++requestVersion.current;
    void getMyCart()
      .then((result) => {
        if (cancelled || version !== requestVersion.current) {
          return;
        }

        setError(null);
        setState((previous) => ({
          ownerUserId: clientUserId,
          cart: preserveCartItemOrder(previous.cart, result.cart),
        }));
      })
      .catch((loadError: unknown) => {
        if (cancelled || version !== requestVersion.current) {
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "No se pudo cargar el carrito.",
        );
        setState({
          ownerUserId: clientUserId,
          cart: createEmptyCart(),
        });
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, clientUserId]);

  const assertClientSession = useCallback(() => {
    if (!user) {
      throw new Error("Debes iniciar sesión para usar el carrito.");
    }

    if (user.rol !== "CLIENT") {
      throw new Error("Solo las cuentas de cliente pueden usar el carrito.");
    }
  }, [user]);

  const addItem = useCallback(
    async (payload: {
      productId: number;
      quantity: number;
      mode?: "VENTA" | "RENTA";
      rentalStartDate?: string;
      rentalEndDate?: string;
      rentalNotes?: string;
    }) => {
      assertClientSession();
      const result = await performMutation(() => addCartItem(payload));
      setState((previous) => ({
        ownerUserId: clientUserId,
        cart: preserveCartItemOrder(previous.cart, result.cart),
      }));
      return result;
    },
    [assertClientSession, clientUserId, performMutation],
  );

  const updateItemQuantity = useCallback(
    async (payload: {
      itemId: number;
      quantity: number;
      rentalStartDate?: string;
      rentalEndDate?: string;
      rentalNotes?: string;
    }) => {
      assertClientSession();
      const result = await performMutation(() =>
        updateCartItem(payload.itemId, {
          quantity: payload.quantity,
          rentalStartDate: payload.rentalStartDate,
          rentalEndDate: payload.rentalEndDate,
          rentalNotes: payload.rentalNotes,
        }),
      );
      setState((previous) => ({
        ownerUserId: clientUserId,
        cart: preserveCartItemOrder(previous.cart, result.cart),
      }));
      return result;
    },
    [assertClientSession, clientUserId, performMutation],
  );

  const removeItem = useCallback(
    async (itemId: number) => {
      assertClientSession();
      const result = await performMutation(() => removeCartItem(itemId));
      setState((previous) => ({
        ownerUserId: clientUserId,
        cart: preserveCartItemOrder(previous.cart, result.cart),
      }));
      return result;
    },
    [assertClientSession, clientUserId, performMutation],
  );

  const clearCart = useCallback(async () => {
    assertClientSession();
    const result = await performMutation(clearMyCart);
    setState({
      ownerUserId: clientUserId,
      cart: result.cart,
    });
    return result;
  }, [assertClientSession, clientUserId, performMutation]);

  const clearRentals = useCallback(async () => {
    assertClientSession();
    const result = await performMutation(clearMyRentalItems);
    setState((previous) => ({
      ownerUserId: clientUserId,
      cart: preserveCartItemOrder(previous.cart, result.cart),
    }));
    return result;
  }, [assertClientSession, clientUserId, performMutation]);

  const applyCoupon = useCallback(
    async (code: string) => {
      assertClientSession();
      const result = await performMutation(() => applyCartCoupon(code));
      setState((previous) => ({
        ownerUserId: clientUserId,
        cart: preserveCartItemOrder(previous.cart, result.cart),
      }));
      return result;
    },
    [assertClientSession, clientUserId, performMutation],
  );

  const removeCoupon = useCallback(async () => {
    assertClientSession();
    const result = await performMutation(removeCartCoupon);
    setState((previous) => ({
      ownerUserId: clientUserId,
      cart: preserveCartItemOrder(previous.cart, result.cart),
    }));
    return result;
  }, [assertClientSession, clientUserId, performMutation]);

  const value = useMemo(
    () => ({
      cart,
      loading,
      error,
      refreshCart,
      addItem,
      updateItemQuantity,
      removeItem,
      clearCart,
      clearRentals,
      applyCoupon,
      removeCoupon,
    }),
    [
      addItem,
      applyCoupon,
      cart,
      clearCart,
      clearRentals,
      error,
      loading,
      refreshCart,
      removeItem,
      removeCoupon,
      updateItemQuantity,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de CartProvider");
  return ctx;
}

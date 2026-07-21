"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "@/providers/AuthContext";
import {
  addCartItem,
  clearMyCart,
  clearMyRentalItems,
  getMyCart,
  removeCartItem,
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
};

const CartContext = createContext<CartContextType | undefined>(undefined);

function createEmptyCart(): ShoppingCart {
  return {
    id: null,
    createdAt: null,
    updatedAt: null,
    items: [],
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
  const cart = state.cart;

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
    try {
      const result = await getMyCart();
      setState((previous) => ({
        ownerUserId: clientUserId,
        cart: preserveCartItemOrder(previous.cart, result.cart),
      }));
      return result.cart;
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "No se pudo cargar el carrito.",
      );
      throw loadError;
    }
  }, [clientUserId]);

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

    void getMyCart()
      .then((result) => {
        if (cancelled) {
          return;
        }

        setError(null);
        setState((previous) => ({
          ownerUserId: clientUserId,
          cart: preserveCartItemOrder(previous.cart, result.cart),
        }));
      })
      .catch((loadError: unknown) => {
        if (cancelled) {
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
      const result = await addCartItem(payload);
      setState((previous) => ({
        ownerUserId: clientUserId,
        cart: preserveCartItemOrder(previous.cart, result.cart),
      }));
      return result;
    },
    [assertClientSession, clientUserId],
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
      const result = await updateCartItem(payload.itemId, {
        quantity: payload.quantity,
        rentalStartDate: payload.rentalStartDate,
        rentalEndDate: payload.rentalEndDate,
        rentalNotes: payload.rentalNotes,
      });
      setState((previous) => ({
        ownerUserId: clientUserId,
        cart: preserveCartItemOrder(previous.cart, result.cart),
      }));
      return result;
    },
    [assertClientSession, clientUserId],
  );

  const removeItem = useCallback(
    async (itemId: number) => {
      assertClientSession();
      const result = await removeCartItem(itemId);
      setState((previous) => ({
        ownerUserId: clientUserId,
        cart: preserveCartItemOrder(previous.cart, result.cart),
      }));
      return result;
    },
    [assertClientSession, clientUserId],
  );

  const clearCart = useCallback(async () => {
    assertClientSession();
    const result = await clearMyCart();
    setState({
      ownerUserId: clientUserId,
      cart: result.cart,
    });
    return result;
  }, [assertClientSession, clientUserId]);

  const clearRentals = useCallback(async () => {
    assertClientSession();
    const result = await clearMyRentalItems();
    setState((previous) => ({
      ownerUserId: clientUserId,
      cart: preserveCartItemOrder(previous.cart, result.cart),
    }));
    return result;
  }, [assertClientSession, clientUserId]);

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
    }),
    [
      addItem,
      cart,
      clearCart,
      clearRentals,
      error,
      loading,
      refreshCart,
      removeItem,
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

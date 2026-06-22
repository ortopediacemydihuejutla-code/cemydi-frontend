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
  getMyCart,
  removeCartItem,
  type ShoppingCart,
  updateCartItem,
} from "@/services/cart";

type CartContextType = {
  cart: ShoppingCart;
  loading: boolean;
  refreshCart: () => Promise<ShoppingCart>;
  addItem: (payload: { productId: number; quantity: number }) => Promise<{
    cart: ShoppingCart;
    message: string;
  }>;
  updateItemQuantity: (payload: { itemId: number; quantity: number }) => Promise<{
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
      hasUnavailableItems: false,
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
  const nextItemsByProductId = new Map(
    nextCart.items.map((item) => [item.product.id, item]),
  );
  const orderedItems: ShoppingCart["items"] = [];
  const usedNextItemIds = new Set<number>();

  for (const previousItem of previousCart.items) {
    const nextItem =
      nextItemsById.get(previousItem.id) ??
      nextItemsByProductId.get(previousItem.product.id);

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

    const result = await getMyCart();
    setState((previous) => ({
      ownerUserId: clientUserId,
      cart: preserveCartItemOrder(previous.cart, result.cart),
    }));
    return result.cart;
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

        setState((previous) => ({
          ownerUserId: clientUserId,
          cart: preserveCartItemOrder(previous.cart, result.cart),
        }));
      })
      .catch(() => {
        if (cancelled) {
          return;
        }

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
    async (payload: { productId: number; quantity: number }) => {
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
    async (payload: { itemId: number; quantity: number }) => {
      assertClientSession();
      const result = await updateCartItem(payload.itemId, {
        quantity: payload.quantity,
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

  const value = useMemo(
    () => ({
      cart,
      loading,
      refreshCart,
      addItem,
      updateItemQuantity,
      removeItem,
      clearCart,
    }),
    [addItem, cart, clearCart, loading, refreshCart, removeItem, updateItemQuantity],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de CartProvider");
  return ctx;
}

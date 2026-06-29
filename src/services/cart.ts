import { apiFetch } from "@/lib/api-fetch";
import { parseApiResponse } from "@/lib/api-error";
import {
  cartMutationResponseSchema,
  cartResponseSchema,
  type ShoppingCart,
  type ShoppingCartItem,
} from "@/lib/schemas/cart";

export type { ShoppingCart, ShoppingCartItem };

export async function getMyCart() {
  const res = await apiFetch("/cart", {
    method: "GET",
  });

  return parseApiResponse(res, "No se pudo cargar el carrito", cartResponseSchema);
}

export async function addCartItem(data: {
  productId: number;
  quantity: number;
  mode?: "VENTA" | "RENTA";
  rentalStartDate?: string;
  rentalEndDate?: string;
  rentalNotes?: string;
}) {
  const res = await apiFetch("/cart/items", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return parseApiResponse(
    res,
    "No se pudo agregar el producto al carrito",
    cartMutationResponseSchema,
  );
}

export async function updateCartItem(
  itemId: number,
  data: {
    quantity: number;
    rentalStartDate?: string;
    rentalEndDate?: string;
    rentalNotes?: string;
  },
) {
  const res = await apiFetch(`/cart/items/${itemId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return parseApiResponse(
    res,
    "No se pudo actualizar el carrito",
    cartMutationResponseSchema,
  );
}

export async function removeCartItem(itemId: number) {
  const res = await apiFetch(`/cart/items/${itemId}`, {
    method: "DELETE",
  });

  return parseApiResponse(
    res,
    "No se pudo eliminar el producto del carrito",
    cartMutationResponseSchema,
  );
}

export async function clearMyCart() {
  const res = await apiFetch("/cart", {
    method: "DELETE",
  });

  return parseApiResponse(
    res,
    "No se pudo vaciar el carrito",
    cartMutationResponseSchema,
  );
}

"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useAuth } from "@/providers/AuthContext";
import { useCart } from "@/providers/CartContext";

export function HeaderCartSkeleton() {
  return (
    <div
      className="inline-flex size-11 shrink-0 animate-pulse rounded-full bg-white/15"
      aria-hidden="true"
    />
  );
}

export default function HeaderCart() {
  const { user, loading: authLoading } = useAuth();
  const { cart, loading: cartLoading } = useCart();

  if (authLoading) {
    return <HeaderCartSkeleton />;
  }

  if (user?.rol === "ADMIN") {
    return null;
  }

  const itemCount = cartLoading ? 0 : cart.summary.totalQuantity;
  const href = user ? "/carrito" : "/login";

  return (
    <Link
      href={href}
      className="relative inline-flex size-11 shrink-0 items-center justify-center rounded-full text-white no-underline transition hover:bg-white/12 hover:text-white"
      aria-label={
        user && !cartLoading
          ? `Abrir carrito con ${itemCount} producto${itemCount === 1 ? "" : "s"}`
          : user
            ? "Abrir carrito"
          : "Inicia sesión para usar el carrito"
      }
    >
      <ShoppingCart className="size-6" aria-hidden="true" />
      {user && itemCount > 0 ? (
        <span className="absolute -top-1.5 -right-1.5 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[0.68rem] font-extrabold leading-none text-[#1e6260] shadow-[0_4px_10px_rgba(0,0,0,0.18)] ring-2 ring-[#2aa09d]">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      ) : null}
    </Link>
  );
}

"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useAuth } from "@/providers/AuthContext";
import { useCart } from "@/providers/CartContext";

export function HeaderCartSkeleton() {
  return (
    <div
      className="inline-flex size-10 shrink-0 animate-pulse rounded-full bg-white/15"
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
      className="relative inline-flex size-10 shrink-0 items-center justify-center rounded-full text-white no-underline transition hover:bg-white/12 hover:text-white"
      aria-label={
        user && !cartLoading
          ? `Abrir carrito con ${itemCount} producto${itemCount === 1 ? "" : "s"}`
          : user
            ? "Abrir carrito"
          : "Inicia sesión para usar el carrito"
      }
    >
      <ShoppingCart className="size-5" aria-hidden="true" />
      {user && itemCount > 0 ? (
        <span className="absolute -top-1 -right-1 inline-flex min-h-4.5 min-w-4.5 items-center justify-center rounded-full bg-white px-1 text-[0.65rem] font-extrabold leading-none text-[#258e8b] shadow-[0_2px_8px_rgba(0,0,0,0.2)] ring-1.5 ring-[#258e8b]">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      ) : null}
    </Link>
  );
}

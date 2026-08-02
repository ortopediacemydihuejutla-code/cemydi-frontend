"use client";

import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { useAuth } from "@/providers/AuthContext";
import type { CatalogProduct } from "@/services/catalog";
import { useFavorites } from "./use-favorites";

function useSafeRouter() {
  try {
    return useRouter();
  } catch {
    return null;
  }
}

function useSafeAuth() {
  try {
    return useAuth();
  } catch {
    return { user: null };
  }
}

type FavoriteProductInput = Pick<CatalogProduct, "id" | "nombre"> & Partial<CatalogProduct>;

export function FavoriteButton({
  product,
  className = "",
  showLabel = false,
  compact = false,
}: {
  product: FavoriteProductInput;
  className?: string;
  showLabel?: boolean;
  compact?: boolean;
}) {
  const router = useSafeRouter();
  const { user } = useSafeAuth();
  const { favoriteIds, toggleFavorite } = useFavorites();
  const isFavorite = favoriteIds.has(product.id);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (!user) {
      toast("Inicia sesión para guardar tus productos favoritos.");
      if (router) {
        router.push("/login");
      } else if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      return;
    }

    const added = toggleFavorite(product as CatalogProduct);
    toast.success(
      added
        ? "Producto guardado en favoritos."
        : "Producto eliminado de favoritos.",
    );
  };

  const baseClasses = compact
    ? `grid size-8 place-items-center rounded-full transition ${
        isFavorite
          ? "bg-[#fef2f2] text-[#dc2626]"
          : "text-[#dc2626] hover:bg-[#fef2f2] hover:text-[#b91c1c]"
      }`
    : `inline-flex min-h-11 items-center justify-center gap-2 rounded-full border bg-white text-sm font-bold shadow-[0_8px_22px_rgba(16,50,49,0.12)] transition hover:-translate-y-0.5 ${
        isFavorite
          ? "border-[#fecaca] text-[#dc2626] bg-[#fef2f2]"
          : "border-[#dbe6e8] text-[#385761] hover:text-[#dc2626] hover:bg-[#fef2f2]"
      } ${showLabel ? "px-4" : "size-11 p-0"}`;

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={
        isFavorite
          ? `Quitar ${product.nombre} de favoritos`
          : `Guardar ${product.nombre} en favoritos`
      }
      aria-pressed={isFavorite}
      data-favorite={isFavorite}
      className={`${baseClasses} ${className}`}
    >
      <Heart
        className={`${compact ? "size-[17px]" : "size-[19px]"} ${
          isFavorite ? "fill-current" : ""
        }`}
        aria-hidden="true"
      />
      {showLabel && !compact ? (isFavorite ? "Guardado" : "Guardar") : null}
    </button>
  );
}

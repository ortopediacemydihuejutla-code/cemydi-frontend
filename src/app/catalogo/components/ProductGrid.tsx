"use client";

import Image from "next/image";
import Link from "next/link";

import type { CatalogProduct } from "@/services/catalog";
import { isOptimizableImageUrl } from "@/lib/cloudinary-image";
import {
  formatMoney,
  formatTipo,
  getProductMonogram,
} from "../utils/catalog-formatters";
import type { CatalogView } from "../utils/catalog-params";

type ProductGridProps = {
  products: CatalogProduct[];
  view: CatalogView;
  searchQuery?: string;
  promotedProductIds?: Set<number>;
  isPending?: boolean;
};

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getSearchTokens(query: string) {
  return query
    .trim()
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean);
}

function highlightMatch(text: string, query: string) {
  const tokens = getSearchTokens(query);
  if (tokens.length === 0) return text;

  const pattern = new RegExp(`(${tokens.map(escapeRegExp).join("|")})`, "gi");
  const parts = text.split(pattern);

  return parts.map((part, index) =>
    tokens.some((token) => part.toLowerCase() === token.toLowerCase()) ? (
      <mark
        key={`${part}-${index}`}
        className="rounded-[4px] bg-[rgba(15,106,103,0.12)] px-1 text-inherit"
      >
        {part}
      </mark>
    ) : (
      part
    ),
  );
}

export function ProductCard({
  product,
  searchQuery,
  isPromoted,
  view,
}: {
  product: CatalogProduct;
  searchQuery: string;
  isPromoted: boolean;
  view: CatalogView;
}) {
  const hasImage = isOptimizableImageUrl(product.imageUrl);
  const isOutOfStock = product.stock <= 0;
  const acquisitionBadges =
    product.tipoAdquisicion === "MIXTO"
      ? [
          { label: "Venta", className: "bg-[#0f6a67] text-white" },
          { label: "Renta", className: "bg-[#2f6fa3] text-white" },
        ]
      : [
          product.tipoAdquisicion === "RENTA"
            ? { label: "Renta", className: "bg-[#2f6fa3] text-white" }
            : { label: "Venta", className: "bg-[#0f6a67] text-white" },
        ];

  return (
    <Link
      href={`/producto/${product.id}`}
      className={`group flex h-full overflow-hidden rounded-lg border border-[#e7edef] bg-white text-inherit no-underline shadow-[0_12px_30px_rgba(18,39,49,0.055)] outline-none transition hover:border-[#d0dde0] hover:shadow-[0_16px_34px_rgba(18,39,49,0.08)] focus-visible:ring-2 focus-visible:ring-[#0f6a67] focus-visible:ring-offset-2 ${
        view === "list"
          ? "flex-col sm:grid sm:grid-cols-[220px_minmax(0,1fr)]"
          : "flex-col"
      }`}
    >
      <div
        className={`relative overflow-hidden border-b border-[#edf2f3] bg-[#fbfcfc] ${
          view === "list"
            ? "aspect-[4/3] sm:h-full sm:min-h-[240px] sm:aspect-auto sm:border-b-0 sm:border-r"
            : "aspect-[1/1] sm:aspect-[4/3]"
        }`}
      >
        <div className="pointer-events-none absolute inset-x-3 top-3 z-10 flex flex-wrap items-start gap-2">
          {acquisitionBadges.map((badge) => (
            <span
              key={badge.label}
              className={`rounded px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.08em] ${badge.className}`}
            >
              {badge.label}
            </span>
          ))}
          {isPromoted ? (
            <span className="rounded bg-[#172932] px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-white">
              Oferta
            </span>
          ) : null}
          {product.requiereReceta ? (
            <span className="rounded bg-[#f2f6f7] px-2.5 py-1 text-[0.68rem] font-semibold text-[#304853] ring-1 ring-inset ring-[#dce6e9]">
              Receta requerida
            </span>
          ) : null}
        </div>

        <div className="absolute inset-0 flex items-center justify-center p-5 sm:p-6">
          {hasImage ? (
            <div className="relative h-full w-full">
              <Image
                src={product.imageUrl!}
                alt={product.nombre}
                fill
                sizes={
                  view === "list"
                    ? "(max-width: 640px) 100vw, 220px"
                    : "(max-width: 640px) 100vw, (max-width: 1200px) 33vw, 25vw"
                }
                className="object-contain object-center transition duration-300 group-hover:scale-[1.02]"
              />
            </div>
          ) : (
            <div className="grid size-20 place-items-center rounded-lg border border-[#d6e2e4] bg-white text-xl font-bold text-[#1e6260]">
              {getProductMonogram(product.nombre)}
            </div>
          )}
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-4">
        <div className="grid gap-1">
          <span className="text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-[#667b84]">
            {highlightMatch(product.marca, searchQuery)}
          </span>

          <h3 className="line-clamp-2 text-[1rem] font-semibold leading-6 text-[#142734] sm:text-[1.03rem]">
            {highlightMatch(product.nombre, searchQuery)}
          </h3>
        </div>

        <p className="mt-2 text-sm text-[#5f7780]">
          {product.modelo} · {formatTipo(product.tipoAdquisicion)}
        </p>

        <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-5">
          <div className="grid gap-1">
            <strong className="text-[1.24rem] font-bold leading-none text-[#122731]">
              {formatMoney(product.precio)}
            </strong>
            <span
              className={`text-xs font-semibold ${
                isOutOfStock ? "text-[#b42318]" : "text-[#15803d]"
              }`}
            >
              {isOutOfStock ? "Sin stock" : "Disponible"}
            </span>
          </div>

          <span className="mb-0.5 border-b border-[#c6d0d3] text-sm font-semibold text-[#344850] transition group-hover:border-[#0f6a67] group-hover:text-[#0f6a67]">
            Ver detalles
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function ProductGrid({
  products,
  view,
  searchQuery = "",
  promotedProductIds = new Set<number>(),
  isPending = false,
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="col-span-full rounded-lg border border-dashed border-[#cfe0e5] bg-white px-6 py-14 text-center shadow-[0_16px_34px_rgba(15,42,50,0.05)]">
        <div className="mb-4 flex justify-center text-[#7a8e97]" aria-hidden="true">
          <SearchEmptyIcon />
        </div>
        <h2 className="mb-2 text-[1.25rem] font-semibold text-[#142734]">
          No encontramos productos
        </h2>
        <p className="mx-auto max-w-[520px] text-[0.95rem] leading-7 text-[#5f7780]">
          {searchQuery.trim()
            ? `No hay resultados para "${searchQuery.trim()}". Prueba con otro término o limpia algunos filtros.`
            : "Ajusta filtros, cambia el ordenamiento o prueba otra búsqueda para ampliar los resultados."}
        </p>
      </div>
    );
  }

  const gridClass =
    view === "list"
      ? "grid min-w-0 grid-cols-1 gap-4"
      : "grid min-w-0 grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4";

  return (
    <div
      className={`${gridClass} transition duration-200 ${
        isPending ? "opacity-55 blur-[1px]" : "opacity-100 blur-0"
      }`}
    >
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          searchQuery={searchQuery}
          isPromoted={promotedProductIds.has(product.id)}
          view={view}
        />
      ))}
    </div>
  );
}

function SearchEmptyIcon() {
  return (
    <svg viewBox="0 0 48 48" width="48" height="48" fill="none">
      <circle cx="20" cy="20" r="12" stroke="currentColor" strokeWidth="2.5" />
      <path
        d="M30 30l12 12"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

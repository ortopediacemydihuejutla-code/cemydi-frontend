"use client";

import Image from "next/image";
import Link from "next/link";

import ProductShareMenu from "@/components/product/ProductShareMenu";
import { PromotionBadge } from "@/components/product/PromotionBadge";
import type { ActivePromotion, CatalogProduct } from "@/services/catalog";
import { isOptimizableImageUrl } from "@/lib/cloudinary-image";
import { getClientSiteUrl } from "@/lib/site-config";
import { buildProductShareData, getProductSlug } from "@/lib/product-share";
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
  promotionsByProduct?: Map<number, ActivePromotion>;
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
  isPromoted = false,
  promotion = null,
  view,
}: {
  product: CatalogProduct;
  searchQuery: string;
  isPromoted?: boolean;
  promotion?: ActivePromotion | null;
  view: CatalogView;
}) {
  const hasImage = isOptimizableImageUrl(product.imageUrl);
  const detailHref = `/producto/${encodeURIComponent(getProductSlug(product))}`;
  const shareData = buildProductShareData(product, getClientSiteUrl());
  const hasPromotion = Boolean(promotion) || isPromoted;
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
    <article
      className={`group flex self-start overflow-visible rounded-lg border border-[#e7edef] bg-white text-inherit no-underline shadow-[0_12px_30px_rgba(18,39,49,0.055)] outline-none transition hover:border-[#d0dde0] hover:shadow-[0_16px_34px_rgba(18,39,49,0.08)] focus-visible:ring-2 focus-visible:ring-[#0f6a67] focus-visible:ring-offset-2 ${
        view === "list"
          ? "flex-col sm:grid sm:grid-cols-[220px_minmax(0,1fr)]"
          : "flex-col"
      }`}
    >
      <div
        className={`relative overflow-visible border-b border-[#edf2f3] bg-[#fbfcfc] outline-none focus-visible:ring-2 focus-visible:ring-[#0f6a67] focus-visible:ring-inset ${
          view === "list"
            ? "aspect-[4/3] sm:h-full sm:min-h-[240px] sm:aspect-auto sm:border-b-0 sm:border-r"
            : "aspect-[4/3]"
        }`}
      >
        <Link
          href={detailHref}
          className="absolute inset-0 z-[1] outline-none"
          aria-label={`Ver detalles de ${product.nombre}`}
        />
        <div className="pointer-events-none absolute left-3 right-14 top-3 z-10 flex flex-wrap items-start gap-2">
          {acquisitionBadges.map((badge) => (
            <span
              key={badge.label}
              className={`rounded px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.08em] ${badge.className}`}
            >
              {badge.label}
            </span>
          ))}
          {product.requiereReceta ? (
            <span className="rounded bg-[#f2f6f7] px-2.5 py-1 text-[0.68rem] font-semibold text-[#304853] ring-1 ring-inset ring-[#dce6e9]">
              Receta requerida
            </span>
          ) : null}
        </div>

        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-t-lg px-2 pb-1 pt-9 sm:px-3 sm:pt-10">
          <div className="relative flex h-full w-full items-center justify-center">
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
                className="scale-[1.08] object-contain object-center transition duration-300 group-hover:scale-[1.12]"
              />
            </div>
          ) : (
            <div className="grid size-20 place-items-center rounded-lg border border-[#d6e2e4] bg-white text-xl font-bold text-[#1e6260]">
              {getProductMonogram(product.nombre)}
            </div>
          )}
          </div>
        </div>

        <ProductShareMenu
          shareData={shareData}
          productName={product.nombre}
          compact
          className="absolute right-3 top-3 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100 sm:data-[open=true]:opacity-100"
          menuClassName="bottom-auto right-0 top-[calc(100%+8px)]"
          triggerClassName="!bg-transparent !text-[#176b67] shadow-none ring-0 hover:!bg-transparent hover:!text-[#0f4f4d]"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-4">
        <div className="grid gap-1">
          <span className="text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-[#667b84]">
            {highlightMatch(product.marca, searchQuery)}
          </span>

          <h3 className="line-clamp-2 text-[1rem] font-semibold leading-6 text-[#142734] sm:text-[1.03rem]">
            <Link
              href={detailHref}
              className="outline-none transition hover:text-[#0f6a67] focus-visible:rounded focus-visible:ring-2 focus-visible:ring-[#0f6a67] focus-visible:ring-offset-2"
            >
              {highlightMatch(product.nombre, searchQuery)}
            </Link>
          </h3>
        </div>

        <p className="mt-1.5 text-sm text-[#5f7780]">
          {product.modelo} · {formatTipo(product.tipoAdquisicion)}
        </p>

        <div className="mt-3 grid gap-1.5">
          <div className="flex min-h-4 flex-wrap items-center gap-x-2 gap-y-1 text-xs">
            {promotion ? (
              <>
                <span className="tabular-nums text-[#84959b] line-through">
                  {formatMoney(product.precio)}
                </span>
                <span className="font-semibold text-[#9f3029]">
                  Ahorras{" "}
                  {formatMoney(product.precio - promotion.discountedPrice)}
                </span>
              </>
            ) : (
              <span className="text-[#71858d]">
                Precio de {formatTipo(product.tipoAdquisicion).toLowerCase()}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <strong
              className="text-[1.5rem] font-semibold leading-none tracking-[-0.02em] text-[#172f38]"
            >
              {formatMoney(promotion?.discountedPrice ?? product.precio)}
            </strong>
            {hasPromotion ? (
              <PromotionBadge
                percent={promotion?.discountPercent}
                compact
                shortLabel
                className="rounded-full px-2.5 py-1 shadow-none"
              />
            ) : null}
          </div>
        </div>

      </div>
    </article>
  );
}

export default function ProductGrid({
  products,
  view,
  searchQuery = "",
  promotionsByProduct = new Map<number, ActivePromotion>(),
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
          promotion={promotionsByProduct.get(product.id) ?? null}
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

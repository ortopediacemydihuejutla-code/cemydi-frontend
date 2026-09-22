"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { FavoriteButton } from "@/components/account/FavoriteButton";
import ProductShareMenu from "@/components/product/ProductShareMenu";
import { PromotionBadge } from "@/components/product/PromotionBadge";
import { isOptimizableImageUrl } from "@/lib/cloudinary-image";
import { getProductSlug } from "@/lib/product-share";
import { getSavingsAmount } from "@/lib/promotion-pricing";
import { getClientSiteUrl } from "@/lib/site-config";
import type { ActivePromotion } from "@/services/catalog";

function getProductMonogram(nombre: string) {
  const clean = nombre.trim().toUpperCase();
  if (!clean) return "PR";
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2);
  return `${parts[0][0]}${parts[1][0]}`;
}

function formatPriceMXN(value: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatOfferEnd(iso: string) {
  try {
    return new Intl.DateTimeFormat("es-MX", {
      day: "numeric",
      month: "short",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

function formatAcquisitionType(type: ActivePromotion["product"]["tipoAdquisicion"]) {
  if (type === "RENTA") return "Renta";
  if (type === "MIXTO") return "Venta y renta";
  return "Venta";
}

type Props = {
  promotions: ActivePromotion[];
};

export function PromotionsShowcase({ promotions }: Props) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [canScrollPrevious, setCanScrollPrevious] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const list = useMemo(() => {
    const bestPromotionByProduct = new Map<number, ActivePromotion>();
    for (const promotion of promotions) {
      const current = bestPromotionByProduct.get(promotion.productId);
      if (!current || promotion.discountPercent > current.discountPercent) {
        bestPromotionByProduct.set(promotion.productId, promotion);
      }
    }

    return Array.from(bestPromotionByProduct.values()).sort(
      (a, b) => b.discountPercent - a.discountPercent,
    );
  }, [promotions]);

  const updateCarouselState = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    const remaining = track.scrollWidth - track.clientWidth - track.scrollLeft;
    setCanScrollPrevious(track.scrollLeft > 4);
    setCanScrollNext(remaining > 4);
  }, []);

  useEffect(() => {
    updateCarouselState();
    window.addEventListener("resize", updateCarouselState);
    return () => window.removeEventListener("resize", updateCarouselState);
  }, [list.length, updateCarouselState]);

  const scrollCarousel = (direction: -1 | 1) => {
    const track = trackRef.current;
    if (!track) return;

    const firstCard = track.querySelector<HTMLElement>(
      "[data-promotion-card]",
    );
    const distance = firstCard
      ? firstCard.offsetWidth + 20
      : track.clientWidth * 0.85;

    track.scrollBy({
      left: direction * distance,
      behavior: "smooth",
    });
  };

  return (
    <section
      className="border-y border-[#edf2f3] bg-[#f8faf9] py-14 sm:py-18"
      aria-labelledby="promociones-titulo"
    >
      <div className="mx-auto w-full max-w-[80rem] px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-5 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#557079]">
              Ofertas seleccionadas
            </p>
            <h2
              id="promociones-titulo"
              className="m-0 text-[clamp(1.65rem,4vw,2.25rem)] font-bold tracking-tight text-[#122731]"
            >
              Productos con precio especial
            </h2>
            <p className="mt-3 text-base leading-relaxed text-[#5f7780]">
              Aprovecha descuentos por tiempo limitado con el precio y el
              ahorro claramente identificados.
            </p>
          </div>

          {list.length > 0 ? (
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => scrollCarousel(-1)}
                disabled={!canScrollPrevious}
                aria-label="Ver ofertas anteriores"
                className="grid size-10 place-items-center rounded-full border border-[#d3dfe2] bg-white text-[#294650] transition hover:border-[#9fb5bb] hover:text-[#0f6a67] disabled:cursor-not-allowed disabled:opacity-35"
              >
                <ChevronLeft className="size-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => scrollCarousel(1)}
                disabled={!canScrollNext}
                aria-label="Ver más ofertas"
                className="grid size-10 place-items-center rounded-full border border-[#d3dfe2] bg-white text-[#294650] transition hover:border-[#9fb5bb] hover:text-[#0f6a67] disabled:cursor-not-allowed disabled:opacity-35"
              >
                <ChevronRight className="size-5" aria-hidden="true" />
              </button>
              <Link
                href="/catalogo"
                className="ml-1 hidden shrink-0 border-b border-[#9fabad] pb-0.5 text-sm font-semibold text-[#344850] no-underline transition hover:border-[#0f6a67] hover:text-[#0f6a67] sm:inline-flex"
              >
                Ver catálogo
              </Link>
            </div>
          ) : null}
        </div>

        {list.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[#cfe0e5] bg-white px-6 py-14 text-center shadow-[0_16px_34px_rgba(15,42,50,0.05)]">
            <p className="m-0 text-lg font-semibold text-[#142734]">
              Pronto tendremos nuevas ofertas
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[#5f7780]">
              Mientras tanto, explora nuestro catálogo de ortopedia y equipo
              médico.
            </p>
            <Link
              href="/catalogo"
              className="mt-6 inline-flex items-center justify-center rounded-full bg-[#0f6a67] px-7 py-3 text-sm font-bold text-white no-underline transition hover:bg-[#0b5552]"
            >
              Ir al catálogo
            </Link>
          </div>
        ) : (
          <div
            ref={trackRef}
            onScroll={updateCarouselState}
            className="-mx-4 grid snap-x snap-mandatory grid-flow-col auto-cols-[84%] gap-4 overflow-x-auto px-4 pb-3 scroll-smooth [scrollbar-width:none] sm:auto-cols-[47%] sm:gap-5 md:mx-0 md:auto-cols-[31.5%] md:px-0 lg:auto-cols-[23.6%] [&::-webkit-scrollbar]:hidden"
            aria-label="Carrusel de productos en oferta"
          >
            {list.map((promotion) => {
              const endLabel = formatOfferEnd(promotion.endAt);
              const imageUrl =
                promotion.imageUrl ?? promotion.product.imageUrl;
              const savings = getSavingsAmount(
                promotion.product.precio,
                promotion.discountedPrice,
              );
              const href = `/producto/${encodeURIComponent(
                getProductSlug(promotion.product),
              )}`;
              const productUrl = `${getClientSiteUrl()}${href}`;
              const customCampaignImage =
                promotion.imageStrategy === "CUSTOM";
              const acquisitionBadges =
                promotion.product.tipoAdquisicion === "MIXTO"
                  ? [
                      {
                        label: "Venta",
                        className: "bg-[#0f6a67] text-white",
                      },
                      {
                        label: "Renta",
                        className: "bg-[#2f6fa3] text-white",
                      },
                    ]
                  : [
                      promotion.product.tipoAdquisicion === "RENTA"
                        ? {
                            label: "Renta",
                            className: "bg-[#2f6fa3] text-white",
                          }
                        : {
                            label: "Venta",
                            className: "bg-[#0f6a67] text-white",
                          },
                    ];
              const shareData = {
                title: `${promotion.product.nombre} | CEMYDI`,
                text: `Conoce ${promotion.product.nombre} en CEMYDI con ${promotion.discountPercent}% de descuento. Precio especial ${formatPriceMXN(promotion.discountedPrice)}. Ver producto: ${productUrl}`,
                url: productUrl,
              };

              return (
                <article
                  key={`${promotion.id}:${promotion.productId}`}
                  data-promotion-card
                  className="group flex h-full snap-start flex-col overflow-visible rounded-lg border border-[#e1e9eb] bg-white text-inherit no-underline shadow-[0_12px_30px_rgba(18,39,49,0.055)] outline-none transition duration-200 hover:border-[#c9d8db] hover:shadow-[0_16px_34px_rgba(18,39,49,0.09)] focus-visible:ring-2 focus-visible:ring-[#0f6a67] focus-visible:ring-offset-2"
                >
                  <div className="relative aspect-[4/3] w-full overflow-visible border-b border-[#edf2f3] bg-[#fbfcfc]">
                    <Link
                      href={href}
                      aria-label={`Ver ${promotion.product.nombre} con ${promotion.discountPercent}% de descuento`}
                      className="absolute inset-0 z-[1] outline-none"
                    />
                    <div className="pointer-events-none absolute inset-x-3 top-3 z-10 flex items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                        {acquisitionBadges.map((badge) => (
                          <span
                            key={badge.label}
                            className={`inline-flex items-center rounded px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.08em] ${badge.className}`}
                          >
                            {badge.label}
                          </span>
                        ))}
                        {promotion.product.requiereReceta ? (
                          <span className="inline-flex items-center rounded bg-[#f2f6f7] px-2.5 py-1 text-[0.68rem] font-semibold text-[#304853] ring-1 ring-inset ring-[#dce6e9]">
                            Receta requerida
                          </span>
                        ) : null}
                      </div>

                      <ProductShareMenu
                        shareData={shareData}
                        productName={promotion.product.nombre}
                        compact
                        className="pointer-events-auto shrink-0 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100 sm:data-[open=true]:opacity-100"
                        menuClassName="bottom-auto right-0 top-[calc(100%+8px)]"
                        triggerClassName="!bg-transparent !text-[#176b67] shadow-none ring-0 hover:!bg-transparent hover:!text-[#0f4f4d] !size-7 flex items-center justify-center p-0"
                      />
                    </div>

                    {isOptimizableImageUrl(imageUrl) ? (
                      <div
                        className={`pointer-events-none absolute inset-0 overflow-hidden rounded-t-lg ${
                          customCampaignImage
                            ? ""
                            : "px-2 pb-1 pt-9 sm:px-3 sm:pt-10"
                        }`}
                      >
                        <div className="relative size-full">
                          <Image
                            src={imageUrl}
                            alt={promotion.product.nombre}
                            fill
                            sizes="(max-width: 640px) 84vw, (max-width: 1024px) 47vw, 25vw"
                            className={
                              customCampaignImage
                                ? "object-cover transition duration-300 group-hover:scale-[1.03]"
                                : "scale-[1.08] object-contain transition duration-300 group-hover:scale-[1.12]"
                            }
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="pointer-events-none absolute inset-0 flex items-center justify-center pt-8">
                        <div className="grid size-20 place-items-center rounded-lg border border-[#d6e2e4] bg-white text-xl font-bold text-[#258e8b] shadow-sm">
                          {getProductMonogram(promotion.product.nombre)}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col justify-between p-4">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="grid min-w-0 flex-1 gap-1">
                          <div className="flex min-w-0 items-center justify-between gap-2">
                            <span className="truncate text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-[#667b84]">
                              {promotion.product.marca}
                            </span>
                            {endLabel ? (
                              <span className="shrink-0 text-[0.68rem] font-medium text-[#71858d]">
                                Hasta {endLabel}
                              </span>
                            ) : null}
                          </div>
                          <h3 className="line-clamp-2 min-h-[3rem] text-[1rem] font-semibold leading-6 text-[#142734] sm:text-[1.03rem]">
                            <Link
                              href={href}
                              className="outline-none transition hover:text-[#0f6a67] focus-visible:rounded focus-visible:ring-2 focus-visible:ring-[#0f6a67] focus-visible:ring-offset-2"
                            >
                              {promotion.product.nombre}
                            </Link>
                          </h3>
                        </div>

                        <FavoriteButton
                          product={promotion.product}
                          compact
                          className="shrink-0 z-10 opacity-100 transition duration-200 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100 sm:data-[favorite=true]:opacity-100"
                        />
                      </div>

                      <p className="mt-1.5 text-sm text-[#5f7780]">
                        {promotion.product.modelo} ·{" "}
                        {formatAcquisitionType(
                          promotion.product.tipoAdquisicion,
                        )}
                      </p>
                    </div>

                    <div className="mt-3 grid gap-1.5">
                      <div className="flex min-h-4 flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                        <span className="tabular-nums text-[#84959b] line-through">
                          {formatPriceMXN(promotion.product.precio)}
                        </span>
                        <span className="font-semibold text-[#9f3029]">
                          Ahorras {formatPriceMXN(savings)}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5">
                        <strong className="text-[1.5rem] font-semibold leading-none tracking-[-0.02em] text-[#172f38]">
                          {formatPriceMXN(promotion.discountedPrice)}
                        </strong>
                        <PromotionBadge
                          percent={promotion.discountPercent}
                          compact
                          shortLabel
                          className="rounded-full px-2.5 py-1 shadow-none"
                        />
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {list.length > 0 ? (
          <div className="mt-8 flex flex-col items-center gap-3 sm:hidden">
            <Link
              href="/catalogo"
              className="inline-flex w-full items-center justify-center rounded-full border border-[#0f6a67] px-6 py-3 text-sm font-bold text-[#0f6a67] no-underline transition hover:bg-[#0f6a67] hover:text-white"
            >
              Ver todos los productos
            </Link>
            <p className="m-0 text-center text-xs text-[#6b858c]">
              Precios y existencias sujetos a cambio.
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}

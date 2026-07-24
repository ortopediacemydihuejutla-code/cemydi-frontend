"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

import { ProductCard } from "@/app/catalogo/components/ProductGrid";
import {
  getCatalogRecommendations,
  type CatalogProduct,
} from "@/services/catalog";

type RecommendationSource = Pick<CatalogProduct, "id">;

type DemoRecommendationsProps = {
  context: "product" | "cart";
  sourceProducts: RecommendationSource[];
};

const contentByContext = {
  product: {
    title: "Descubre opciones pensadas para ti",
    subtitle: "Productos seleccionados según lo que estás consultando.",
  },
  cart: {
    title: "Completa tu compra",
    subtitle: "Complementos que pueden acompañar los productos de tu carrito.",
  },
} as const;

export default function DemoRecommendations({
  context,
  sourceProducts,
}: DemoRecommendationsProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [catalogProducts, setCatalogProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [canScrollPrevious, setCanScrollPrevious] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const sourceKey = sourceProducts.map((product) => product.id).join(",");

  useEffect(() => {
    const sourceIds = sourceKey.split(",").map(Number).filter(Number.isFinite);
    if (sourceIds.length === 0) return;

    let cancelled = false;

    const loadCatalog = async () => {
      try {
        setLoading(true);
        const results = await Promise.all(
          sourceIds.slice(0, 4).map((productId) =>
            getCatalogRecommendations(productId, 8),
          ),
        );
        const excludedIds = new Set(sourceIds);
        const unique = new Map<number, CatalogProduct>();
        results.forEach((result) =>
          result.recommendations.forEach((product) => {
            if (!excludedIds.has(product.id) && !unique.has(product.id)) {
              unique.set(product.id, product);
            }
          }),
        );

        if (!cancelled) {
          setCatalogProducts([...unique.values()].slice(0, 12));
        }
      } catch {
        if (!cancelled) {
          setCatalogProducts([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadCatalog();

    return () => {
      cancelled = true;
    };
  }, [sourceKey]);

  const recommendations = useMemo(() => catalogProducts, [catalogProducts]);

  const updateCarouselControls = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    const maxScrollLeft = Math.max(0, track.scrollWidth - track.clientWidth);
    setCanScrollPrevious(track.scrollLeft > 4);
    setCanScrollNext(track.scrollLeft < maxScrollLeft - 4);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || loading) return;

    const handleScroll = () => updateCarouselControls();
    const frame = window.requestAnimationFrame(updateCarouselControls);
    track.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", updateCarouselControls);

    return () => {
      window.cancelAnimationFrame(frame);
      track.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", updateCarouselControls);
    };
  }, [loading, recommendations, updateCarouselControls]);

  const scrollCarousel = (direction: -1 | 1) => {
    const track = trackRef.current;
    if (!track) return;

    const card = track.querySelector<HTMLElement>("[data-recommendation-card='true']");
    const scrollAmount = card ? card.offsetWidth + 20 : Math.max(track.clientWidth * 0.8, 280);
    track.scrollBy({ left: direction * scrollAmount, behavior: "smooth" });
  };

  if (sourceProducts.length === 0) return null;
  if (!loading && recommendations.length === 0) return null;

  const content = contentByContext[context];

  return (
    <section
      className="mt-10"
      aria-labelledby={`recommendations-${context}-title`}
    >
      <div className="mb-5 flex items-end justify-between gap-4 border-b border-[#dbe6e8] pb-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#e3f2f1] text-[#176b67]">
            <Sparkles className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h2
              id={`recommendations-${context}-title`}
              className="text-[1.4rem] font-semibold tracking-[-0.01em] text-[#142734] sm:text-[1.65rem]"
            >
              {content.title}
            </h2>
            <p className="mt-1 text-sm leading-5 text-[#617780]">
              {content.subtitle}
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4" aria-label="Cargando recomendaciones">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-[360px] animate-pulse rounded-lg border border-[#e2eaec] bg-white"
            />
          ))}
        </div>
      ) : (
        <div className="relative">
          <button
            type="button"
            onClick={() => scrollCarousel(-1)}
            disabled={!canScrollPrevious}
            aria-label="Ver recomendaciones anteriores"
            className="absolute left-0 top-1/2 z-[2] grid size-11 -translate-y-1/2 place-items-center text-[#1f6a67] drop-shadow-[0_0_3px_rgba(255,255,255,0.98)] transition hover:scale-110 hover:text-[#154f4d] disabled:pointer-events-none disabled:opacity-0"
          >
            <ChevronLeft className="size-8 stroke-[2.4]" aria-hidden="true" />
          </button>

          <div
            ref={trackRef}
            className="overflow-x-auto overflow-y-hidden scroll-smooth px-1 py-1 [scrollbar-width:none] [scroll-snap-type:x_mandatory] [&::-webkit-scrollbar]:hidden"
          >
            <div className="grid grid-flow-col auto-cols-[100%] gap-5 sm:auto-cols-[48%] lg:auto-cols-[31.5%] xl:auto-cols-[23.5%]">
              {recommendations.map((product) => (
                <div
                  key={product.id}
                  data-recommendation-card="true"
                  className="h-full [scroll-snap-align:start]"
                >
                  <ProductCard
                    product={product}
                    searchQuery=""
                    isPromoted={false}
                    view="grid"
                  />
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => scrollCarousel(1)}
            disabled={!canScrollNext}
            aria-label="Ver más recomendaciones"
            className="absolute right-0 top-1/2 z-[2] grid size-11 -translate-y-1/2 place-items-center text-[#1f6a67] drop-shadow-[0_0_3px_rgba(255,255,255,0.98)] transition hover:scale-110 hover:text-[#154f4d] disabled:pointer-events-none disabled:opacity-0"
          >
            <ChevronRight className="size-8 stroke-[2.4]" aria-hidden="true" />
          </button>
        </div>
      )}
    </section>
  );
}

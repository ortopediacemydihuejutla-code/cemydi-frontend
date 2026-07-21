"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

import { ProductCard } from "@/app/catalogo/components/ProductGrid";
import {
  ENABLE_RECOMMENDATION_DEMO,
  getMatchingDemoRules,
  selectDemoRecommendations,
  type DemoRecommendationSource,
} from "@/data/recommendation-demo";
import { getCatalogProducts, type CatalogProduct } from "@/services/catalog";

type DemoRecommendationsProps = {
  context: "product" | "cart";
  sourceProducts: DemoRecommendationSource[];
};

const contentByContext = {
  product: {
    title: "También te puede interesar",
  },
  cart: {
    title: "Completa tu compra",
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
  const matchingRules = useMemo(
    () => getMatchingDemoRules(sourceProducts),
    [sourceProducts],
  );
  const sourceKey = sourceProducts.map((product) => product.id).join(",");

  useEffect(() => {
    if (!ENABLE_RECOMMENDATION_DEMO || matchingRules.length === 0) return;

    let cancelled = false;

    const loadCatalog = async () => {
      try {
        setLoading(true);
        const result = await getCatalogProducts({
          page: 1,
          pageSize: 200,
          soloDisponibles: true,
        });

        if (!cancelled) {
          setCatalogProducts(result.products);
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
  }, [matchingRules.length, sourceKey]);

  const recommendations = useMemo(
    () => selectDemoRecommendations(sourceProducts, catalogProducts),
    [catalogProducts, sourceProducts],
  );

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

  if (!ENABLE_RECOMMENDATION_DEMO || matchingRules.length === 0) return null;
  if (!loading && recommendations.length === 0) return null;

  const content = contentByContext[context];

  return (
    <section
      className="mt-10"
      aria-labelledby={`recommendations-${context}-title`}
    >
      <div className="mb-5 flex items-center gap-3 border-b border-[#dbe6e8] pb-4">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#e3f2f1] text-[#176b67]">
          <Sparkles className="size-5" aria-hidden="true" />
        </span>
        <h2
          id={`recommendations-${context}-title`}
          className="text-[1.5rem] font-semibold tracking-[-0.01em] text-[#142734] sm:text-[1.65rem]"
        >
          {content.title}
        </h2>
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
            className="absolute left-[-12px] top-1/2 z-[2] grid size-11 -translate-y-1/2 place-items-center rounded-full border border-[#cfe0e3] bg-white text-[#1f6a67] shadow-[0_12px_26px_rgba(31,106,103,0.14)] transition hover:bg-[#eef7f6] disabled:pointer-events-none disabled:opacity-0 sm:left-[-20px]"
          >
            <ChevronLeft className="size-5" aria-hidden="true" />
          </button>

          <div
            ref={trackRef}
            className="overflow-x-auto overflow-y-hidden scroll-smooth px-1 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <div className="grid grid-flow-col auto-cols-[88%] gap-5 sm:auto-cols-[48%] lg:auto-cols-[31.5%] xl:auto-cols-[23.5%]">
              {recommendations.map((product) => (
                <div key={product.id} data-recommendation-card="true" className="h-full">
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
            className="absolute right-[-12px] top-1/2 z-[2] grid size-11 -translate-y-1/2 place-items-center rounded-full border border-[#cfe0e3] bg-white text-[#1f6a67] shadow-[0_12px_26px_rgba(31,106,103,0.14)] transition hover:bg-[#eef7f6] disabled:pointer-events-none disabled:opacity-0 sm:right-[-20px]"
          >
            <ChevronRight className="size-5" aria-hidden="true" />
          </button>
        </div>
      )}
    </section>
  );
}

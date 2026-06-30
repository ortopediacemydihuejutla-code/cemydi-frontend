"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { CatalogProduct } from "@/services/catalog";
import { normalizeClassificationKey } from "../utils/catalog-formatters";
import {
  buildCatalogQueryParams,
  catalogPathFromParams,
  countActiveFilters,
  normalizeMarcaKey,
  type CatalogAppliedParams,
  type CatalogSort,
  type CatalogView,
} from "../utils/catalog-params";
import CatalogActiveFilters from "./CatalogActiveFilters";
import CatalogFilters from "./CatalogFilters";
import CatalogPagination from "./CatalogPagination";
import CatalogToolbar from "./CatalogToolbar";
import ProductGrid from "./ProductGrid";

type CatalogPaginationData = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
};

type CatalogClientProps = {
  products: CatalogProduct[];
  pagination: CatalogPaginationData;
  availableClassifications: string[];
  availableBrands: string[];
  promotedProductIds: number[];
  applied: CatalogAppliedParams;
  error?: string;
};

export default function CatalogClient({
  products,
  pagination,
  availableClassifications,
  availableBrands,
  promotedProductIds,
  applied,
  error = "",
}: CatalogClientProps) {
  const router = useRouter();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const currentPage = Math.min(applied.page, pagination.totalPages);
  const activeFilterCount = countActiveFilters(applied);
  const promotedSet = new Set(promotedProductIds);

  const navigateWithParams = (options: Partial<CatalogAppliedParams> & { page?: number }) => {
    const params = buildCatalogQueryParams({
      searchQuery: options.searchQuery ?? applied.searchQuery,
      clasificaciones: options.clasificaciones ?? applied.clasificaciones,
      marcas: options.marcas ?? applied.marcas,
      tipos: options.tipos ?? applied.tipos,
      receta: options.receta !== undefined ? options.receta : applied.receta,
      soloDisponibles:
        options.soloDisponibles !== undefined
          ? options.soloDisponibles
          : applied.soloDisponibles,
      sort: options.sort ?? applied.sort,
      view: options.view ?? applied.view,
      page: options.page ?? 1,
    });

    startTransition(() => {
      router.push(catalogPathFromParams(params));
    });
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [applied.page]);

  useEffect(() => {
    if (!mobileFiltersOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileFiltersOpen(false);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileFiltersOpen]);

  const toggleClassification = (value: string) => {
    const normalizedValue = normalizeClassificationKey(value);
    const next = applied.clasificaciones.some(
      (item) => normalizeClassificationKey(item) === normalizedValue,
    )
      ? applied.clasificaciones.filter(
          (item) => normalizeClassificationKey(item) !== normalizedValue,
        )
      : [...applied.clasificaciones, value];

    navigateWithParams({ clasificaciones: next, page: 1 });
  };

  const toggleMarca = (value: string) => {
    const normalizedValue = normalizeMarcaKey(value);
    const next = applied.marcas.some((item) => normalizeMarcaKey(item) === normalizedValue)
      ? applied.marcas.filter((item) => normalizeMarcaKey(item) !== normalizedValue)
      : [...applied.marcas, value];

    navigateWithParams({ marcas: next, page: 1 });
  };

  const toggleTipo = (value: "VENTA" | "RENTA" | "MIXTO") => {
    const next = applied.tipos.includes(value)
      ? applied.tipos.filter((item) => item !== value)
      : [...applied.tipos, value];

    navigateWithParams({ tipos: next, page: 1 });
  };

  const toggleReceta = (value: "con" | "sin") => {
    const next = applied.receta === value ? null : value;
    navigateWithParams({ receta: next, page: 1 });
  };

  const toggleSoloDisponibles = () => {
    navigateWithParams({ soloDisponibles: !applied.soloDisponibles, page: 1 });
  };

  const clearAllFilters = () => {
    navigateWithParams({
      searchQuery: "",
      clasificaciones: [],
      marcas: [],
      tipos: [],
      receta: null,
      soloDisponibles: false,
      page: 1,
    });
  };

  const filterProps = {
    availableClassifications,
    availableBrands,
    applied,
    onToggleClassification: toggleClassification,
    onToggleMarca: toggleMarca,
    onToggleTipo: toggleTipo,
    onToggleReceta: toggleReceta,
    onToggleSoloDisponibles: toggleSoloDisponibles,
    onClearAll: clearAllFilters,
  };
  const activeFilters = (
    <CatalogActiveFilters
      applied={applied}
      onRemoveSearch={() => navigateWithParams({ searchQuery: "", page: 1 })}
      onRemoveClassification={toggleClassification}
      onRemoveMarca={toggleMarca}
      onRemoveTipo={toggleTipo}
      onRemoveReceta={() => navigateWithParams({ receta: null, page: 1 })}
      onRemoveSoloDisponibles={() =>
        navigateWithParams({ soloDisponibles: false, page: 1 })
      }
      onClearAll={clearAllFilters}
      compact
      showClearAll={false}
    />
  );

  return (
    <div className="min-h-[calc(100vh-110px)] bg-white">
      <div className="grid min-h-[inherit] w-full grid-cols-1 gap-7 px-4 py-6 lg:grid-cols-[286px_minmax(0,1fr)] lg:px-8 lg:py-8 xl:gap-9 xl:px-10 2xl:px-12">
        <CatalogFilters
          {...filterProps}
          activeFilters={activeFilters}
          className="sticky top-24 hidden h-[calc(100dvh-7rem)] self-start overflow-hidden lg:block"
        />

        <div className="grid min-w-0 content-start gap-5 pb-8 lg:pb-12">
          <header className="pb-1">
            <h1 className="text-[clamp(1.9rem,3vw,2.55rem)] font-semibold leading-tight text-[#122731]">
              {applied.searchQuery.trim()
                ? `Resultados para "${applied.searchQuery.trim()}"`
                : "Catálogo de productos"}
            </h1>
            <p className="mt-3 max-w-[760px] text-[0.98rem] leading-7 text-[#5c7078]">
              {applied.searchQuery.trim()
                ? "Usa filtros y ordenamiento para ubicar la mejor opción."
                : "Explora suministros médicos, movilidad, rehabilitación y soporte con una experiencia clara, ordenada y funcional."}
            </p>
          </header>

          <CatalogToolbar
            searchQuery={applied.searchQuery}
            sort={applied.sort}
            view={applied.view}
            activeFilterCount={activeFilterCount}
            onSearchSubmit={(query) => navigateWithParams({ searchQuery: query, page: 1 })}
            onSortChange={(sort: CatalogSort) => navigateWithParams({ sort, page: 1 })}
            onViewChange={(view: CatalogView) =>
              navigateWithParams({ view, page: applied.page })
            }
            onOpenMobileFilters={() => setMobileFiltersOpen(true)}
          />

          <div className="grid min-w-0 gap-5">
            {error ? (
              <p
                className="m-0 rounded-2xl border border-[#f3c6c6] bg-[#fff0f0] px-4 py-3 text-[0.92rem] font-semibold text-[#a11d1d]"
                role="alert"
                aria-live="polite"
              >
                {error}
              </p>
            ) : null}

            <section
              className="relative grid gap-5"
              aria-busy={isPending}
              aria-live="polite"
            >
              {isPending ? (
                <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center">
                  <div className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#d7e6e7] bg-white/95 px-4 text-sm font-semibold text-[#1d454c] shadow-[0_12px_30px_rgba(18,39,49,0.12)] backdrop-blur">
                    <span className="size-4 animate-spin rounded-full border-2 border-[#c6d8dc] border-t-[#0f6a67]" />
                    Actualizando productos
                  </div>
                </div>
              ) : null}
              <ProductGrid
                products={products}
                view={applied.view}
                searchQuery={applied.searchQuery}
                promotedProductIds={promotedSet}
                isPending={isPending}
              />
            </section>

            {products.length > 0 ? (
              <CatalogPagination
                currentPage={currentPage}
                totalPages={pagination.totalPages}
                onPageChange={(page) => navigateWithParams({ page })}
              />
            ) : null}
          </div>
        </div>
      </div>

      {mobileFiltersOpen ? (
        <div className="fixed inset-0 z-50 flex justify-end" role="presentation">
          <button
            type="button"
            className="absolute inset-0 cursor-pointer border-none bg-[rgba(15,42,50,0.45)]"
            aria-label="Cerrar filtros"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div
            className="relative flex h-full w-[min(380px,92vw)] flex-col bg-[#f5f9fa] shadow-[-8px_0_32px_rgba(0,0,0,0.12)]"
            role="dialog"
            aria-modal="true"
            aria-label="Filtros"
          >
            <div className="flex items-center justify-between px-[18px] pt-[18px]">
              <h2 className="m-0 text-base font-semibold text-[#18313f]">
                Filtros
              </h2>
              <button
                type="button"
                className="flex size-11 cursor-pointer items-center justify-center rounded-xl bg-white text-[1.4rem] leading-none text-[#1e6260] outline-none focus-visible:ring-2 focus-visible:ring-[#0f6a67] focus-visible:ring-offset-2"
                onClick={() => setMobileFiltersOpen(false)}
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>
            <CatalogFilters
              {...filterProps}
              activeFilters={activeFilters}
              className="flex-1 overflow-y-auto px-[18px] py-3"
              onClearAll={() => {
                clearAllFilters();
                setMobileFiltersOpen(false);
              }}
            />
            <button
              type="button"
              className="mx-[18px] mb-[18px] min-h-11 cursor-pointer rounded-2xl bg-[#0f6a67] px-4 py-[14px] text-[0.92rem] font-semibold text-white outline-none transition hover:bg-[#0c5a57] focus-visible:ring-2 focus-visible:ring-[#0f6a67] focus-visible:ring-offset-2"
              onClick={() => setMobileFiltersOpen(false)}
            >
              Ver {pagination.total} resultados
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

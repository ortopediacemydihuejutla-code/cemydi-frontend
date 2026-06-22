"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Grid2X2,
  List,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

import {
  CATALOG_SORT_OPTIONS,
  type CatalogSort,
  type CatalogView,
} from "../utils/catalog-params";

type CatalogToolbarProps = {
  searchQuery: string;
  sort: CatalogSort;
  view: CatalogView;
  activeFilterCount: number;
  onSearchSubmit: (query: string) => void;
  onSortChange: (sort: CatalogSort) => void;
  onViewChange: (view: CatalogView) => void;
  onOpenMobileFilters: () => void;
};

type SearchSuggestion = {
  id: number;
  nombre: string;
  marca: string;
};

export default function CatalogToolbar({
  searchQuery,
  sort,
  view,
  activeFilterCount,
  onSearchSubmit,
  onSortChange,
  onViewChange,
  onOpenMobileFilters,
}: CatalogToolbarProps) {
  const [searchDraft, setSearchDraft] = useState(searchQuery);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  useEffect(() => {
    setSearchDraft(searchQuery);
  }, [searchQuery]);

  const normalizedDraft = useMemo(() => searchDraft.trim(), [searchDraft]);

  useEffect(() => {
    if (normalizedDraft.length < 2) {
      setSuggestions([]);
      setSuggestionsOpen(false);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setLoadingSuggestions(true);

      try {
        const params = new URLSearchParams();
        params.set("search", normalizedDraft);
        params.set("page", "1");
        params.set("pageSize", "6");
        params.set("sort", "nombre-asc");

        const res = await fetch(`/api/products?${params.toString()}`, {
          signal: controller.signal,
        });

        if (!res.ok) {
          setSuggestions([]);
          setSuggestionsOpen(false);
          return;
        }

        const data = (await res.json()) as { products?: unknown[] };
        const list = Array.isArray(data.products) ? data.products : [];

        const mapped = list
          .map((item) => item as Partial<SearchSuggestion>)
          .filter((item): item is SearchSuggestion => {
            return (
              typeof item.id === "number" &&
              typeof item.nombre === "string" &&
              typeof item.marca === "string"
            );
          })
          .slice(0, 6);

        setSuggestions(mapped);
        setSuggestionsOpen(mapped.length > 0);
      } catch {
        setSuggestions([]);
        setSuggestionsOpen(false);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [normalizedDraft]);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearchSubmit(searchDraft.trim());
    setSuggestionsOpen(false);
  };

  const handleClearSearch = () => {
    setSearchDraft("");
    onSearchSubmit("");
    setSuggestionsOpen(false);
  };

  const selectSuggestion = (suggestion: SearchSuggestion) => {
    setSearchDraft(suggestion.nombre);
    onSearchSubmit(suggestion.nombre);
    setSuggestionsOpen(false);
  };

  return (
    <section className="grid gap-3 border-b border-[#e5ecee] pb-5">
      <div className="grid gap-4">
        <form className="relative min-w-0" onSubmit={handleSearch}>
          <label htmlFor="catalog-search" className="sr-only">
            Buscar en el catálogo
          </label>
          <Search
            className="pointer-events-none absolute left-4 top-1/2 z-[1] size-5 -translate-y-1/2 text-[#7a8e97]"
            aria-hidden="true"
          />
          <input
            id="catalog-search"
            name="catalog-search"
            type="search"
            className="h-13 w-full rounded-lg border border-[#d6e0e3] bg-white px-14 pr-28 text-[0.95rem] text-[#18313f] shadow-[0_8px_20px_rgba(18,39,49,0.04)] outline-none transition placeholder:text-[#8ca0a8] focus:border-[#0f6a67] focus:ring-4 focus:ring-[rgba(15,106,103,0.12)]"
            placeholder="Buscar por nombre, marca, modelo o categoría"
            value={searchDraft}
            onChange={(event) => {
              setSearchDraft(event.target.value);
              setSuggestionsOpen(true);
            }}
            onFocus={() => {
              if (suggestions.length > 0) setSuggestionsOpen(true);
            }}
            onBlur={() => {
              window.setTimeout(() => setSuggestionsOpen(false), 120);
            }}
            autoComplete="off"
          />
          {searchDraft ? (
            <button
              type="button"
              className="absolute right-[92px] top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-[#6f8590] outline-none transition hover:bg-[#eef5f6] focus-visible:ring-2 focus-visible:ring-[#0f6a67] focus-visible:ring-offset-2"
              onClick={handleClearSearch}
              aria-label="Limpiar búsqueda"
            >
              <X className="size-4" />
            </button>
          ) : null}
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 inline-flex min-h-10 items-center rounded-md bg-[#172932] px-5 text-sm font-semibold text-white outline-none transition hover:bg-[#0f1f27] focus-visible:ring-2 focus-visible:ring-[#0f6a67] focus-visible:ring-offset-2"
          >
            Buscar
          </button>

          {suggestionsOpen ? (
            <div
              className="absolute inset-x-0 top-[calc(100%+10px)] z-20 overflow-hidden rounded-lg border border-[#dfe8eb] bg-white shadow-[0_18px_48px_rgba(15,42,50,0.12)]"
              role="listbox"
              aria-label="Sugerencias de búsqueda"
            >
              {loadingSuggestions ? (
                <div className="border-b border-[#edf2f3] px-4 py-3 text-sm font-medium text-[#61747d]">
                  Buscando...
                </div>
              ) : null}
              {suggestions.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="grid min-h-12 w-full gap-1 bg-white px-4 py-3 text-left outline-none transition hover:bg-[#f6fbfb] focus-visible:bg-[#f6fbfb]"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectSuggestion(item)}
                >
                  <span className="text-sm font-semibold text-[#18313f]">{item.nombre}</span>
                  <span className="text-xs font-medium text-[#61747d]">{item.marca}</span>
                </button>
              ))}
            </div>
          ) : null}
        </form>

        <div className="grid gap-3 sm:grid-cols-[auto_auto_auto] sm:items-end sm:justify-between">
          <button
            type="button"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[#d7e3e6] bg-white px-4 text-sm font-semibold text-[#21414d] outline-none transition hover:border-[#b8ccd1] hover:bg-[#f8fbfb] focus-visible:ring-2 focus-visible:ring-[#0f6a67] focus-visible:ring-offset-2 lg:hidden"
            onClick={onOpenMobileFilters}
          >
            <SlidersHorizontal className="size-4" aria-hidden="true" />
            Filtros
            {activeFilterCount > 0 ? (
              <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-[#18313f] px-2 py-0.5 text-xs font-semibold text-white">
                {activeFilterCount}
              </span>
            ) : null}
          </button>

          <label className="grid gap-1">
            <span className="text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-[#7a8e97]">
              Ordenar
            </span>
            <select
              className="min-h-11 cursor-pointer rounded-md border border-[#d7e3e6] bg-white px-4 text-sm font-medium text-[#21414d] outline-none transition focus:border-[#0f6a67] focus:ring-4 focus:ring-[rgba(15,106,103,0.12)]"
              value={sort}
              onChange={(event) => onSortChange(event.target.value as CatalogSort)}
              aria-label="Ordenar productos"
            >
              {CATALOG_SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <div
            className="inline-flex min-h-11 overflow-hidden rounded-md border border-[#d7e3e6] bg-white"
            role="group"
            aria-label="Vista de productos"
          >
            <button
              type="button"
              className={`inline-flex min-h-11 min-w-11 items-center justify-center outline-none transition focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0f6a67] ${
                view === "grid" ? "bg-[#18313f] text-white" : "text-[#6f8590] hover:bg-[#f3f7f8]"
              }`}
              onClick={() => onViewChange("grid")}
              aria-pressed={view === "grid"}
              aria-label="Vista en cuadrícula"
            >
              <Grid2X2 className="size-4" />
            </button>
            <button
              type="button"
              className={`inline-flex min-h-11 min-w-11 items-center justify-center outline-none transition focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0f6a67] ${
                view === "list" ? "bg-[#18313f] text-white" : "text-[#6f8590] hover:bg-[#f3f7f8]"
              }`}
              onClick={() => onViewChange("list")}
              aria-pressed={view === "list"}
              aria-label="Vista en lista"
            >
              <List className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

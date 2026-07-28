"use client";

import { useMemo, useState } from "react";
import {
  Check,
  PackageSearch,
  Search,
  X,
} from "lucide-react";

import { Badge } from "@/features/admin/components/ui/badge";
import { Button } from "@/features/admin/components/ui/button";
import { cn } from "@/features/admin/lib/utils";
import type { AdminProduct } from "@/services/admin";

type PromotionProductPickerProps = {
  products: AdminProduct[];
  selectedIds: number[];
  classifications: string[];
  disabled?: boolean;
  onChange: (productIds: number[]) => void;
};

export function PromotionProductPicker({
  products,
  selectedIds,
  classifications,
  disabled = false,
  onChange,
}: PromotionProductPickerProps) {
  const [search, setSearch] = useState("");
  const [classification, setClassification] = useState("ALL");
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const visibleProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return products.filter((product) => {
      if (
        classification !== "ALL" &&
        product.clasificacion !== classification
      ) {
        return false;
      }
      if (!query) return true;
      return [product.nombre, product.marca, product.modelo, product.clasificacion]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [classification, products, search]);

  const selectedProducts = useMemo(
    () =>
      selectedIds
        .map((id) => products.find((product) => product.id === id))
        .filter((product): product is AdminProduct => Boolean(product)),
    [products, selectedIds],
  );

  const toggleProduct = (productId: number) => {
    if (disabled) return;
    onChange(
      selectedSet.has(productId)
        ? selectedIds.filter((id) => id !== productId)
        : [...selectedIds, productId],
    );
  };

  const selectableVisibleIds = visibleProducts
    .filter((product) => product.activo)
    .map((product) => product.id);
  const allVisibleSelected =
    selectableVisibleIds.length > 0 &&
    selectableVisibleIds.every((id) => selectedSet.has(id));

  const toggleVisible = () => {
    if (disabled) return;
    if (allVisibleSelected) {
      const visibleSet = new Set(selectableVisibleIds);
      onChange(selectedIds.filter((id) => !visibleSet.has(id)));
      return;
    }
    onChange(
      Array.from(new Set([...selectedIds, ...selectableVisibleIds])).slice(
        0,
        100,
      ),
    );
  };

  return (
    <div className="grid gap-3 sm:col-span-2">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[var(--text-main)]">
            Productos participantes
          </p>
          <p className="mt-1 text-xs leading-relaxed text-[var(--text-muted)]">
            Combina productos de cualquier categoría. Máximo 100 por campaña.
          </p>
        </div>
        <Badge variant={selectedIds.length > 0 ? "blue" : "slate"}>
          {selectedIds.length} seleccionado
          {selectedIds.length === 1 ? "" : "s"}
        </Badge>
      </div>

      {selectedProducts.length > 0 ? (
        <div className="flex max-h-24 flex-wrap gap-2 overflow-y-auto rounded-xl border border-[var(--border-soft)] bg-[var(--surface)] p-3">
          {selectedProducts.map((product) => (
            <button
              key={product.id}
              type="button"
              disabled={disabled}
              onClick={() => toggleProduct(product.id)}
              className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-[var(--border-soft)] bg-[var(--card)] px-3 py-1.5 text-xs font-semibold text-[var(--text-main)] transition hover:border-red-300 hover:text-red-700 disabled:opacity-60"
            >
              <span className="max-w-44 truncate">{product.nombre}</span>
              <X className="size-3.5 shrink-0" aria-hidden />
            </button>
          ))}
        </div>
      ) : null}

      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_220px]">
        <label className="relative">
          <span className="sr-only">Buscar productos para la campaña</span>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--text-muted)]"
            aria-hidden
          />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por producto, marca o modelo"
            className="h-11 w-full rounded-xl border border-[var(--border-soft)] bg-[var(--card)] pl-10 pr-4 text-sm outline-none transition focus:border-[var(--brand-600)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--brand-600)_20%,transparent)]"
            disabled={disabled}
          />
        </label>
        <select
          value={classification}
          onChange={(event) => setClassification(event.target.value)}
          className="h-11 rounded-xl border border-[var(--border-soft)] bg-[var(--card)] px-3 text-sm text-[var(--text-main)] outline-none focus:border-[var(--brand-600)]"
          disabled={disabled}
          aria-label="Filtrar productos por categoría"
        >
          <option value="ALL">Todas las categorías</option>
          {classifications.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-[var(--border-soft)]">
        <div className="flex items-center justify-between gap-3 border-b border-[var(--border-soft)] bg-[var(--surface)] px-3 py-2">
          <span className="text-xs font-medium text-[var(--text-muted)]">
            {visibleProducts.length} resultado
            {visibleProducts.length === 1 ? "" : "s"}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled || selectableVisibleIds.length === 0}
            onClick={toggleVisible}
            className="h-8"
          >
            {allVisibleSelected
              ? "Quitar visibles"
              : "Seleccionar visibles"}
          </Button>
        </div>

        <div className="max-h-72 overflow-y-auto bg-[var(--card)] p-2">
          {visibleProducts.length === 0 ? (
            <div className="grid min-h-36 place-items-center px-4 text-center">
              <div>
                <PackageSearch
                  className="mx-auto size-7 text-[var(--text-muted)]"
                  aria-hidden
                />
                <p className="mt-2 text-sm font-semibold text-[var(--text-main)]">
                  Sin coincidencias
                </p>
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  Cambia la búsqueda o la categoría.
                </p>
              </div>
            </div>
          ) : (
            <ul className="grid gap-1 sm:grid-cols-2">
              {visibleProducts.map((product) => {
                const checked = selectedSet.has(product.id);
                return (
                  <li key={product.id}>
                    <button
                      type="button"
                      disabled={disabled || !product.activo}
                      onClick={() => toggleProduct(product.id)}
                      className={cn(
                        "grid w-full grid-cols-[42px_minmax(0,1fr)_24px] items-center gap-3 rounded-lg border p-2.5 text-left transition",
                        checked
                          ? "border-[var(--brand-600)] bg-[color-mix(in_srgb,var(--brand-600)_8%,var(--card))]"
                          : "border-transparent hover:border-[var(--border-soft)] hover:bg-[var(--surface)]",
                        !product.activo && "cursor-not-allowed opacity-50",
                      )}
                    >
                      <div className="grid size-10 place-items-center overflow-hidden rounded-md border border-[var(--border-soft)] bg-white">
                        {product.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={product.imageUrl}
                            alt=""
                            className="size-full object-contain"
                          />
                        ) : (
                          <span className="text-xs font-bold text-[var(--brand-700)]">
                            {product.nombre.slice(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[var(--text-main)]">
                          {product.nombre}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-[var(--text-muted)]">
                          {product.clasificacion} · {product.marca}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "grid size-5 place-items-center rounded border",
                          checked
                            ? "border-[var(--brand-600)] bg-[var(--brand-600)] text-white"
                            : "border-[var(--border-soft)]",
                        )}
                        aria-hidden
                      >
                        {checked ? <Check className="size-3.5" /> : null}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

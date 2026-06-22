"use client";

import {
  Boxes,
  EyeOff,
  FileDown,
  FileSearch,
  FileSpreadsheet,
  FileUp,
  Search,
  TableProperties,
  X,
} from "lucide-react";

import { formatNumberEsMx } from "@/features/admin/lib/admin-list-utils";
import { Button } from "@/features/admin/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/features/admin/components/ui/dropdown-menu";
import { Input } from "@/features/admin/components/ui/input";
import { cn } from "@/features/admin/lib/utils";
import { productFieldClassName } from "@/features/admin/lib/product-shared";
import type { ProductsAdminState } from "../hooks/useProducts";
import {
  DEFAULT_TABLE_ADVANCED_FILTERS,
  PRODUCT_COLUMN_LABELS,
  PRODUCT_COLUMN_ORDER,
  PRODUCT_QUICK_FILTERS,
  type ProductTableAdvancedFilters,
} from "../utils/product-types";

type ProductFiltersProps = {
  state: ProductsAdminState;
};

export function ProductFilters({ state }: ProductFiltersProps) {
  const {
    quickFilter,
    setQuickFilter,
    quickFilterCounts,
    search,
    setSearch,
    draftTableAdvancedFilters,
    setDraftTableAdvancedFilters,
    openTableFiltersMenu,
    tableFiltersMenuOpen,
    exportSupplierOptions,
    tableClassificationOptions,
    tableBrandOptions,
    applyTableAdvancedFilters,
    visibleProductColumns,
    toggleProductColumnVisibility,
    resetProductVisibleColumns,
    openProductTemplateModal,
    openProductImportPicker,
    openProductExportModal,
    productCsvInputRef,
    onProductCsvSelected,
    filteredProducts,
    activeTableAdvancedFilterLabels,
    clearTableAdvancedFilters,
  } = state;

  return (
    <>
      <div className="inline-flex w-fit max-w-full flex-wrap items-center gap-1 rounded-xl bg-[var(--surface)] p-1">
        {PRODUCT_QUICK_FILTERS.map((tab) => {
          const isActive = quickFilter === tab.id;
          const count = quickFilterCounts[tab.id];

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setQuickFilter(tab.id)}
              className={cn(
                "inline-flex min-h-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition",
                isActive
                  ? "bg-[var(--card)] text-[var(--brand-900)] shadow-[0_1px_3px_rgba(15,61,59,0.14)]"
                  : "text-[var(--text-muted)] hover:text-[var(--brand-800)]",
              )}
            >
              <span>{tab.label}</span>
              <span
                className={cn(
                  "rounded-sm px-1.5 py-0.5 text-xs",
                  isActive
                    ? "bg-[color-mix(in_srgb,var(--brand-600)_12%,var(--surface))] text-[var(--brand-800)]"
                    : "bg-[var(--card)] text-[var(--brand-800)]",
                )}
              >
                {formatNumberEsMx(count)}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="relative w-full xl:max-w-md xl:shrink-0">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[var(--text-muted)]"
            aria-hidden
          />
          <Input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar productos..."
            className="h-11 rounded-md border-[var(--border-soft)] bg-[var(--surface)] pl-10"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 xl:justify-end">
          <DropdownMenu open={tableFiltersMenuOpen} onOpenChange={openTableFiltersMenu}>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-md border-[var(--border-soft)] bg-[var(--card)] px-4 text-[var(--brand-800)] shadow-none hover:bg-[var(--surface)]"
              >
                <FileSearch className="size-4" />
                Filtros
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-[min(440px,calc(100vw-1.5rem))] rounded-lg border-[var(--border-soft)] bg-[var(--card)] p-0 shadow-[var(--shadow-md)]"
            >
              <div className="grid gap-4 p-4">
                <DropdownMenuLabel className="p-0 text-base font-semibold">
                  Filtros de tabla
                </DropdownMenuLabel>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-2 text-sm font-medium text-[var(--text-main)]">
                    Proveedor
                    <select
                      className={productFieldClassName}
                      value={draftTableAdvancedFilters.supplier}
                      onChange={(event) =>
                        setDraftTableAdvancedFilters((current) => ({
                          ...current,
                          supplier: event.target.value,
                        }))
                      }
                    >
                      <option value="ALL">Todos</option>
                      {exportSupplierOptions.map((supplier) => (
                        <option key={supplier} value={supplier}>
                          {supplier}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="grid gap-2 text-sm font-medium text-[var(--text-main)]">
                    Clasificación
                    <select
                      className={productFieldClassName}
                      value={draftTableAdvancedFilters.classification}
                      onChange={(event) =>
                        setDraftTableAdvancedFilters((current) => ({
                          ...current,
                          classification: event.target.value,
                        }))
                      }
                    >
                      <option value="ALL">Todas</option>
                      {tableClassificationOptions.map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="grid gap-2 text-sm font-medium text-[var(--text-main)]">
                    Marca
                    <select
                      className={productFieldClassName}
                      value={draftTableAdvancedFilters.brand}
                      onChange={(event) =>
                        setDraftTableAdvancedFilters((current) => ({
                          ...current,
                          brand: event.target.value,
                        }))
                      }
                    >
                      <option value="ALL">Todas</option>
                      {tableBrandOptions.map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="grid gap-2 text-sm font-medium text-[var(--text-main)]">
                    Modo de adquisición
                    <select
                      className={productFieldClassName}
                      value={draftTableAdvancedFilters.mode}
                      onChange={(event) =>
                        setDraftTableAdvancedFilters((current) => ({
                          ...current,
                          mode: event.target.value as ProductTableAdvancedFilters["mode"],
                        }))
                      }
                    >
                      <option value="ALL">Todos</option>
                      <option value="VENTA">Venta</option>
                      <option value="RENTA">Renta</option>
                      <option value="MIXTO">Mixto</option>
                    </select>
                  </label>

                  <label className="grid gap-2 text-sm font-medium text-[var(--text-main)]">
                    Receta
                    <select
                      className={productFieldClassName}
                      value={draftTableAdvancedFilters.recipe}
                      onChange={(event) =>
                        setDraftTableAdvancedFilters((current) => ({
                          ...current,
                          recipe: event.target.value as ProductTableAdvancedFilters["recipe"],
                        }))
                      }
                    >
                      <option value="ALL">Todas</option>
                      <option value="YES">Con receta</option>
                      <option value="NO">Sin receta</option>
                    </select>
                  </label>

                  <label className="grid gap-2 text-sm font-medium text-[var(--text-main)]">
                    Stock
                    <select
                      className={productFieldClassName}
                      value={draftTableAdvancedFilters.stockBand}
                      onChange={(event) =>
                        setDraftTableAdvancedFilters((current) => ({
                          ...current,
                          stockBand: event.target.value as ProductTableAdvancedFilters["stockBand"],
                        }))
                      }
                    >
                      <option value="ALL">Cualquiera</option>
                      <option value="OUT">Sin stock (0)</option>
                      <option value="LOW">Bajo (1–5)</option>
                      <option value="OK">Disponible (&gt;5)</option>
                    </select>
                  </label>
                </div>

                <div className="flex flex-col gap-2 border-t border-[var(--border-soft)] pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDraftTableAdvancedFilters(DEFAULT_TABLE_ADVANCED_FILTERS)}
                    className="rounded-md"
                  >
                    Limpiar borrador
                  </Button>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => openTableFiltersMenu(false)}
                      className="rounded-md"
                    >
                      Cerrar
                    </Button>
                    <Button type="button" onClick={applyTableAdvancedFilters} className="rounded-md">
                      Aplicar
                    </Button>
                  </div>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-md border-[var(--border-soft)] bg-[var(--card)] px-4 text-[var(--brand-800)] shadow-none hover:bg-[var(--surface)]"
              >
                <TableProperties className="size-4" />
                Columnas
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 rounded-lg border-[var(--border-soft)] bg-[var(--card)] p-1.5 shadow-[var(--shadow-md)]"
            >
              <DropdownMenuLabel>Mostrar columnas</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {PRODUCT_COLUMN_ORDER.map((columnId) => (
                <DropdownMenuCheckboxItem
                  key={columnId}
                  checked={visibleProductColumns[columnId]}
                  onCheckedChange={(checked) =>
                    toggleProductColumnVisibility(columnId, checked === true)
                  }
                >
                  {PRODUCT_COLUMN_LABELS[columnId]}
                </DropdownMenuCheckboxItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={resetProductVisibleColumns}>
                <EyeOff className="size-4" />
                Restaurar columnas
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-md border-[var(--border-soft)] bg-[var(--card)] px-4 text-[var(--brand-800)] shadow-none hover:bg-[var(--surface)]"
            onClick={openProductTemplateModal}
          >
            <FileSpreadsheet className="size-4" />
            Plantilla CSV
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-md border-[var(--border-soft)] bg-[var(--card)] px-4 text-[var(--brand-800)] shadow-none hover:bg-[var(--surface)]"
            onClick={openProductImportPicker}
          >
            <FileUp className="size-4" />
            Importar CSV
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-md border-[var(--border-soft)] bg-[var(--card)] px-4 text-[var(--brand-800)] shadow-none hover:bg-[var(--surface)]"
            onClick={openProductExportModal}
          >
            <FileDown className="size-4" />
            Exportar CSV
          </Button>
          <input
            ref={productCsvInputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={onProductCsvSelected}
            className="sr-only"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
          <Boxes className="size-4 opacity-70" />
          {filteredProducts.length} resultado{filteredProducts.length === 1 ? "" : "s"}
          {search.trim() ? ` para "${search.trim()}"` : ""}
        </div>

        {activeTableAdvancedFilterLabels.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--text-muted)]">
            <span>Filtros:</span>
            {activeTableAdvancedFilterLabels.map((item) => (
              <span
                key={item}
                className="rounded-md border border-[var(--border-soft)] bg-[var(--surface)] px-2 py-1 text-[var(--brand-800)]"
              >
                {item}
              </span>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clearTableAdvancedFilters}
              className="rounded-md"
            >
              <X className="size-3.5" />
              Limpiar
            </Button>
          </div>
        ) : null}
      </div>
    </>
  );
}

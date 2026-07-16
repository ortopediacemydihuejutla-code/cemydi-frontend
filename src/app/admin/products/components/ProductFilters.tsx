"use client";

import {
  Boxes,
  EyeOff,
  FileDown,
  FileSearch,
  FileSpreadsheet,
  FileUp,
  TableProperties,
  X,
} from "lucide-react";

import { AdminFilterTabs } from "@/features/admin/components/admin-filter-tabs";
import { AdminSearchField } from "@/features/admin/components/admin-search-field";
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
      <AdminFilterTabs
        tabs={PRODUCT_QUICK_FILTERS.map((tab) => ({
          ...tab,
          count: quickFilterCounts[tab.id],
        }))}
        activeId={quickFilter}
        onChange={setQuickFilter}
      />

      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <AdminSearchField
          value={search}
          onChange={setSearch}
          placeholder="Buscar productos..."
          wrapperClassName="xl:max-w-md xl:shrink-0"
        />

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

"use client";

import { formatNumberEsMx } from "@/features/admin/lib/admin-list-utils";
import { Button } from "@/features/admin/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/features/admin/components/ui/dialog";
import { PRODUCT_CSV_COLUMNS } from "../product-csv";
import { productFieldClassName } from "@/features/admin/lib/product-shared";
import type { ProductsAdminState } from "../hooks/useProducts";
import type { ProductExportFilters, ProductExportOrderOption } from "../product-csv";

type ProductCsvExportProps = {
  state: ProductsAdminState;
};

export function ProductCsvExport({ state }: ProductCsvExportProps) {
  const {
    showProductExportModal,
    setShowProductExportModal,
    filteredProductsForExport,
    products,
    applyTopStockExportPreset,
    applyTopPriceExportPreset,
    productExportFilters,
    updateProductExportFilter,
    exportSupplierOptions,
    selectedProductExportColumns,
    toggleExportColumn,
    resetProductExportFilters,
    setSelectedProductExportColumns,
    exportProductsCsv,
  } = state;

  return (
    <Dialog open={showProductExportModal} onOpenChange={setShowProductExportModal}>
      <DialogContent className="flex max-h-[min(90vh,760px)] w-[min(720px,calc(100vw-1.5rem))] flex-col gap-4 overflow-hidden">
        <DialogHeader>
          <DialogTitle>Exportar productos a CSV</DialogTitle>
          <DialogDescription>
            Filtra, ordena y elige columnas. Tambien puedes exportar todo en formato compatible
            con la importacion.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-[var(--border-soft)] p-3 text-sm">
            <p className="text-[var(--text-muted)]">Productos a exportar</p>
            <p className="text-lg font-semibold">
              {formatNumberEsMx(filteredProductsForExport.length)}
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              de {formatNumberEsMx(products.length)} disponibles
            </p>
          </div>
          <div className="rounded-lg border border-[var(--border-soft)] p-3 text-sm">
            <p className="text-[var(--text-muted)]">Atajos</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-md"
                onClick={applyTopStockExportPreset}
              >
                Mayor stock
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-md"
                onClick={applyTopPriceExportPreset}
              >
                Mayor precio
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1.5 text-sm font-medium">
            <span>Proveedor</span>
            <select
              className={productFieldClassName}
              value={productExportFilters.supplier}
              onChange={(e) => updateProductExportFilter("supplier", e.target.value)}
            >
              <option value="ALL">Todos los proveedores</option>
              {exportSupplierOptions.map((supplier) => (
                <option key={supplier} value={supplier}>
                  {supplier}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1.5 text-sm font-medium">
            <span>Tipo de adquisicion</span>
            <select
              className={productFieldClassName}
              value={productExportFilters.mode}
              onChange={(e) =>
                updateProductExportFilter("mode", e.target.value as ProductExportFilters["mode"])
              }
            >
              <option value="ALL">Todos</option>
              <option value="VENTA">Solo venta</option>
              <option value="RENTA">Solo renta</option>
              <option value="MIXTO">Mixto</option>
            </select>
          </label>
          <label className="grid gap-1.5 text-sm font-medium">
            <span>Receta</span>
            <select
              className={productFieldClassName}
              value={productExportFilters.requiresPrescription}
              onChange={(e) =>
                updateProductExportFilter(
                  "requiresPrescription",
                  e.target.value as ProductExportFilters["requiresPrescription"],
                )
              }
            >
              <option value="ALL">Con y sin receta</option>
              <option value="YES">Solo requieren receta</option>
              <option value="NO">Solo sin receta</option>
            </select>
          </label>
          <label className="grid gap-1.5 text-sm font-medium">
            <span>Estado</span>
            <select
              className={productFieldClassName}
              value={productExportFilters.activeStatus}
              onChange={(e) =>
                updateProductExportFilter(
                  "activeStatus",
                  e.target.value as ProductExportFilters["activeStatus"],
                )
              }
            >
              <option value="ALL">Activos e inactivos</option>
              <option value="ACTIVE">Solo activos</option>
              <option value="INACTIVE">Solo inactivos</option>
            </select>
          </label>
          <label className="grid gap-1.5 text-sm font-medium">
            <span>Limite</span>
            <select
              className={productFieldClassName}
              value={productExportFilters.limit}
              onChange={(e) =>
                updateProductExportFilter("limit", e.target.value as ProductExportFilters["limit"])
              }
            >
              <option value="ALL">Sin limite</option>
              <option value="10">10 productos</option>
              <option value="30">30 productos</option>
              <option value="50">50 productos</option>
              <option value="100">100 productos</option>
            </select>
          </label>
          <label className="grid gap-1.5 text-sm font-medium">
            <span>Orden</span>
            <select
              className={productFieldClassName}
              value={productExportFilters.orderBy}
              onChange={(e) =>
                updateProductExportFilter("orderBy", e.target.value as ProductExportOrderOption)
              }
            >
              <option value="name-asc">Alfabetico A-Z</option>
              <option value="name-desc">Alfabetico Z-A</option>
              <option value="stock-desc">Stock mayor a menor</option>
              <option value="stock-asc">Stock menor a mayor</option>
              <option value="price-desc">Precio mayor a menor</option>
              <option value="price-asc">Precio menor a mayor</option>
              <option value="createdAt-desc">Mas recientes primero</option>
              <option value="createdAt-asc">Mas antiguos primero</option>
            </select>
          </label>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <p className="mb-2 text-sm font-medium">Columnas</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {PRODUCT_CSV_COLUMNS.map((column) => (
              <label
                key={column.key}
                className="flex cursor-pointer items-center gap-2 rounded-md border border-[var(--border-soft)] px-3 py-2 text-sm"
              >
                <input
                  type="checkbox"
                  className="size-4 rounded border-input"
                  checked={selectedProductExportColumns.includes(column.key)}
                  onChange={() => toggleExportColumn(column.key)}
                />
                <span>{column.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-t border-[var(--border-soft)] pt-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-md"
            onClick={resetProductExportFilters}
          >
            Limpiar filtros
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-md"
            onClick={() => setSelectedProductExportColumns([])}
          >
            Limpiar seleccion
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-md"
            onClick={() =>
              setSelectedProductExportColumns(PRODUCT_CSV_COLUMNS.map((c) => c.key))
            }
          >
            Seleccionar todo
          </Button>
          <Button
            type="button"
            size="sm"
            className="ms-auto rounded-md"
            onClick={() =>
              exportProductsCsv(
                PRODUCT_CSV_COLUMNS.map((c) => c.key),
                "productos_cemydi_importacion",
              )
            }
          >
            Exportar todo (importacion)
          </Button>
          <Button
            type="button"
            size="sm"
            className="rounded-md"
            onClick={() =>
              exportProductsCsv(selectedProductExportColumns, "productos_cemydi_columnas")
            }
          >
            Exportar columnas
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

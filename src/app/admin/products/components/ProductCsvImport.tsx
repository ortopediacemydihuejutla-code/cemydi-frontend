"use client";

import { formatNumberEsMx } from "@/features/admin/lib/admin-list-utils";
import { Badge } from "@/features/admin/components/ui/badge";
import { Button } from "@/features/admin/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/features/admin/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/features/admin/components/ui/table";
import { getProductImportRowStatus } from "../product-csv";
import type { ProductsAdminState } from "../hooks/useProducts";

type ProductCsvImportProps = {
  state: ProductsAdminState;
};

export function ProductCsvImport({ state }: ProductCsvImportProps) {
  const {
    productImportPreview,
    closeProductImportModal,
    productImportSummary,
    existingImportRowLineNumbers,
    allExistingImportRowsSelected,
    toggleAllExistingImportRows,
    importingProductsFromCsv,
    removeSelectedExistingImportRows,
    selectedExistingImportRows,
    selectedExistingImportRowSet,
    toggleExistingImportRowSelection,
    importProductsFromCsv,
  } = state;

  return (
    <Dialog
      open={productImportPreview !== null}
      onOpenChange={(open) => {
        if (!open) closeProductImportModal();
      }}
    >
      <DialogContent className="flex max-h-[min(90vh,720px)] w-[min(920px,calc(100vw-1.5rem))] flex-col gap-4">
        <DialogHeader>
          <DialogTitle>Previsualizacion de importacion</DialogTitle>
          <DialogDescription>
            Archivo:{" "}
            <strong className="text-foreground">{productImportPreview?.fileName}</strong>
          </DialogDescription>
        </DialogHeader>

        {productImportPreview ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-[var(--border-soft)] p-3 text-sm">
                <p className="text-[var(--text-muted)]">Total de filas</p>
                <p className="text-lg font-semibold">
                  {formatNumberEsMx(productImportSummary.total)}
                </p>
              </div>
              <div className="rounded-lg border border-[var(--border-soft)] p-3 text-sm">
                <p className="text-[var(--text-muted)]">Validas para importar</p>
                <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                  {formatNumberEsMx(productImportSummary.validRows.length)}
                </p>
              </div>
              <div className="rounded-lg border border-[var(--border-soft)] p-3 text-sm">
                <p className="text-[var(--text-muted)]">Con errores</p>
                <p className="text-lg font-semibold">
                  {formatNumberEsMx(productImportSummary.invalidCount)}
                </p>
              </div>
              <div className="rounded-lg border border-[var(--border-soft)] p-3 text-sm">
                <p className="text-[var(--text-muted)]">Modelos repetidos</p>
                <p className="text-lg font-semibold">
                  {formatNumberEsMx(
                    productImportSummary.duplicateExistingCount +
                      productImportSummary.duplicateInFileCount,
                  )}
                </p>
              </div>
            </div>

            {productImportSummary.duplicateExistingModels.length > 0 ? (
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Modelos ya existentes:{" "}
                {productImportSummary.duplicateExistingModels.slice(0, 8).join(", ")}
                {productImportSummary.duplicateExistingModels.length > 8 ? ", ..." : ""}
              </p>
            ) : null}

            {productImportSummary.duplicateInFileModels.length > 0 ? (
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Modelos repetidos dentro del CSV:{" "}
                {productImportSummary.duplicateInFileModels.slice(0, 8).join(", ")}
                {productImportSummary.duplicateInFileModels.length > 8 ? ", ..." : ""}
              </p>
            ) : null}

            {existingImportRowLineNumbers.length > 0 ? (
              <div className="flex flex-col gap-2 rounded-lg border border-[var(--border-soft)] p-3 text-sm">
                <p className="text-[var(--text-muted)]">
                  Los productos ya existentes estan resaltados. Puedes seleccionarlos y quitarlos
                  de la vista previa.
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      className="size-4 rounded border-input"
                      checked={allExistingImportRowsSelected}
                      onChange={toggleAllExistingImportRows}
                      disabled={importingProductsFromCsv}
                    />
                    <span>
                      Seleccionar existentes (
                      {formatNumberEsMx(existingImportRowLineNumbers.length)})
                    </span>
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-md"
                    onClick={removeSelectedExistingImportRows}
                    disabled={
                      importingProductsFromCsv || selectedExistingImportRows.length === 0
                    }
                  >
                    Quitar seleccionados ({formatNumberEsMx(selectedExistingImportRows.length)})
                  </Button>
                </div>
              </div>
            ) : null}

            <div className="min-h-0 flex-1 overflow-auto rounded-md border border-[var(--border-soft)]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">Sel.</TableHead>
                    <TableHead>Linea</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Modelo</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productImportPreview.rows.slice(0, 40).map((row) => {
                    const status = getProductImportRowStatus(row);
                    const isExistingSelected = selectedExistingImportRowSet.has(row.lineNumber);
                    const badgeVariant =
                      status.tone === "ready"
                        ? ("emerald" as const)
                        : status.tone === "existing"
                          ? ("amber" as const)
                          : ("red" as const);

                    return (
                      <TableRow
                        key={`${row.lineNumber}-${row.modelo}`}
                        className={
                          row.duplicateExistingModel
                            ? isExistingSelected
                              ? "bg-amber-500/15"
                              : "bg-muted/50"
                            : undefined
                        }
                      >
                        <TableCell>
                          {row.duplicateExistingModel ? (
                            <input
                              type="checkbox"
                              className="size-4 rounded border-input"
                              checked={isExistingSelected}
                              onChange={() => toggleExistingImportRowSelection(row.lineNumber)}
                              disabled={importingProductsFromCsv}
                              aria-label={`Seleccionar linea ${row.lineNumber}`}
                            />
                          ) : null}
                        </TableCell>
                        <TableCell>{row.lineNumber}</TableCell>
                        <TableCell>{row.nombre}</TableCell>
                        <TableCell>{row.modelo}</TableCell>
                        <TableCell>{row.precioRaw}</TableCell>
                        <TableCell>{row.stockRaw}</TableCell>
                        <TableCell>
                          <Badge variant={badgeVariant} className="max-w-[220px] truncate">
                            {status.label}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            <div className="flex flex-wrap justify-end gap-2 border-t border-[var(--border-soft)] pt-4">
              <Button
                type="button"
                variant="outline"
                className="rounded-md"
                onClick={closeProductImportModal}
                disabled={importingProductsFromCsv}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                className="rounded-md"
                onClick={() => void importProductsFromCsv()}
                disabled={
                  importingProductsFromCsv || productImportSummary.validRows.length === 0
                }
              >
                {importingProductsFromCsv
                  ? "Importando..."
                  : `Importar ${productImportSummary.validRows.length} productos`}
              </Button>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

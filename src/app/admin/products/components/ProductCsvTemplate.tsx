"use client";

import { formatNumberEsMx } from "@/features/admin/lib/admin-list-utils";
import { Button } from "@/features/admin/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/features/admin/components/ui/card";
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
import {
  PRODUCT_CSV_COLUMNS,
  PRODUCT_CSV_REQUIRED_COLUMN_KEYS,
} from "../product-csv";
import type { ProductsAdminState } from "../hooks/useProducts";

type ProductCsvTemplateProps = {
  state: ProductsAdminState;
};

export function ProductCsvTemplate({ state }: ProductCsvTemplateProps) {
  const {
    showProductTemplateModal,
    closeProductTemplateModal,
    generateGenericProductTemplate,
    selectedProductTemplateColumns,
    toggleTemplateColumn,
    resetCustomTemplateColumns,
    selectAllTemplateColumns,
    generateCustomProductTemplate,
    productTemplatePreview,
    setProductTemplatePreview,
    downloadProductTemplate,
  } = state;

  return (
    <Dialog
      open={showProductTemplateModal}
      onOpenChange={(open) => {
        if (!open) closeProductTemplateModal();
      }}
    >
      <DialogContent className="flex max-h-[min(90vh,800px)] w-[min(720px,calc(100vw-1.5rem))] flex-col gap-4">
        <DialogHeader>
          <DialogTitle>Plantilla CSV de productos</DialogTitle>
          <DialogDescription>
            Genera una plantilla generica o personalizada con los encabezados listos para llenar e
            importar.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="gap-2">
              <CardTitle className="text-base">Plantilla generica</CardTitle>
              <p className="text-sm text-[var(--text-muted)]">
                Todas las columnas compatibles con la importacion actual.
              </p>
            </CardHeader>
            <CardFooter>
              <Button
                type="button"
                className="w-full rounded-md"
                onClick={generateGenericProductTemplate}
              >
                Generar plantilla generica
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="gap-2">
              <CardTitle className="text-base">Plantilla personalizada</CardTitle>
              <p className="text-sm text-[var(--text-muted)]">
                Las columnas obligatorias no se pueden quitar.
              </p>
            </CardHeader>
            <CardContent className="grid max-h-48 gap-2 overflow-y-auto">
              {PRODUCT_CSV_COLUMNS.map((column) => {
                const isRequired = PRODUCT_CSV_REQUIRED_COLUMN_KEYS.includes(column.key);
                return (
                  <label
                    key={column.key}
                    className="flex cursor-pointer items-center gap-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      className="size-4 rounded border-input"
                      checked={selectedProductTemplateColumns.includes(column.key)}
                      onChange={() => toggleTemplateColumn(column.key)}
                      disabled={isRequired}
                    />
                    <span>
                      {column.label}
                      {isRequired ? (
                        <span className="text-[var(--text-muted)]"> (obligatorio)</span>
                      ) : null}
                    </span>
                  </label>
                );
              })}
            </CardContent>
            <CardFooter className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-md"
                onClick={resetCustomTemplateColumns}
              >
                Solo obligatorios
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-md"
                onClick={selectAllTemplateColumns}
              >
                Seleccionar todo
              </Button>
              <Button
                type="button"
                size="sm"
                className="rounded-md"
                onClick={generateCustomProductTemplate}
              >
                Generar personalizada
              </Button>
            </CardFooter>
          </Card>
        </div>

        {productTemplatePreview ? (
          <div className="flex min-h-0 flex-1 flex-col gap-3 rounded-lg border border-[var(--border-soft)] p-3">
            <p className="text-sm font-medium">
              Vista previa:{" "}
              {productTemplatePreview.variant === "generic" ? "Generica" : "Personalizada"} (
              {formatNumberEsMx(productTemplatePreview.columns.length)} columnas)
            </p>
            <div className="min-h-0 flex-1 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {productTemplatePreview.columns.map((column) => (
                      <TableHead key={column}>{column}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productTemplatePreview.sampleRows.map((row, index) => (
                    <TableRow key={`template-${index + 1}`}>
                      {productTemplatePreview.columns.map((column) => (
                        <TableCell key={column}>{row[column]}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-md"
                onClick={() => setProductTemplatePreview(null)}
              >
                Limpiar vista previa
              </Button>
              <Button
                type="button"
                className="rounded-md"
                onClick={() => downloadProductTemplate(productTemplatePreview)}
              >
                Descargar CSV
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

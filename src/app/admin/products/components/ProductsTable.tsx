"use client";

import Image from "next/image";
import Link from "next/link";
import { MoreHorizontal, PackagePlus, PencilLine, ShieldCheck, Trash2 } from "lucide-react";

import type { AdminProduct } from "@/services/admin";

import { AdminTableSortHeader } from "@/features/admin/components/admin-table-sort-header";
import { AdminTableSkeleton } from "@/features/admin/components/admin-content-skeletons";
import { Badge } from "@/features/admin/components/ui/badge";
import { Button } from "@/features/admin/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/features/admin/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/features/admin/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/features/admin/components/ui/tooltip";
import {
  formatCurrency,
  formatDate,
  getModeLabel,
  getRecipeBadgeVariant,
  getStatusLabel,
  getStockBadgeVariant,
} from "../utils/product-formatters";
import type { ProductsAdminState } from "../hooks/useProducts";
import { PRODUCT_COLUMN_LABELS, type ProductColumnId } from "../utils/product-types";

type ProductsTableProps = {
  state: ProductsAdminState;
  loading?: boolean;
};

function renderProductTableCell(
  columnId: ProductColumnId,
  product: AdminProduct,
  openImageDialog: (product: AdminProduct, index?: number) => void,
) {
  switch (columnId) {
    case "detalle":
      return (
        <div className="flex items-center gap-3">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden bg-[var(--surface)]">
            {product.imageUrl ? (
              <button
                type="button"
                className="relative block h-full w-full cursor-zoom-in"
                onClick={() => openImageDialog(product)}
                aria-label={`Ver imágenes de ${product.nombre}`}
              >
                <Image
                  src={product.imageUrl}
                  alt={product.nombre}
                  fill
                  sizes="56px"
                  className="object-cover"
                  loading="lazy"
                />
              </button>
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[var(--surface)]">
                <span className="text-[10px] font-semibold uppercase text-[var(--text-muted)]">
                  Sin foto
                </span>
              </div>
            )}
          </div>
          <div className="grid gap-1">
            <p className="font-semibold text-[var(--text-main)]">{product.nombre}</p>
            <p className="text-sm text-[var(--text-muted)]">
              {product.marca} - {product.modelo}
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Badge variant={getRecipeBadgeVariant(product.requiereReceta)}>
                {product.requiereReceta ? "Con receta" : "Libre"}
              </Badge>
            </div>
          </div>
        </div>
      );
    case "clasificacion":
      return <span className="text-[var(--text-main)]">{product.clasificacion}</span>;
    case "proveedor":
      return <span className="text-[var(--text-main)]">{product.proveedor}</span>;
    case "precio":
      return formatCurrency(product.precio);
    case "stock":
      return (
        <Badge variant={getStockBadgeVariant(product.stock)}>{product.stock} unidades</Badge>
      );
    case "modo":
      return getModeLabel(product.tipoAdquisicion);
    case "estado":
      return (
        <Badge variant={product.activo ? "emerald" : "slate"}>
          {getStatusLabel(product.activo)}
        </Badge>
      );
    case "alta":
      return (
        <span className="text-sm text-[var(--text-muted)]">
          {formatDate(product.createdAt)}
        </span>
      );
    default:
      return null;
  }
}

export function ProductsTable({ state, loading = false }: ProductsTableProps) {
  const {
    products,
    filteredProducts,
    paginatedProducts,
    visibleOrderedProductColumns,
    productTableMinWidth,
    productTableColPercents,
    sortState,
    handleProductSortChange,
    openImageDialog,
    handleToggleActive,
    saving,
    requestDeleteProduct,
  } = state;

  if (loading) {
    return (
      <AdminTableSkeleton
        columns={Math.max(2, visibleOrderedProductColumns.length + 1)}
        rows={7}
        showAvatar
        className="my-2"
      />
    );
  }

  if (filteredProducts.length === 0) {
    return (
      <div className="grid min-h-72 place-items-center px-6 py-10 text-center">
        <div className="max-w-md">
          <h2 className="text-xl font-semibold text-[var(--brand-900)]">
            No encontramos productos
          </h2>
          <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
            {products.length === 0
              ? "Todavia no has creado productos. Usa el boton superior para abrir la pagina de alta."
              : "Prueba otro tab, quita filtros, ajusta la busqueda o crea un producto nuevo."}
          </p>
          <Button asChild className="mt-4 rounded-md">
            <Link href="/admin/products/new">
              <PackagePlus className="size-4" />
              Ir a crear producto
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 overflow-x-auto">
      <Table
        className="min-w-0"
        style={{
          width: "100%",
          minWidth: `${productTableMinWidth}px`,
        }}
      >
        <colgroup>
          {productTableColPercents.columns.map(({ id, percent }) => (
            <col key={id} style={{ width: percent }} />
          ))}
          <col style={{ width: productTableColPercents.action }} />
        </colgroup>
        <TableHeader>
          <TableRow className="border-b border-[color-mix(in_srgb,var(--brand-700)_24%,var(--border-soft))] bg-[color-mix(in_srgb,var(--brand-700)_18%,var(--surface))] hover:bg-[color-mix(in_srgb,var(--brand-700)_18%,var(--surface))]">
            {visibleOrderedProductColumns.map((columnId) => (
              <TableHead key={columnId} className="whitespace-nowrap text-[var(--brand-900)]">
                <AdminTableSortHeader
                  column={columnId}
                  activeColumn={sortState.column}
                  direction={sortState.direction}
                  onSort={handleProductSortChange}
                  className="min-h-0 transition hover:bg-[color-mix(in_srgb,var(--brand-700)_14%,var(--card))] hover:text-[var(--brand-700)]"
                >
                  {PRODUCT_COLUMN_LABELS[columnId]}
                </AdminTableSortHeader>
              </TableHead>
            ))}
            <TableHead className="w-[88px] whitespace-nowrap text-right text-[var(--brand-900)]">
              Acciones
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {paginatedProducts.map((product) => (
            <TableRow key={product.id}>
              {visibleOrderedProductColumns.map((columnId) => (
                <TableCell key={columnId}>
                  {renderProductTableCell(columnId, product, openImageDialog)}
                </TableCell>
              ))}
              <TableCell className="text-right">
                <DropdownMenu>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="rounded-md text-[var(--text-muted)] hover:bg-[var(--surface)] hover:text-[var(--brand-800)]"
                          aria-label={`Acciones para ${product.nombre}`}
                        >
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent sideOffset={6}>Acciones</TooltipContent>
                  </Tooltip>

                  <DropdownMenuContent
                    align="end"
                    className="w-52 rounded-lg border-[var(--border-soft)] bg-[var(--card)] p-1.5 shadow-[var(--shadow-md)]"
                  >
                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={`/admin/products/${product.id}/edit`}>
                        <PencilLine className="size-4" />
                        Editar producto
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => void handleToggleActive(product)}
                      disabled={saving}
                    >
                      <ShieldCheck className="size-4" />
                      {product.activo ? "Desactivar" : "Activar"}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      disabled={saving}
                      onSelect={() => requestDeleteProduct(product)}
                    >
                      <Trash2 className="size-4" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

"use client";

import Link from "next/link";
import { PackagePlus } from "lucide-react";

import { AdminTablePagination } from "@/features/admin/components/admin-table-pagination";
import { PageHeader } from "@/features/admin/components/page-header";
import { useAdminRouteGate } from "@/features/admin/hooks/use-admin-route-gate";
import { Button } from "@/features/admin/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/features/admin/components/ui/card";
import { ProductCsvExport } from "./components/ProductCsvExport";
import { ProductCsvImport } from "./components/ProductCsvImport";
import { ProductCsvTemplate } from "./components/ProductCsvTemplate";
import { ProductDeleteDialog } from "./components/ProductDeleteDialog";
import { ProductFilters } from "./components/ProductFilters";
import { ProductsImageDialog } from "./components/ProductsImageDialog";
import { ProductsMetrics } from "./components/ProductsMetrics";
import { ProductsTable } from "./components/ProductsTable";
import { useProducts } from "./hooks/useProducts";

export default function AdminProductsPage() {
  const { user } = useAdminRouteGate();
  const state = useProducts(user);

  const {
    page,
    setPage,
    resultStart,
    resultEnd,
    sortedProducts,
    totalPages,
  } = state;

  return (
    <>
      <PageHeader
        title="Productos"
        subtitle="Gestiona el inventario: busca, filtra, edita precios y existencias, e importa o exporta listados en CSV."
      />

      <ProductsMetrics state={state} loading={state.initialLoading} />

      <Card className="w-full min-w-0 max-w-full rounded-xl border-[var(--border-soft)] shadow-sm">
        <CardHeader className="min-w-0 gap-5 border-b border-[var(--border-soft)] bg-[var(--card)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <CardTitle>Todos los productos</CardTitle>
              <p className="mt-2 text-sm text-[var(--text-muted)]">
                Usa los tabs, los filtros y la búsqueda para acotar el listado.
              </p>
            </div>
            <Button asChild className="h-11 shrink-0 rounded-md px-4 shadow-none sm:mt-0">
              <Link href="/admin/products/new">
                <PackagePlus className="size-4" />
                Nuevo producto
              </Link>
            </Button>
          </div>

          <ProductFilters state={state} />
        </CardHeader>

        <CardContent className="w-full min-w-0 max-w-full pb-2">
          <ProductsTable state={state} loading={state.initialLoading} />
        </CardContent>

        <CardFooter className="flex-col gap-4 border-t border-[var(--border-soft)] bg-[var(--card)] md:flex-row md:items-center md:justify-between">
          <AdminTablePagination
            resultStart={resultStart}
            resultEnd={resultEnd}
            totalCount={sortedProducts.length}
            page={page}
            totalPages={totalPages}
            onPrev={() => setPage((current) => Math.max(1, current - 1))}
            onNext={() => setPage((current) => Math.min(totalPages, current + 1))}
          />
        </CardFooter>
      </Card>

      <ProductCsvImport state={state} />
      <ProductCsvExport state={state} />
      <ProductCsvTemplate state={state} />
      <ProductsImageDialog state={state} />
      <ProductDeleteDialog state={state} />
    </>
  );
}

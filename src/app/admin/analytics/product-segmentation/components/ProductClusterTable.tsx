"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import {
  productClusterDefinitions,
  type ProductCluster,
  type ProductClusterCode,
} from "@/data/product-clusters";
import { Badge } from "@/features/admin/components/ui/badge";
import { Input } from "@/features/admin/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/features/admin/components/ui/table";

const currencyFormatter = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

const acquisitionLabels: Record<ProductCluster["acquisitionType"], string> = {
  VENTA: "Venta",
  RENTA: "Renta",
  VENTA_RENTA: "Venta y renta",
};

const clusterBadgeVariants: Record<
  ProductClusterCode,
  "blue" | "violet" | "emerald" | "amber"
> = {
  C1: "blue",
  C2: "violet",
  C3: "emerald",
  C4: "amber",
};

export function ProductClusterTable({ products }: { products: ProductCluster[] }) {
  const [search, setSearch] = useState("");
  const [cluster, setCluster] = useState<ProductClusterCode | "ALL">("ALL");

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("es-MX");

    return products.filter((product) => {
      const matchesCluster = cluster === "ALL" || product.cluster === cluster;
      const matchesSearch =
        normalizedSearch.length === 0 ||
        product.productName.toLocaleLowerCase("es-MX").includes(normalizedSearch);

      return matchesCluster && matchesSearch;
    });
  }, [cluster, products, search]);

  return (
    <section
      aria-labelledby="cluster-products-title"
      className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
    >
      <div className="flex flex-col gap-4 border-b border-border px-4 py-5 sm:px-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 id="cluster-products-title" className="text-lg font-semibold text-foreground">
            Productos segmentados
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {filteredProducts.length} de {products.length} productos
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
          <label className="relative block min-w-0 sm:w-72">
            <span className="sr-only">Buscar por nombre de producto</span>
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar producto"
              className="pl-9"
            />
          </label>

          <label className="block sm:w-52">
            <span className="sr-only">Filtrar por segmento</span>
            <select
              value={cluster}
              onChange={(event) =>
                setCluster(event.target.value as ProductClusterCode | "ALL")
              }
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <option value="ALL">Todos los segmentos</option>
              {(Object.keys(productClusterDefinitions) as ProductClusterCode[]).map((code) => (
                <option key={code} value={code}>
                  {code} · {productClusterDefinitions[code].name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <Table className="min-w-[1320px]">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="min-w-64">Producto</TableHead>
            <TableHead>Precio</TableHead>
            <TableHead className="text-center">Stock</TableHead>
            <TableHead>Adquisición</TableHead>
            <TableHead className="text-right">Vendidos</TableHead>
            <TableHead className="text-right">Rentados</TableHead>
            <TableHead className="text-right">Interacciones</TableHead>
            <TableHead className="text-right">Ingresos</TableHead>
            <TableHead>Segmento</TableHead>
            <TableHead className="min-w-64">Acción sugerida</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium text-foreground">
                  {product.productName}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {currencyFormatter.format(product.price)}
                </TableCell>
                <TableCell className="text-center font-medium">{product.stock}</TableCell>
                <TableCell className="whitespace-nowrap">
                  {acquisitionLabels[product.acquisitionType]}
                </TableCell>
                <TableCell className="text-right tabular-nums">{product.soldQuantity}</TableCell>
                <TableCell className="text-right tabular-nums">{product.rentedQuantity}</TableCell>
                <TableCell className="text-right tabular-nums">{product.viewCount}</TableCell>
                <TableCell className="whitespace-nowrap text-right font-medium tabular-nums">
                  {currencyFormatter.format(product.generatedRevenue)}
                </TableCell>
                <TableCell>
                  <Badge variant={clusterBadgeVariants[product.cluster]}>
                    {product.cluster}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm leading-relaxed text-muted-foreground">
                  {productClusterDefinitions[product.cluster].action}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={10} className="h-32 text-center text-muted-foreground">
                No se encontraron productos con los filtros seleccionados.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </section>
  );
}

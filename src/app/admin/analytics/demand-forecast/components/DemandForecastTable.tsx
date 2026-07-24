"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, RotateCcw, Search } from "lucide-react";

import {
  type DemandForecast,
  type DemandForecastStatus,
  getDemandDifference,
  getDemandStatus,
} from "@/data/demand-forecast";
import { Button } from "@/features/admin/components/ui/button";
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
import { formatCurrencyMx } from "@/lib/formatters";

type PromotionFilter = "ALL" | "ACTIVE" | "INACTIVE";
type SortOption =
  "DEMAND_DESC" | "DEMAND_ASC" | "DIFFERENCE_DESC" | "DIFFERENCE_ASC";

const statusOptions: DemandForecastStatus[] = [
  "Stock suficiente",
  "Revisar inventario",
  "Posible faltante",
  "Alta demanda",
];

const statusBadgeVariants: Record<
  DemandForecastStatus,
  "emerald" | "slate" | "amber" | "red"
> = {
  "Stock suficiente": "emerald",
  "Revisar inventario": "slate",
  "Posible faltante": "amber",
  "Alta demanda": "red",
};

const selectClassName =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

export function DemandForecastTable({
  forecasts,
}: {
  forecasts: DemandForecast[];
}) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<DemandForecastStatus | "ALL">("ALL");
  const [promotion, setPromotion] = useState<PromotionFilter>("ALL");
  const [sort, setSort] = useState<SortOption>("DEMAND_DESC");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const visibleForecasts = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("es-MX");

    const filtered = forecasts.filter((forecast) => {
      const forecastStatus = getDemandStatus(
        forecast.currentStock,
        forecast.predictedDemand,
      );
      const matchesSearch =
        normalizedSearch.length === 0 ||
        forecast.productName
          .toLocaleLowerCase("es-MX")
          .includes(normalizedSearch);
      const matchesStatus = status === "ALL" || forecastStatus === status;
      const matchesPromotion =
        promotion === "ALL" ||
        (promotion === "ACTIVE" && forecast.activePromotion) ||
        (promotion === "INACTIVE" && !forecast.activePromotion);

      return matchesSearch && matchesStatus && matchesPromotion;
    });

    return [...filtered].sort((left, right) => {
      if (sort === "DEMAND_ASC") {
        return left.predictedDemand - right.predictedDemand;
      }
      if (sort === "DIFFERENCE_DESC") {
        return getDemandDifference(right) - getDemandDifference(left);
      }
      if (sort === "DIFFERENCE_ASC") {
        return getDemandDifference(left) - getDemandDifference(right);
      }
      return right.predictedDemand - left.predictedDemand;
    });
  }, [forecasts, promotion, search, sort, status]);

  const totalPages = Math.max(1, Math.ceil(visibleForecasts.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedForecasts = visibleForecasts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const resetFilters = () => {
    setSearch("");
    setStatus("ALL");
    setPromotion("ALL");
    setSort("DEMAND_DESC");
    setPage(1);
  };

  return (
    <section
      aria-labelledby="forecast-products-title"
      className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
    >
      <div className="border-b border-border px-4 py-5 sm:px-6">
        <div>
          <h2
            id="forecast-products-title"
            className="text-lg font-semibold text-foreground"
          >
            Predicción por producto
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {visibleForecasts.length} de {forecasts.length} productos
          </p>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(220px,1fr)_210px_190px_240px_auto]">
          <label className="relative block min-w-0">
            <span className="sr-only">Buscar por nombre de producto</span>
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Buscar producto"
              className="pl-9"
            />
          </label>

          <label className="block">
            <span className="sr-only">Filtrar por estado</span>
            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as DemandForecastStatus | "ALL");
                setPage(1);
              }}
              className={selectClassName}
            >
              <option value="ALL">Todos los estados</option>
              {statusOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="sr-only">Filtrar por promoción</span>
            <select
              value={promotion}
              onChange={(event) => {
                setPromotion(event.target.value as PromotionFilter);
                setPage(1);
              }}
              className={selectClassName}
            >
              <option value="ALL">Todas las promociones</option>
              <option value="ACTIVE">Promoción activa</option>
              <option value="INACTIVE">Sin promoción</option>
            </select>
          </label>

          <label className="block">
            <span className="sr-only">Ordenar resultados</span>
            <select
              value={sort}
              onChange={(event) => {
                setSort(event.target.value as SortOption);
                setPage(1);
              }}
              className={selectClassName}
            >
              <option value="DEMAND_DESC">Mayor demanda estimada</option>
              <option value="DEMAND_ASC">Menor demanda estimada</option>
              <option value="DIFFERENCE_DESC">Mayor diferencia</option>
              <option value="DIFFERENCE_ASC">Menor diferencia</option>
            </select>
          </label>

          <Button type="button" variant="outline" onClick={resetFilters}>
            <RotateCcw className="size-4" aria-hidden="true" />
            Restablecer
          </Button>
        </div>
      </div>

      <Table className="min-w-[1640px]">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="min-w-64">Producto</TableHead>
            <TableHead>Precio</TableHead>
            <TableHead className="text-center">Stock actual</TableHead>
            <TableHead className="text-right">Ventas anteriores</TableHead>
            <TableHead className="text-right">Rentas anteriores</TableHead>
            <TableHead className="text-right">Vistas anteriores</TableHead>
            <TableHead>Promoción</TableHead>
            <TableHead className="text-right">Demanda estimada</TableHead>
            <TableHead className="text-right">Diferencia</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="min-w-72">Acción sugerida</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visibleForecasts.length > 0 ? (
            paginatedForecasts.map((forecast) => {
              const difference = getDemandDifference(forecast);
              const forecastStatus = getDemandStatus(
                forecast.currentStock,
                forecast.predictedDemand,
              );

              return (
                <TableRow key={forecast.id}>
                  <TableCell className="font-medium text-foreground">
                    {forecast.productName}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {formatCurrencyMx(forecast.price, { fractionDigits: 0 })}
                  </TableCell>
                  <TableCell className="text-center font-medium tabular-nums">
                    {forecast.currentStock}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {forecast.previousMonthSales}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {forecast.previousMonthRentals}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {forecast.previousMonthViews}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={forecast.activePromotion ? "blue" : "slate"}
                    >
                      {forecast.activePromotion ? "Activa" : "Sin promoción"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold tabular-nums text-foreground">
                    {forecast.predictedDemand}
                  </TableCell>
                  <TableCell
                    className={`text-right font-semibold tabular-nums ${
                      difference > 0
                        ? "text-amber-700 dark:text-amber-200"
                        : difference < 0
                          ? "text-emerald-700 dark:text-emerald-200"
                          : "text-muted-foreground"
                    }`}
                  >
                    {difference > 0 ? "+" : ""}
                    {difference}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusBadgeVariants[forecastStatus]}>
                      {forecastStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm leading-relaxed text-muted-foreground">
                    {forecast.recommendation}
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow className="hover:bg-transparent">
              <TableCell
                colSpan={11}
                className="h-32 text-center text-muted-foreground"
              >
                No se encontraron productos con los filtros seleccionados.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {visibleForecasts.length > 0 ? (
        <div className="flex flex-col gap-3 border-t border-border px-4 py-4 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <span>Filas por página</span>
            <select
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                setPage(1);
              }}
              className="h-8 rounded-md border border-input bg-background px-2 text-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              aria-label="Filas por página"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span>
              {Math.min(
                (currentPage - 1) * pageSize + 1,
                visibleForecasts.length,
              )}
              –{Math.min(currentPage * pageSize, visibleForecasts.length)} de{" "}
              {visibleForecasts.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="mr-1 text-muted-foreground">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              disabled={currentPage === 1}
              aria-label="Página anterior"
            >
              <ChevronLeft aria-hidden="true" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              onClick={() =>
                setPage((value) => Math.min(totalPages, value + 1))
              }
              disabled={currentPage === totalPages}
              aria-label="Página siguiente"
            >
              <ChevronRight aria-hidden="true" />
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

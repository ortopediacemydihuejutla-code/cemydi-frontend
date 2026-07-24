"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
  Sparkles,
  UsersRound,
} from "lucide-react";
import {
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";

import { PageHeader } from "@/features/admin/components/page-header";
import { Badge } from "@/features/admin/components/ui/badge";
import { Button } from "@/features/admin/components/ui/button";
import { Input } from "@/features/admin/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/features/admin/components/ui/table";
import { getCustomerSegmentation } from "@/services/admin/analytics";
import type {
  CustomerClusterCode,
  CustomerSegmentationData,
} from "@/services/admin/types";

const badgeByCluster: Record<
  CustomerClusterCode,
  "blue" | "violet" | "emerald" | "amber"
> = { C1: "blue", C2: "violet", C3: "emerald", C4: "amber" };

const currency = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

export function ProductSegmentationView() {
  const [data, setData] = useState<CustomerSegmentationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [cluster, setCluster] = useState<CustomerClusterCode | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setData(await getCustomerSegmentation());
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "No fue posible cargar la segmentación.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const definitions = useMemo(
    () => new Map(data?.clusters.map((item) => [item.code, item]) ?? []),
    [data],
  );
  const filtered = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("es-MX");
    return (data?.customers ?? []).filter(
      (customer) =>
        (cluster === "ALL" || customer.cluster === cluster) &&
        (!term ||
          customer.name.toLocaleLowerCase("es-MX").includes(term) ||
          customer.email.toLocaleLowerCase("es-MX").includes(term)),
    );
  }, [cluster, data, search]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedCustomers = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  if (loading) {
    return (
      <div className="flex flex-col gap-8 pb-12">
        <PageHeader
          title="Segmentación de clientes"
          subtitle="Analizando el comportamiento real de clientes…"
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-48 animate-pulse rounded-2xl border border-border bg-card"
            />
          ))}
        </div>
        <div className="h-[420px] animate-pulse rounded-2xl border border-border bg-card" />
      </div>
    );
  }

  if (!data || error) {
    return (
      <div className="flex flex-col gap-8 pb-12">
        <PageHeader
          title="Segmentación de clientes"
          subtitle="Agrupación basada en compras, rentas y consultas."
        />
        <section className="rounded-2xl border border-red-500/20 bg-card p-8 text-center">
          <p className="font-medium text-foreground">
            No se pudo generar la segmentación.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          <Button className="mt-5" onClick={() => void load()}>
            <RefreshCw />
            Reintentar
          </Button>
        </section>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-12">
      <PageHeader
        title="Segmentación de clientes"
        subtitle="Grupos calculados con compras, rentas, consultas, categorías de interés y gasto real."
      >
        <Button variant="outline" onClick={() => void load()}>
          <RefreshCw />
          Actualizar análisis
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.clusters.map((item) => (
          <article
            key={item.code}
            className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm"
          >
            <div
              className="absolute inset-x-0 top-0 h-1"
              style={{ backgroundColor: item.color }}
            />
            <div className="flex items-start justify-between gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <UsersRound className="size-5" aria-hidden />
              </span>
              <Badge variant={badgeByCluster[item.code]}>{item.code}</Badge>
            </div>
            <p className="mt-5 text-3xl font-semibold tracking-tight text-foreground">
              {item.count}
            </p>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {item.percentage}% de clientes
            </p>
            <h2 className="mt-3 font-semibold text-foreground">{item.name}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {item.description}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2 border-t border-border pt-4 text-xs">
              <span>
                <strong className="block text-foreground">
                  {item.averages.sales}
                </strong>{" "}
                compras prom.
              </span>
              <span>
                <strong className="block text-foreground">
                  {currency.format(item.averages.spend)}
                </strong>{" "}
                gasto prom.
              </span>
            </div>
          </article>
        ))}
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-12">
        <section className="min-w-0 rounded-2xl border border-border bg-card p-5 shadow-sm xl:col-span-8 sm:p-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Mapa de comportamiento
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Cada punto es un cliente; compara actividad con valor comercial.
            </p>
          </div>
          <div className="mt-6 h-[360px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart
                margin={{ top: 10, right: 12, bottom: 12, left: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  type="number"
                  dataKey="engagementScore"
                  name="Actividad"
                  unit="%"
                  domain={[0, 100]}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                />
                <YAxis
                  type="number"
                  dataKey="valueScore"
                  name="Valor"
                  unit="%"
                  domain={[0, 100]}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                />
                <ZAxis
                  type="number"
                  dataKey="consultations"
                  range={[24, 180]}
                />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  formatter={(value, name) => [
                    `${Number(value ?? 0)}`,
                    String(name),
                  ]}
                />
                <Legend />
                {data.clusters.map((item) => (
                  <Scatter
                    key={item.code}
                    name={item.name}
                    data={data.customers.filter(
                      (customer) => customer.cluster === item.code,
                    )}
                    fill={item.color}
                    fillOpacity={0.72}
                  />
                ))}
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="min-w-0 rounded-2xl border border-border bg-card p-5 shadow-sm xl:col-span-4 sm:p-6">
          <h2 className="text-lg font-semibold text-foreground">
            Distribución de clientes
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Resultado del modelo sobre {data.sourceRows.toLocaleString("es-MX")}{" "}
            registros.
          </p>
          <div className="mt-5 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.clusters}
                  dataKey="count"
                  nameKey="name"
                  innerRadius={64}
                  outerRadius={98}
                  paddingAngle={3}
                >
                  {data.clusters.map((item) => (
                    <Cell key={item.code} fill={item.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [
                    `${Number(value ?? 0)} clientes`,
                    "Total",
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <p className="rounded-xl bg-muted/60 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
            Modelo:{" "}
            <span className="font-medium text-foreground">{data.method}</span>
          </p>
        </section>
      </div>

      <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex flex-col gap-4 border-b border-border px-4 py-5 sm:px-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Clientes segmentados
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {filtered.length} de {data.customers.length} clientes
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="relative block sm:w-72">
              <span className="sr-only">Buscar cliente</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Buscar nombre o correo"
                className="pl-9"
              />
            </label>
            <select
              value={cluster}
              onChange={(event) => {
                setCluster(event.target.value as CustomerClusterCode | "ALL");
                setPage(1);
              }}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <option value="ALL">Todos los segmentos</option>
              {data.clusters.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.code} · {item.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <Table className="min-w-[1280px]">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Cliente</TableHead>
              <TableHead>Segmento</TableHead>
              <TableHead className="text-right">Compras</TableHead>
              <TableHead className="text-right">Rentas</TableHead>
              <TableHead className="text-right">Consultas</TableHead>
              <TableHead className="text-right">Gasto total</TableHead>
              <TableHead>Intereses</TableHead>
              <TableHead className="text-right">Última actividad</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedCustomers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>
                  <p className="font-medium text-foreground">{customer.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {customer.email}
                  </p>
                </TableCell>
                <TableCell>
                  <Badge variant={badgeByCluster[customer.cluster]}>
                    {definitions.get(customer.cluster)?.name ??
                      customer.cluster}
                  </Badge>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {customer.completedSales}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {customer.validRentals}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {customer.consultations}
                </TableCell>
                <TableCell className="text-right font-medium tabular-nums">
                  {currency.format(customer.totalSpend)}
                </TableCell>
                <TableCell>
                  <div className="flex max-w-64 flex-wrap gap-1">
                    {customer.interests.map((interest) => (
                      <Badge key={interest} variant="outline">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  Hace {customer.daysSinceLastActivity} días
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filtered.length > 0 ? (
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
                {Math.min((currentPage - 1) * pageSize + 1, filtered.length)}–
                {Math.min(currentPage * pageSize, filtered.length)} de{" "}
                {filtered.length}
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

      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            <Sparkles className="size-5" />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Acciones sugeridas por segmento
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Convierte los grupos en campañas y seguimiento comercial.
            </p>
          </div>
        </div>
        <ul className="mt-6 grid gap-4 md:grid-cols-2">
          {data.clusters.map((item) => (
            <li
              key={item.code}
              className="flex gap-3 rounded-xl border border-border p-4"
            >
              <Badge variant={badgeByCluster[item.code]}>{item.code}</Badge>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground">{item.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {item.action}
                </p>
              </div>
              <ArrowRight className="mt-1 size-4 shrink-0 text-muted-foreground" />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

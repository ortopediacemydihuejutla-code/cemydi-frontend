"use client";

import {
  CalendarClock,
  Database,
  History,
  Link2,
  ShieldCheck,
  Users,
} from "lucide-react";

import { Badge } from "@/features/admin/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/features/admin/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/features/admin/components/ui/table";
import {
  formatNumber,
  formatTableName,
  formatUptime,
} from "./database-formatters";
import {
  DetailRow,
  HeroStat,
  IconInfoCard,
  InfoStat,
} from "./database-ui-components";
import type { DatabaseAdminState } from "./use-database-admin-state";

type DatabaseMonitoringTabProps = {
  state: DatabaseAdminState;
};

export function DatabaseMonitoringTab({ state }: DatabaseMonitoringTabProps) {
  const {
    dbStatus,
    dbTableItems,
    heaviestDbTable,
    securitySummary,
    activeSessions,
  } = state;

  return (
    <>
          <section className="grid gap-6">
            <Card
              className="overflow-hidden rounded-[28px] border-0 text-white shadow-[0_22px_60px_rgba(4,32,38,0.22)]"
              style={{
                background:
                  "linear-gradient(135deg, color-mix(in srgb, var(--brand-900) 90%, #082125) 0%, color-mix(in srgb, var(--brand-700) 86%, #0d444a) 56%, color-mix(in srgb, var(--brand-600) 78%, #1b7c82) 100%)",
              }}
            >
              <CardContent className="grid gap-6 p-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.9fr)] lg:items-end lg:p-8">
                <div className="min-w-0 space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge
                      variant={dbStatus?.isOnline ? "emerald" : "red"}
                      className="border-0 bg-white/15 text-white"
                    >
                      {dbStatus?.isOnline ? "Servicio disponible" : "Sin conexion"}
                    </Badge>
                    <span className="text-sm text-white/75">
                      Ultima revision:{" "}
                      {dbStatus?.checkedAt
                        ? new Date(dbStatus?.checkedAt ?? "").toLocaleString("es-MX")
                        : "Sin datos"}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/70">
                      Base de datos activa
                    </p>
                    <h3 className="text-3xl font-bold tracking-tight lg:text-4xl">
                      {dbStatus?.databaseName ?? "Sin datos"}
                    </h3>
                    <p className="max-w-2xl text-sm leading-6 text-white/80">
                      Estado general, capacidad y actividad reciente en una sola vista.
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                  <HeroStat label="Tablas" value={formatNumber(dbTableItems.length)} />
                  <HeroStat
                    label="Filas estimadas"
                    value={formatNumber(dbStatus?.tables.totalRows ?? 0)}
                  />
                  <HeroStat
                    label="Peso total"
                    value={dbStatus?.tables.totalSizePretty ?? "Sin datos"}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,360px)]">
              <Card className="min-w-0 max-w-full rounded-2xl border-[var(--border-soft)] shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base">Salud operativa</CardTitle>
                  <CardDescription>Estado actual del servicio y su actividad.</CardDescription>
                </CardHeader>
                <CardContent className="grid min-w-0 grid-cols-1 gap-3 px-5 pb-6 sm:grid-cols-2 sm:gap-4 sm:px-6">
                  <IconInfoCard
                    icon={<Database className="size-4" />}
                    title="Estado"
                    value={dbStatus?.isOnline ? "Conectada" : "Sin datos"}
                    helper={`Servicio ${dbStatus?.isOnline ? "disponible" : "sin respuesta"}`}
                    valueClassName={
                      dbStatus?.isOnline ? "text-emerald-600" : "text-amber-700"
                    }
                  />
                  <IconInfoCard
                    icon={<CalendarClock className="size-4" />}
                    title="Tamaño y uptime"
                    value={dbStatus?.sizePretty ?? "Sin datos"}
                    helper={`Uptime: ${formatUptime(dbStatus?.uptimeSeconds ?? 0)}`}
                  />
                  <IconInfoCard
                    icon={<Link2 className="size-4" />}
                    title="Conexiones"
                    value={formatNumber(dbStatus?.connections.total ?? 0)}
                    helper={`${formatNumber(dbStatus?.connections.active ?? 0)} activas | ${formatNumber(
                      dbStatus?.connections.idle ?? 0,
                    )} idle`}
                  />
                  <IconInfoCard
                    icon={<History className="size-4" />}
                    title="Transacciones"
                    value={formatNumber(dbStatus?.transactions.commits ?? 0)}
                    helper={`${formatNumber(
                      dbStatus?.transactions.rollbacks ?? 0,
                    )} rollbacks`}
                  />
                </CardContent>
              </Card>

              <Card className="min-w-0 max-w-full rounded-2xl border-[var(--border-soft)] shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base">Resumen tecnico</CardTitle>
                  <CardDescription>
                    Version, capacidad y actividad reciente de la base de datos.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <DetailRow
                    label="Version"
                    value={dbStatus?.dbVersion ?? "Sin datos"}
                    valueClassName="text-sm"
                  />
                  <DetailRow
                    label="Peso de tablas"
                    value={dbStatus?.tables.totalSizePretty ?? "Sin datos"}
                  />
                  <DetailRow
                    label="Tabla principal"
                    value={
                      heaviestDbTable
                        ? `${formatTableName(heaviestDbTable?.tableName ?? "")} (${heaviestDbTable?.sizePretty ?? "Sin datos"})`
                        : "Sin datos"
                    }
                  />

                  <div className="grid gap-3 sm:grid-cols-2">
                    <InfoStat
                      icon={<ShieldCheck className="size-4" />}
                      label="Intentos fallidos"
                      value={formatNumber(securitySummary?.failedAttempts ?? 0)}
                    />
                    <InfoStat
                      icon={<Users className="size-4" />}
                      label="Sesiones activas"
                      value={formatNumber(
                        securitySummary?.activeSessions ?? activeSessions.length,
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="rounded-2xl border-[var(--border-soft)] shadow-sm">
              <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Database className="size-4 text-[var(--brand-700)]" />
                    Tablas de la BD
                  </CardTitle>
                  <CardDescription>
                    Registros y tamano de cada tabla con una lectura mas ligera.
                  </CardDescription>
                </div>
                <Badge variant="slate" className="w-fit">
                  {formatNumber(dbTableItems.length)} tablas
                </Badge>
              </CardHeader>
              <CardContent>
                {dbTableItems.length === 0 ? (
                  <p className="text-sm text-[var(--text-muted)]">
                    Sin datos de tablas por el momento.
                  </p>
                ) : (
                  <div className="overflow-hidden rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)]/35">
                    <div className="max-h-[560px] overflow-auto">
                      <Table>
                        <TableHeader className="sticky top-0 z-10 bg-[var(--surface)]/95 backdrop-blur">
                          <TableRow>
                            <TableHead className="pl-5">Tabla</TableHead>
                            <TableHead className="text-right">Registros</TableHead>
                            <TableHead className="pr-5 text-right">Tamano</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {dbTableItems.map((table, index) => (
                            <TableRow
                              key={table.tableName}
                              className="transition-colors hover:bg-[var(--card)]/75"
                            >
                              <TableCell className="pl-5">
                                <div className="flex items-center gap-3">
                                  <span className="inline-flex size-9 items-center justify-center rounded-xl bg-[var(--card)] text-xs font-bold text-[var(--brand-800)] shadow-sm">
                                    {String(index + 1).padStart(2, "0")}
                                  </span>
                                  <div className="space-y-0.5">
                                    <strong className="block text-sm text-[var(--text-main)]">
                                      {formatTableName(table.tableName)}
                                    </strong>
                                    <code className="text-xs text-[var(--text-muted)]">
                                      {table.tableName}
                                    </code>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-right tabular-nums text-[var(--text-main)]">
                                {formatNumber(table.rowCount)}
                              </TableCell>
                              <TableCell className="pr-5 text-right tabular-nums text-[var(--text-main)]">
                                {table.sizePretty}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

        {false ? (
        <div
          className="overflow-hidden rounded-2xl border border-[color-mix(in_srgb,var(--brand-600)_28%,var(--border-soft))]"
          style={{
            background:
              "linear-gradient(135deg, color-mix(in srgb, var(--brand-900) 88%, #0a2a2e) 0%, color-mix(in srgb, var(--brand-700) 85%, #0d3d42) 52%, color-mix(in srgb, var(--brand-600) 72%, #124a50) 100%)",
          }}
        >
          <div className="grid gap-6 p-6 text-white lg:grid-cols-[1.2fr_minmax(0,1fr)] lg:items-center">
            <div className="min-w-0 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/75">
                Base de datos activa
              </p>
              <h3 className="text-2xl font-bold tracking-tight lg:text-3xl">
                {dbStatus?.databaseName ?? "Sin datos"}
              </h3>
              <span className="text-sm text-white/85">
                Última revisión:{" "}
                {dbStatus?.checkedAt
                  ? new Date(dbStatus?.checkedAt ?? "").toLocaleString("es-MX")
                  : "Sin datos"}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-white/15 bg-black/15 px-3 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-white/70">
                  Tablas
                </p>
                <p className="mt-1 text-lg font-bold">
                  {formatNumber(dbTableItems.length)}
                </p>
              </div>
              <div className="rounded-xl border border-white/15 bg-black/15 px-3 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-white/70">
                  Filas totales
                </p>
                <p className="mt-1 text-lg font-bold">
                  {formatNumber(dbStatus?.tables.totalRows ?? 0)}
                </p>
              </div>
              <div className="rounded-xl border border-white/15 bg-black/15 px-3 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-white/70">
                  Peso tablas
                </p>
                <p className="mt-1 text-sm font-bold leading-snug">
                  {dbStatus?.tables.totalSizePretty ?? "Sin datos"}
                </p>
              </div>
            </div>
          </div>
        </div>
        ) : null}

        {false ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <IconInfoCard
            icon={<Database className="size-4" />}
            title="Estado"
            value={dbStatus?.isOnline ? "Conectada" : "Sin datos"}
            helper={`Servicio: ${dbStatus?.isOnline ? "Disponible" : "Sin datos"}`}
            valueClassName={dbStatus?.isOnline ? "text-emerald-600" : "text-amber-700"}
          />
          <IconInfoCard
            icon={<CalendarClock className="size-4" />}
            title="Tamaño y uptime"
            value={dbStatus?.sizePretty ?? "Sin datos"}
            helper={`Uptime: ${formatUptime(dbStatus?.uptimeSeconds ?? 0)}`}
          />
          <IconInfoCard
            icon={<Link2 className="size-4" />}
            title="Conexiones"
            value={formatNumber(dbStatus?.connections.total ?? 0)}
            helper={`Activas: ${formatNumber(dbStatus?.connections.active ?? 0)} | Idle: ${formatNumber(
              dbStatus?.connections.idle ?? 0,
            )}`}
          />
          <IconInfoCard
            icon={<History className="size-4" />}
            title="Transacciones"
            value={formatNumber(dbStatus?.transactions.commits ?? 0)}
            helper={`Rollbacks: ${formatNumber(dbStatus?.transactions.rollbacks ?? 0)}`}
          />
        </div>
        ) : null}

        {false ? (
        <div className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface)] p-4 text-sm text-[var(--text-main)]">
          <p>
            <strong>Versión:</strong> {dbStatus?.dbVersion ?? "Sin datos"}
          </p>
          <p className="mt-2">
            <strong>Peso de tablas:</strong>{" "}
            {dbStatus?.tables.totalSizePretty ?? "Sin datos"}
          </p>
          <p className="mt-2">
            <strong>Tabla principal:</strong>{" "}
            {heaviestDbTable
              ? `${formatTableName(heaviestDbTable?.tableName ?? "")} (${heaviestDbTable?.sizePretty ?? "Sin datos"})`
              : "Sin datos"}
          </p>
        </div>
        ) : null}

        {false ? (
        <div className="grid gap-6">
          <Card className="rounded-2xl border-[var(--border-soft)] shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Database className="size-4 text-[var(--brand-700)]" />
                Tablas de la BD
              </CardTitle>
              <CardDescription>Registros y tamaño de cada tabla</CardDescription>
            </CardHeader>
            <CardContent>
              {dbTableItems.length === 0 ? (
                <p className="text-sm text-[var(--text-muted)]">
                  Sin datos de tablas por el momento.
                </p>
              ) : (
                <div className="overflow-hidden rounded-xl border border-[var(--border-soft)]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tabla</TableHead>
                        <TableHead className="text-right">Registros</TableHead>
                        <TableHead className="text-right">Tamaño</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dbTableItems.map((table, index) => (
                        <TableRow key={table.tableName}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="inline-flex size-8 items-center justify-center rounded-lg bg-[var(--surface)] text-xs font-bold text-[var(--brand-800)]">
                                {String(index + 1).padStart(2, "0")}
                              </span>
                              <div>
                                <strong className="block text-[var(--text-main)]">
                                  {formatTableName(table.tableName)}
                                </strong>
                                <code className="text-xs text-[var(--text-muted)]">
                                  {table.tableName}
                                </code>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {formatNumber(table.rowCount)}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {table.sizePretty}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        ) : null}
    </>
  );
}

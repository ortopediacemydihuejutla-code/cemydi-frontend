"use client";

import {
  AlertTriangle,
  CalendarClock,
  Database,
  Download,
  History,
  Link2,
  MoreHorizontal,
  RotateCcw,
  Search,
  TimerReset,
  Trash2,
} from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/features/admin/components/ui/alert-dialog";
import { Badge } from "@/features/admin/components/ui/badge";
import { Button } from "@/features/admin/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/features/admin/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/features/admin/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/features/admin/components/ui/dropdown-menu";
import { Input } from "@/features/admin/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/features/admin/components/ui/table";
import { cn } from "@/features/admin/lib/utils";
import { defaultScheduleForm } from "./database-types";
import {
  formatBackupRecordDate,
  formatBytes,
  formatDateTime,
  formatNumber,
  formatScheduleDateTime,
  formatTableName,
  nowTime,
} from "./database-formatters";
import {
  DetailRow,
  FieldShell,
  InfoStat,
} from "./database-ui-components";
import type { DatabaseAdminState } from "./use-database-admin-state";

type DatabaseBackupsTabProps = {
  state: DatabaseAdminState;
};

export function DatabaseBackupsTab({ state }: DatabaseBackupsTabProps) {
  const {
    dbStatus,
    backupRecords,
    backupSchedule,
    scheduleForm,
    setScheduleForm,
    loadingDbStatus,
    loadingBackupRecords,
    loadingBackupSchedule,
    selectedBackupTable,
    setSelectedBackupTable,
    historyQuery,
    setHistoryQuery,
    setBackupPage,
    generatingBackup,
    generatingTableBackup,
    savingSchedule,
    downloadingBackupId,
    deletingBackupId,
    pendingAction,
    setPendingAction,
    scheduleDialogOpen,
    setScheduleDialogOpen,
    tableBackupDialogOpen,
    setTableBackupDialogOpen,
    databaseSummaryOpen,
    setDatabaseSummaryOpen,
    consoleOpen,
    setConsoleOpen,
    consoleLogs,
    consoleOpType,
    consoleRunning,
    consoleStatus,
    consoleEndRef,
    dbTableItems,
    heaviestDbTable,
    filteredBackups,
    totalBackupPages,
    currentBackupPage,
    paginatedBackups,
    anyLoading,
    loadBackupRecordsData,
    loadBackupScheduleData,
    refreshAllData,
    syncScheduleFormWithCurrentRecord,
    openScheduleDialog,
    generateBackup,
    generateSingleTableBackup,
    downloadBackupRecord,
    saveSchedule,
    executePendingAction,
  } = state;

  const pendingTitle =
    pendingAction?.kind === "delete-backup"
      ? "Eliminar respaldo"
      : pendingAction?.kind === "restore-backup"
        ? "Restaurar base de datos"
        : "Eliminar programación automática";

  const pendingDescription =
    pendingAction?.kind === "delete-backup"
      ? `Se eliminará el archivo "${pendingAction.backup.fileName}" y su registro del historial.`
      : pendingAction?.kind === "restore-backup"
        ? `Se restaurará la base de datos a partir del archivo "${pendingAction.backup.fileName}". Esta acción reemplazará los datos actuales con los del respaldo seleccionado.`
        : "Se restablecerá la programación a modo manual. Podrás crear una nueva configuración cuando quieras.";

  return (
    <>
        <Card
          className="overflow-hidden rounded-2xl border-[var(--border-soft)]"
          style={{
            background:
              "radial-gradient(circle at top right, rgba(43,162,161,0.12), transparent 26%), linear-gradient(180deg, color-mix(in srgb, var(--card) 96%, #fff) 0%, color-mix(in srgb, var(--brand-600) 6%, var(--card)) 100%)",
          }}
        >
          <CardHeader>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-2xl space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand-800)]">
                  Respaldo y continuidad
                </span>
                <CardTitle className="text-xl">Generar respaldo de la base de datos</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Centraliza respaldos manuales y automáticos. Los archivos se registran en el
                  historial; la configuración del servidor puede guardarlos también en la nube
                  (por ejemplo Google Drive) para trazabilidad y recuperación.
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="rounded-xl border border-[var(--border-soft)] bg-[var(--card)] px-4 py-3 text-center">
                  <p className="text-xs font-medium text-[var(--text-muted)]">Formato</p>
                  <p className="text-lg font-bold text-[var(--text-main)]">
                    {dbStatus?.backup.fileExtension
                      ? dbStatus.backup.fileExtension.toUpperCase()
                      : "TAR"}
                  </p>
                </div>
                <div className="rounded-xl border border-[var(--border-soft)] bg-[var(--card)] px-4 py-3 text-center">
                  <p className="text-xs font-medium text-[var(--text-muted)]">Historial</p>
                  <p className="text-lg font-bold text-[var(--text-main)]">
                    {formatNumber(backupRecords.length)} archivos
                  </p>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid min-w-0 gap-6 px-5 pb-5 sm:px-6 sm:pb-6">
            <div className="grid min-w-0 gap-4 md:grid-cols-2">
              <button
                type="button"
                onClick={() => void generateBackup()}
                disabled={generatingBackup || generatingTableBackup}
                className="group rounded-2xl border border-[rgba(17,92,101,0.45)] bg-[linear-gradient(135deg,var(--brand-800),var(--brand-600))] p-5 text-left text-white transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-white/80">
                  Respaldo completo
                </span>
                <strong className="mt-2 block text-lg">
                  {generatingBackup
                    ? "Generando respaldo..."
                    : "Generar respaldo de la base de datos"}
                </strong>
                <p className="mt-2 text-sm text-white/85">
                  Crea una copia completa lista para descarga y resguardo.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setTableBackupDialogOpen(true)}
                disabled={loadingDbStatus || generatingBackup || generatingTableBackup}
                className={cn(
                  "rounded-2xl border border-[var(--border-soft)] bg-[var(--card)] p-5 text-left transition hover:-translate-y-0.5 hover:shadow-md",
                  tableBackupDialogOpen &&
                    "border-[var(--brand-600)] ring-2 ring-[color-mix(in_srgb,var(--brand-600)_25%,transparent)]",
                )}
              >
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand-800)]">
                  Respaldo selectivo
                </span>
                <strong className="mt-2 block text-lg text-[var(--text-main)]">
                  Generar respaldo de una sola tabla
                </strong>
                <p className="mt-2 text-sm text-[var(--text-muted)]">
                  Ideal para cambios puntuales o exportaciones de revisión.
                </p>
              </button>
            </div>

            <div className="flex flex-col gap-4 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="grid gap-3 sm:grid-cols-2">
                <DetailRow
                  label="Formato"
                  value={
                    dbStatus?.backup.fileExtension
                      ? dbStatus.backup.fileExtension.toUpperCase()
                      : "TAR"
                  }
                />
                <DetailRow
                  label="Destino"
                  value={dbStatus?.backup.provider ?? "Almacenamiento principal"}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void loadBackupRecordsData()}
                  disabled={
                    loadingBackupRecords || generatingBackup || generatingTableBackup
                  }
                >
                  {loadingBackupRecords ? "Recargando..." : "Actualizar historial"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void refreshAllData()}
                  disabled={anyLoading}
                >
                  Actualizar panel
                </Button>
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_340px]">
              <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--card)] p-5 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <h4 className="text-base font-semibold text-[var(--text-main)]">
                      Respaldo automatico
                    </h4>
                    <p className="mt-1 text-sm text-[var(--text-muted)]">
                      Configura la frecuencia y revisa el estado actual desde un solo panel.
                    </p>
                  </div>
                  <Badge variant={backupSchedule?.enabled ? "emerald" : "slate"}>
                    {backupSchedule?.enabled ? "Activo" : "Manual"}
                  </Badge>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <DetailRow
                    label="Frecuencia"
                    value={`Cada ${backupSchedule?.everyDays ?? 1} dia(s)`}
                  />
                  <DetailRow
                    label="Hora"
                    value={backupSchedule?.runAtTime ?? defaultScheduleForm.runAtTime}
                  />
                  <DetailRow
                    label="Retencion"
                    value={`${backupSchedule?.retentionDays ?? 7} dia(s)`}
                  />
                  <DetailRow
                    label="Actualizado"
                    value={
                      backupSchedule?.updatedAt
                        ? formatDateTime(backupSchedule.updatedAt)
                        : "Sin cambios"
                    }
                  />
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <InfoStat
                    icon={<History className="size-4" />}
                    label="Ultima ejecucion"
                    value={formatScheduleDateTime(backupSchedule?.lastRunAt ?? null)}
                  />
                  <InfoStat
                    icon={<TimerReset className="size-4" />}
                    label="Proxima ejecucion"
                    value={formatScheduleDateTime(backupSchedule?.nextRunAt ?? null)}
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand-800)]">
                  Acciones
                </p>
                <div className="mt-4 grid gap-3">
                  <Button type="button" onClick={openScheduleDialog}>
                    <CalendarClock className="size-4" />
                    Configurar respaldo automatico
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => void loadBackupScheduleData()}
                    disabled={loadingBackupSchedule || savingSchedule}
                  >
                    {loadingBackupSchedule ? "Recargando..." : "Actualizar datos"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-red-200 text-red-700 hover:bg-red-50"
                    onClick={() => setPendingAction({ kind: "delete-schedule" })}
                    disabled={savingSchedule || loadingBackupSchedule}
                  >
                    Eliminar programacion
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h4 className="font-semibold text-[var(--text-main)]">
                    Historial de archivos
                  </h4>
                  <p className="text-sm text-[var(--text-muted)]">
                    Consulta, descarga o elimina respaldos guardados.
                  </p>
                </div>
                <div className="relative w-full max-w-xs">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--text-muted)]" />
                  <Input
                    value={historyQuery}
                    onChange={(event) => {
                      setHistoryQuery(event.target.value);
                      setBackupPage(1);
                    }}
                    placeholder="Filtrar por nombre..."
                    className="rounded-full pl-9"
                  />
                </div>
              </div>
              <div className="overflow-x-auto rounded-xl border border-[var(--border-soft)]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Archivo</TableHead>
                      <TableHead>Fecha de generación</TableHead>
                      <TableHead>Tamaño</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedBackups.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-[var(--text-muted)]">
                          No hay respaldos generados.
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedBackups.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <code className="text-sm">{item.fileName}</code>
                          </TableCell>
                          <TableCell>{formatBackupRecordDate(item)}</TableCell>
                          <TableCell>{formatBytes(item.sizeBytes)}</TableCell>
                          <TableCell>
                            <div className="flex justify-end">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    disabled={
                                      downloadingBackupId === item.id ||
                                      deletingBackupId === item.id
                                    }
                                    className="size-8 p-0"
                                  >
                                    <MoreHorizontal className="size-4" />
                                    <span className="sr-only">Acciones del respaldo</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-52">
                                  <DropdownMenuGroup>
                                    <DropdownMenuItem
                                      onSelect={() => void downloadBackupRecord(item)}
                                      disabled={
                                        downloadingBackupId === item.id ||
                                        deletingBackupId === item.id
                                      }
                                    >
                                      <Download className="size-4" />
                                      {downloadingBackupId === item.id
                                        ? "Descargando..."
                                        : "Descargar archivo"}
                                    </DropdownMenuItem>
                                  </DropdownMenuGroup>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuGroup>
                                    <DropdownMenuItem
                                      onSelect={() =>
                                        setPendingAction({ kind: "restore-backup", backup: item })
                                      }
                                      disabled={deletingBackupId === item.id}
                                      className="text-amber-700 focus:bg-amber-50 focus:text-amber-700 dark:text-amber-400 dark:focus:bg-amber-950/30"
                                    >
                                      <RotateCcw className="size-4 text-amber-600 dark:text-amber-400" />
                                      Restaurar base de datos
                                    </DropdownMenuItem>
                                  </DropdownMenuGroup>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuGroup>
                                    <DropdownMenuItem
                                      variant="destructive"
                                      onSelect={() =>
                                        setPendingAction({ kind: "delete-backup", backup: item })
                                      }
                                      disabled={deletingBackupId === item.id}
                                    >
                                      <Trash2 className="size-4" />
                                      {deletingBackupId === item.id
                                        ? "Eliminando..."
                                        : "Eliminar respaldo"}
                                    </DropdownMenuItem>
                                  </DropdownMenuGroup>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
                <p className="text-sm text-[var(--text-muted)]">
                  {formatNumber(filteredBackups.length)} archivo(s) en el historial
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setBackupPage((p) => Math.max(1, p - 1))}
                    disabled={currentBackupPage === 1}
                  >
                    Anterior
                  </Button>
                  <span className="text-sm text-[var(--text-muted)]">
                    Página {currentBackupPage} de {totalBackupPages}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setBackupPage((p) => Math.min(totalBackupPages, p + 1))
                    }
                    disabled={currentBackupPage === totalBackupPages}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

<Dialog open={databaseSummaryOpen} onOpenChange={setDatabaseSummaryOpen}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Resumen tecnico de la base de datos</DialogTitle>
            <DialogDescription>
              Consulta el detalle tecnico del estado actual.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 md:grid-cols-2">
            <InfoStat
              icon={<Database className="size-4" />}
              label="Base activa"
              value={dbStatus?.databaseName ?? "Sin datos"}
            />
            <InfoStat
              icon={<CalendarClock className="size-4" />}
              label="Última revisión"
              value={
                dbStatus?.checkedAt
                  ? new Date(dbStatus?.checkedAt ?? "").toLocaleString("es-MX")
                  : "Sin datos"
              }
            />
            <InfoStat
              icon={<Link2 className="size-4" />}
              label="Conexiones"
              value={`${formatNumber(dbStatus?.connections.active ?? 0)} activas / ${formatNumber(
                dbStatus?.connections.total ?? 0,
              )} totales`}
            />
            <InfoStat
              icon={<History className="size-4" />}
              label="Transacciones"
              value={`${formatNumber(dbStatus?.transactions.commits ?? 0)} commits`}
            />
          </div>

          <div className="grid gap-3 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)]/70 p-4">
            <DetailRow label="Version" value={dbStatus?.dbVersion ?? "Sin datos"} valueClassName="text-sm" />
            <DetailRow
              label="Tamaño total"
              value={dbStatus?.tables.totalSizePretty ?? dbStatus?.sizePretty ?? "Sin datos"}
            />
            <DetailRow
              label="Tabla principal"
              value={
                heaviestDbTable
                  ? `${formatTableName(heaviestDbTable?.tableName ?? "")} (${heaviestDbTable?.sizePretty ?? "Sin datos"})`
                  : "Sin datos"
              }
            />
            <DetailRow
              label="Filas estimadas"
              value={formatNumber(dbStatus?.tables.totalRows ?? 0)}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => syncScheduleFormWithCurrentRecord(true)}
              disabled={savingSchedule}
            >
              Restablecer
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDatabaseSummaryOpen(false)}
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

<Dialog open={tableBackupDialogOpen} onOpenChange={setTableBackupDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Respaldo selectivo por tabla</DialogTitle>
            <DialogDescription>
              Selecciona una tabla para generar un respaldo independiente.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <label
              className="text-sm font-medium text-[var(--text-main)]"
              htmlFor="single-table-backup-select-dialog"
            >
              Tabla
            </label>
            <select
              id="single-table-backup-select-dialog"
              value={selectedBackupTable}
              onChange={(event) => setSelectedBackupTable(event.target.value)}
              disabled={dbTableItems.length === 0 || generatingTableBackup}
              className="h-11 min-w-0 rounded-xl border border-[var(--border-soft)] bg-[var(--card)] px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-600)]"
            >
              {dbTableItems.length === 0 ? (
                <option value="">Sin tablas disponibles</option>
              ) : (
                dbTableItems.map((table) => (
                  <option key={table.tableName} value={table.tableName}>
                    {table.tableName}
                  </option>
                ))
              )}
            </select>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setTableBackupDialogOpen(false)}
            >
              Cerrar
            </Button>
            <Button
              type="button"
              onClick={() => void generateSingleTableBackup()}
              disabled={!selectedBackupTable || generatingBackup || generatingTableBackup}
            >
              {generatingTableBackup
                ? "Generando respaldo..."
                : "Generar respaldo de tabla"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Configurar programación automática</DialogTitle>
            <DialogDescription>
              Edita la frecuencia, hora y retención en un formulario con más espacio.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <label className="flex cursor-pointer items-center gap-2 rounded-full border border-[var(--border-soft)] bg-[var(--surface)] px-4 py-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={scheduleForm.enabled}
                onChange={(event) =>
                  setScheduleForm((current) => ({
                    ...current,
                    enabled: event.target.checked,
                  }))
                }
                disabled={savingSchedule}
                className="size-4 accent-[var(--brand-700)]"
              />
              {scheduleForm.enabled ? "Automáticos activos" : "Solo manual"}
            </label>

            <div className="grid gap-3 sm:grid-cols-3">
              <FieldShell label="Cada cuántos días" hint="1 a 365 días">
                <Input
                  type="number"
                  min="1"
                  max="365"
                  value={scheduleForm.everyDays}
                  onChange={(event) =>
                    setScheduleForm((current) => ({
                      ...current,
                      everyDays: event.target.value,
                    }))
                  }
                  disabled={savingSchedule}
                />
              </FieldShell>
              <FieldShell label="Hora" hint="Horario del servidor (24h)">
                <Input
                  type="time"
                  value={scheduleForm.runAtTime}
                  onChange={(event) =>
                    setScheduleForm((current) => ({
                      ...current,
                      runAtTime: event.target.value,
                    }))
                  }
                  disabled={savingSchedule}
                />
              </FieldShell>
              <FieldShell label="Retención en almacenamiento" hint="Días a conservar">
                <Input
                  type="number"
                  min="1"
                  max="3650"
                  value={scheduleForm.retentionDays}
                  onChange={(event) =>
                    setScheduleForm((current) => ({
                      ...current,
                      retentionDays: event.target.value,
                    }))
                  }
                  disabled={savingSchedule}
                />
              </FieldShell>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setScheduleDialogOpen(false)}
            >
              Cerrar
            </Button>
            <Button
              type="button"
              onClick={() => void saveSchedule()}
              disabled={savingSchedule || loadingBackupSchedule}
            >
              {savingSchedule ? "Guardando..." : "Guardar programación"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={consoleOpen}
        onOpenChange={(open) => {
          if (!open && !consoleRunning) setConsoleOpen(false);
        }}
      >
        <DialogContent className="max-w-2xl" showCloseButton={false}>
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-xl",
                consoleOpType === "restore"
                  ? "bg-amber-100 dark:bg-amber-900/30"
                  : "bg-(--brand-600)/10 dark:bg-(--brand-600)/15",
              )}>
                {consoleOpType === "restore" ? (
                  <RotateCcw className="size-4 text-amber-600 dark:text-amber-400" />
                ) : (
                  <Database className="size-4 text-[var(--brand-700)]" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <DialogTitle className="text-base">
                  {consoleOpType === "backup-full"
                    ? "Generando respaldo completo"
                    : consoleOpType === "backup-table"
                      ? "Generando respaldo de tabla"
                      : "Restaurando base de datos"}
                </DialogTitle>
                <DialogDescription className="mt-0.5">
                  {consoleRunning
                    ? "Procesando… no cierres esta ventana."
                    : consoleStatus === "success"
                      ? "Operación completada exitosamente."
                      : "La operación terminó con errores."}
                </DialogDescription>
              </div>
              <div className={cn(
                "shrink-0 rounded-full px-3 py-1 text-xs font-semibold",
                consoleRunning
                  ? "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400"
                  : consoleStatus === "success"
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
              )}>
                {consoleRunning ? "Ejecutando" : consoleStatus === "success" ? "Completado" : "Error"}
              </div>
            </div>

            {consoleRunning ? (
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[var(--border-soft)]">
                <div className="h-full animate-[progress-indeterminate_1.6s_ease-in-out_infinite] rounded-full bg-[var(--brand-600)]" />
              </div>
            ) : (
              <div className={cn(
                "mt-3 h-1.5 w-full rounded-full",
                consoleStatus === "success" ? "bg-emerald-400" : "bg-red-400",
              )} />
            )}
          </DialogHeader>

          <div className="overflow-hidden rounded-xl border border-gray-800">
            <div className="flex items-center gap-2 border-b border-gray-800 bg-gray-900 px-4 py-2.5">
              <div className="flex gap-1.5">
                <div className="size-3 rounded-full bg-red-500/70" />
                <div className="size-3 rounded-full bg-amber-500/70" />
                <div className="size-3 rounded-full bg-emerald-500/70" />
              </div>
              <span className="ml-2 font-mono text-xs text-gray-500">
                {consoleOpType === "backup-full"
                  ? "pg_dump — full backup"
                  : consoleOpType === "backup-table"
                    ? "pg_dump — table backup"
                    : "pg_restore — database restore"}
              </span>
              {consoleRunning ? (
                <span className="ml-auto flex items-center gap-1.5 text-xs text-sky-400">
                  <span className="inline-block size-1.5 animate-pulse rounded-full bg-sky-400" />
                  LIVE
                </span>
              ) : null}
            </div>

            <div className="min-h-48 max-h-72 overflow-y-auto bg-gray-950 p-4 font-mono text-sm">
              {consoleLogs.map((log) => (
                <div key={log.id} className="flex gap-3 py-[3px]">
                  <span className="shrink-0 text-[11px] tabular-nums text-gray-600">
                    {log.timestamp}
                  </span>
                  <span className={cn(
                    "leading-relaxed break-all",
                    log.kind === "cmd" && "text-cyan-400 font-semibold",
                    log.kind === "success" && "text-emerald-400",
                    log.kind === "error" && "text-red-400",
                    log.kind === "warn" && "text-amber-400",
                    log.kind === "info" && "text-gray-300",
                  )}>
                    {log.kind !== "cmd" ? "  " : ""}{log.message}
                  </span>
                </div>
              ))}
              {consoleRunning ? (
                <div className="flex gap-3 py-[3px]">
                  <span className="shrink-0 text-[11px] tabular-nums text-gray-600">
                    {nowTime()}
                  </span>
                  <span className="animate-pulse text-gray-500">█</span>
                </div>
              ) : null}
              <div ref={consoleEndRef} />
            </div>
          </div>

          <DialogFooter>
            <p className="mr-auto text-xs text-[var(--text-muted)]">
              {consoleLogs.length} línea{consoleLogs.length !== 1 ? "s" : ""} de salida
            </p>
            <Button
              type="button"
              variant={consoleStatus === "error" ? "outline" : "default"}
              disabled={consoleRunning}
              onClick={() => setConsoleOpen(false)}
            >
              {consoleRunning ? "Procesando…" : "Cerrar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(pendingAction)}
        onOpenChange={(open) => {
          if (!open) {
            setPendingAction(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            {pendingAction?.kind === "restore-backup" ? (
              <div className="mb-1 flex size-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                <RotateCcw className="size-5 text-amber-600 dark:text-amber-400" />
              </div>
            ) : null}
            <AlertDialogTitle>{pendingTitle}</AlertDialogTitle>
            <AlertDialogDescription>{pendingDescription}</AlertDialogDescription>
          </AlertDialogHeader>

          {pendingAction?.kind === "restore-backup" ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800/50 dark:bg-amber-900/20">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                    Advertencia importante
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Los datos actuales serán reemplazados permanentemente por los contenidos
                    en este archivo de respaldo. Esta operación no se puede deshacer una vez
                    iniciada.
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          <AlertDialogFooter>
            <AlertDialogCancel type="button" onClick={() => setPendingAction(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              type="button"
              onClick={() => void executePendingAction()}
              className={
                pendingAction?.kind === "restore-backup"
                  ? "bg-amber-600 text-white hover:bg-amber-700 focus-visible:ring-amber-600"
                  : undefined
              }
            >
              {pendingAction?.kind === "restore-backup" ? "Sí, restaurar ahora" : "Confirmar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

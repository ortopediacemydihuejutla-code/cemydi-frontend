"use client";

import { CalendarClock, Database } from "lucide-react";
import type { MaintenanceOperation } from "@/services/admin";

import { Button } from "@/features/admin/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/features/admin/components/ui/card";
import { Input } from "@/features/admin/components/ui/input";
import { formatScheduleDateTime } from "./database-formatters";
import type { DatabaseAdminState } from "./use-database-admin-state";

type DatabaseMaintenanceTabProps = {
  state: DatabaseAdminState;
};

export function DatabaseMaintenanceTab({ state }: DatabaseMaintenanceTabProps) {
  const {
    maintenanceForm,
    setMaintenanceForm,
    maintenanceSchedule,
    runningMaintenance,
    savingMaintenanceSchedule,
    handleRunMaintenance,
    handleSaveMaintenanceSchedule,
    handleRemoveMaintenanceSchedule,
  } = state;

  return (
          <section className="grid min-w-0 items-start gap-6 lg:grid-cols-2">
            <Card className="h-full min-w-0 overflow-hidden rounded-[28px] border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="size-5 text-primary" />
                  Mantenimiento Manual
                </CardTitle>
                <CardDescription>
                  Ejecuta VACUUM o ANALYZE manualmente.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid min-w-0 gap-4 px-5 pb-5 sm:px-6 sm:pb-6">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Operación</label>
                  <select
                    className="flex h-10 min-w-0 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={maintenanceForm.operation}
                    onChange={(e) => setMaintenanceForm((prev) => ({ ...prev, operation: e.target.value as MaintenanceOperation }))}
                  >
                    <option value="VACUUM">VACUUM (Limpiar)</option>
                    <option value="ANALYZE">ANALYZE (Estadísticas)</option>
                    <option value="VACUUM_ANALYZE">VACUUM ANALYZE (Ambos)</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Esquema</label>
                  <Input
                    className="min-w-0"
                    placeholder="public"
                    value={maintenanceForm.schemaName}
                    onChange={(e) => setMaintenanceForm((prev) => ({ ...prev, schemaName: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Tabla (Opcional)</label>
                  <Input
                    className="min-w-0"
                    placeholder="Ej. users"
                    value={maintenanceForm.tableName}
                    onChange={(e) => setMaintenanceForm((prev) => ({ ...prev, tableName: e.target.value }))}
                  />
                </div>
                <Button className="w-full" onClick={handleRunMaintenance} disabled={runningMaintenance}>
                  {runningMaintenance ? "Ejecutando..." : "Ejecutar ahora"}
                </Button>
              </CardContent>
            </Card>

            <Card className="h-full min-w-0 overflow-hidden rounded-[28px] border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <form onSubmit={handleSaveMaintenanceSchedule} className="flex h-full min-w-0 flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarClock className="size-5 text-primary" />
                    Mantenimiento Automático
                  </CardTitle>
                  <CardDescription>Configura tareas periódicas.</CardDescription>
                </CardHeader>
                <CardContent className="grid flex-1 min-w-0 content-start gap-4 overflow-hidden px-5 pb-5 sm:px-6 sm:pb-6">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <input
                      type="checkbox"
                      checked={maintenanceForm.enabled}
                      onChange={(e) => setMaintenanceForm((prev) => ({ ...prev, enabled: e.target.checked }))}
                    />
                    Habilitar mantenimiento automático
                  </label>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Cada cuántos días</label>
                    <Input
                      className="min-w-0"
                      type="number"
                      min="1"
                      value={maintenanceForm.everyDays}
                      onChange={(e) => setMaintenanceForm((prev) => ({ ...prev, everyDays: e.target.value }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">A qué hora (HH:mm)</label>
                    <Input
                      className="min-w-0"
                      type="time"
                      value={maintenanceForm.runAtTime}
                      onChange={(e) => setMaintenanceForm((prev) => ({ ...prev, runAtTime: e.target.value }))}
                    />
                  </div>

                  <div className="mt-1 flex flex-wrap gap-2">
                    <Button type="submit" disabled={savingMaintenanceSchedule}>
                      {savingMaintenanceSchedule ? "Guardando..." : "Programar"}
                    </Button>
                    {maintenanceSchedule?.enabled && (
                      <Button type="button" variant="destructive" onClick={handleRemoveMaintenanceSchedule} disabled={savingMaintenanceSchedule}>
                        Eliminar
                      </Button>
                    )}
                  </div>

                  {maintenanceSchedule && (
                    <div className="mt-auto grid gap-1 rounded-lg bg-muted p-4 text-xs">
                      <p className="min-w-0 break-words">
                        Última: {formatScheduleDateTime(maintenanceSchedule.lastRunAt)}
                      </p>
                      <p className="min-w-0 break-words">
                        Próxima: {formatScheduleDateTime(maintenanceSchedule.nextRunAt)}
                      </p>
                    </div>
                  )}
                </CardContent>
              </form>
            </Card>
          </section>
  );
}

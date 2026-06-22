"use client";

import { RefreshCw } from "lucide-react";

import { AdminPageLoading } from "@/features/admin/components/admin-page-loading";
import { AdminFilterTabs } from "@/features/admin/components/admin-filter-tabs";
import { AdminMetricCard } from "@/features/admin/components/admin-metric-card";
import { PageHeader } from "@/features/admin/components/page-header";
import { useAdminRouteGate } from "@/features/admin/hooks/use-admin-route-gate";
import { Button } from "@/features/admin/components/ui/button";
import { cn } from "@/features/admin/lib/utils";
import { type MainTab } from "./database-types";
import { formatNumber } from "./database-formatters";
import { DatabaseBackupsTab } from "./database-backups-tab";
import { DatabaseMaintenanceTab } from "./database-maintenance-tab";
import { DatabaseMonitoringTab } from "./database-monitoring-tab";
import { DatabaseSecurityTab } from "./database-security-tab";
import { useDatabaseAdminState } from "./use-database-admin-state";

export default function DatabaseMonitoringPage() {
  const { user, blockingFullPage } = useAdminRouteGate();
  const state = useDatabaseAdminState(user);

  if (blockingFullPage) {
    return <AdminPageLoading layout="viewport" />;
  }

  if (state.initialLoading) {
    return <AdminPageLoading layout="section" />;
  }

  const {
    dbStatus,
    dbTableItems,
    securitySummary,
    loginAuditItems,
    backupRecords,
    maintenanceSchedule,
    mainTab,
    setMainTab,
    anyLoading,
    loadAuthSecurityOverviewData,
    loadDatabaseStats,
    loadBackupRecordsData,
    loadBackupScheduleData,
  } = state;

  return (
    <>
      <PageHeader
        title="Monitoreo de Base de Datos"
        subtitle="Misma funcionalidad que el panel de referencia: estado de la instancia, tablas, seguridad, respaldos manuales y programación automática."
      />

      <div className="flex flex-col gap-6">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <AdminMetricCard
            context="database-online"
            label="Estado de la base"
            value={dbStatus?.isOnline ? "En línea" : "Sin respuesta"}
            helper={dbStatus?.dbVersion || "Versión no disponible"}
          />
          <AdminMetricCard
            context="database-connections"
            label="Conexiones activas"
            value={`${formatNumber(dbStatus?.connections.active ?? 0)} / ${formatNumber(
              dbStatus?.connections.total ?? 0,
            )}`}
            helper="Resumen de uso de conexiones"
          />
          <AdminMetricCard
            context="database-tables"
            label="Tablas detectadas"
            value={formatNumber(dbTableItems.length)}
            helper={`${formatNumber(dbStatus?.tables.totalRows ?? 0)} registros estimados`}
          />
          <AdminMetricCard
            context="database-alerts"
            label="Intentos fallidos"
            value={formatNumber(securitySummary?.failedAttempts ?? 0)}
            helper={`${formatNumber(
              securitySummary?.recentAttempts ?? 0,
            )} intentos recientes`}
          />
        </section>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-[var(--text-main)]">
              Centro de monitoreo
            </h2>
            <p className="text-sm text-[var(--text-muted)]">
              Resumen general del servicio, la seguridad y los respaldos.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                void Promise.all([
                  loadAuthSecurityOverviewData(),
                  loadDatabaseStats(),
                  loadBackupRecordsData(),
                  loadBackupScheduleData(),
                ])
              }
              disabled={anyLoading}
              className="rounded-lg"
            >
              <RefreshCw className={cn("size-4", anyLoading && "animate-spin")} />
              {anyLoading ? "Actualizando..." : "Actualizar estado"}
            </Button>
          </div>
        </div>

        <AdminFilterTabs
          tabs={[
            { id: "monitoreo", label: "Monitoreo", count: dbTableItems.length },
            { id: "seguridad", label: "Seguridad", count: loginAuditItems.length },
            { id: "respaldos", label: "Respaldos", count: backupRecords.length },
            { id: "mantenimiento", label: "Mantenimiento", count: maintenanceSchedule?.enabled ? 1 : 0 },
          ]}
          activeId={mainTab}
          onChange={(id) => setMainTab(id as MainTab)}
          formatCount={formatNumber}
        />

        {mainTab === "monitoreo" ? <DatabaseMonitoringTab state={state} /> : null}
        {mainTab === "seguridad" ? <DatabaseSecurityTab state={state} /> : null}
        {mainTab === "mantenimiento" ? <DatabaseMaintenanceTab state={state} /> : null}
        {mainTab === "respaldos" ? <DatabaseBackupsTab state={state} /> : null}
      </div>
    </>
  );
}

"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Calendar } from "lucide-react";

import { AdminMetricCard } from "@/features/admin/components/admin-metric-card";
import { AdminPageLoading } from "@/features/admin/components/admin-page-loading";
import { PageHeader } from "@/features/admin/components/page-header";
import { useAdminRouteGate } from "@/features/admin/hooks/use-admin-route-gate";
import { getAnalyticsDashboard, type AnalyticsDashboardData } from "@/services/admin";
import { Button } from "@/features/admin/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/features/admin/components/ui/card";

import {
  getDashboardPeriodTitle,
  getDashboardRangeLabel,
  mapDashboardGeneralKpis,
  mapDashboardToGeneralActivity,
  mapDashboardToReviewsStatus,
  periodToDays,
} from "./analytics-real-data";
import {
  type AnalyticsPeriod,
  formatCompact,
  getDateRangeLabel,
  getPeriodLabel,
} from "./analytics-types";

const PERIOD_OPTIONS: AnalyticsPeriod[] = ["7d", "30d", "90d", "1y"];

const GeneralActivityChart = dynamic(
  () =>
    import("./components/analytics-charts").then((mod) => mod.GeneralActivityChart),
  {
    loading: () => <AdminPageLoading layout="section" />,
  },
);

const GeneralReviewsStatusChart = dynamic(
  () =>
    import("./components/analytics-charts").then(
      (mod) => mod.GeneralReviewsStatusChart,
    ),
  {
    loading: () => <AdminPageLoading layout="section" />,
  },
);

function DateRangeFilter({
  period,
  onChange,
  rangeLabel,
}: {
  period: AnalyticsPeriod;
  onChange: (p: AnalyticsPeriod) => void;
  rangeLabel: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="inline-flex items-center rounded-lg border border-border bg-card p-1 shadow-sm">
        {PERIOD_OPTIONS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onChange(item)}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              item === period
                ? "bg-primary text-primary-foreground shadow"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {item}
          </button>
        ))}
      </div>
      <Button variant="outline" className="h-8 gap-2 text-xs font-medium">
        <Calendar className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">{rangeLabel}</span>
      </Button>
    </div>
  );
}

export default function AnalyticsPage() {
  const { blockingFullPage } = useAdminRouteGate();
  const [period, setPeriod] = useState<AnalyticsPeriod>("30d");
  const [dashboard, setDashboard] = useState<AnalyticsDashboardData | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  useEffect(() => {
    if (blockingFullPage) {
      return;
    }

    let cancelled = false;

    const loadDashboard = async () => {
      setDashboardLoading(true);
      setDashboardError(null);

      try {
        const data = await getAnalyticsDashboard(periodToDays(period));
        if (!cancelled) {
          setDashboard(data);
        }
      } catch (error) {
        if (!cancelled) {
          setDashboard(null);
          setDashboardError(
            error instanceof Error ? error.message : "No se pudieron cargar las analíticas",
          );
        }
      } finally {
        if (!cancelled) {
          setDashboardLoading(false);
        }
      }
    };

    void loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [blockingFullPage, period]);

  const rangeLabel = dashboard ? getDashboardRangeLabel(dashboard) : getDateRangeLabel(period);
  const rangeTitle = dashboard
    ? getDashboardPeriodTitle(dashboard.range.days)
    : getPeriodLabel(period);
  const generalKpis = dashboard ? mapDashboardGeneralKpis(dashboard) : null;
  const generalActivity = dashboard ? mapDashboardToGeneralActivity(dashboard) : [];
  const reviewsStatus = dashboard ? mapDashboardToReviewsStatus(dashboard) : [];

  if (blockingFullPage) {
    return <AdminPageLoading layout="viewport" />;
  }

  return (
    <div className="flex flex-col gap-8 pb-12">
      <PageHeader
        title="Analíticas"
        subtitle={`Resumen operativo del catálogo, reseñas, promociones y actividad de usuarios — ${rangeTitle.toLowerCase()}.`}
      >
        <DateRangeFilter period={period} onChange={setPeriod} rangeLabel={rangeLabel} />
      </PageHeader>

      {dashboardError ? (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-100"
        >
          {dashboardError}
        </div>
      ) : null}

      {dashboard?.notes?.length ? (
        <div className="rounded-2xl border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          {dashboard.notes.map((note) => (
            <p key={note} className="m-0">
              {note}
            </p>
          ))}
        </div>
      ) : null}

      {dashboardLoading || !generalKpis ? (
        <AdminPageLoading layout="section" />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <AdminMetricCard
              context="analytics-sessions"
              label="Nuevos usuarios"
              value={formatCompact(generalKpis.usuariosActivos)}
              helper={`${formatCompact(generalKpis.eventosSesion)} eventos de sesión`}
            />
            <AdminMetricCard
              context="reviews-total"
              label="Reseñas en el periodo"
              value={String(generalKpis.resenasTotales)}
              helper={`${generalKpis.tasaAprobacionResenas}% de aprobación`}
            />
            <AdminMetricCard
              context="promotions-active"
              label="Promociones activas"
              value={String(generalKpis.promocionesActivas)}
              helper="Campañas vigentes en catálogo"
            />
            <AdminMetricCard
              context="products-active"
              label="Productos activos"
              value={String(generalKpis.productosActivos)}
              helper={
                generalKpis.stockBajo > 0
                  ? `${generalKpis.stockBajo} con stock bajo`
                  : "Stock dentro de rangos normales"
              }
            />
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
            <GeneralActivityChart
              data={generalActivity}
              rangeLabel={rangeTitle}
              secondaryLineLabel="Nuevos usuarios"
            />
            <GeneralReviewsStatusChart data={reviewsStatus} />
          </div>

          {dashboard && dashboard.topProductsByReviewsInRange.length > 0 ? (
            <Card className="rounded-3xl">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  Productos con más reseñas en el periodo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="divide-y divide-border">
                  {dashboard.topProductsByReviewsInRange.map((item) => (
                    <li
                      key={item.productId}
                      className="flex items-center justify-between py-3 text-sm"
                    >
                      <span className="font-medium">{item.nombre}</span>
                      <span className="text-muted-foreground">
                        {item.reviewCount} reseña{item.reviewCount === 1 ? "" : "s"}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ) : null}
        </>
      )}
    </div>
  );
}

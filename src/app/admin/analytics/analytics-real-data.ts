import type { AnalyticsDashboardData } from "@/services/admin";
import type {
  AnalyticsPeriod,
  GeneralActivityPoint,
  ReviewsStatusPoint,
} from "./analytics-types";

const STATUS_LABELS: Record<string, ReviewsStatusPoint["estado"]> = {
  PENDING: "Pendientes",
  APPROVED: "Aprobadas",
  REJECTED: "Rechazadas",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#f59e0b",
  APPROVED: "#10b981",
  REJECTED: "#ef4444",
};

export function periodToDays(period: AnalyticsPeriod): number {
  switch (period) {
    case "7d":
      return 7;
    case "30d":
      return 30;
    case "90d":
      return 90;
    case "1y":
      return 365;
    default:
      return 30;
  }
}

function formatChartDate(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00.000Z`);
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
  }).format(date);
}

function formatRangeLabel(from: string, to: string): string {
  const fmt = (value: string) =>
    new Intl.DateTimeFormat("es-MX", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(value));
  return `${fmt(from)} – ${fmt(to)}`;
}

export function mapDashboardToGeneralActivity(
  data: AnalyticsDashboardData,
): GeneralActivityPoint[] {
  const byDate = new Map<string, GeneralActivityPoint>();

  for (const point of data.series.sessionActivityByDay) {
    byDate.set(point.date, {
      periodo: formatChartDate(point.date),
      usuarios: point.count,
      resenas: 0,
      promociones: 0,
    });
  }

  for (const point of data.series.reviewsByDay) {
    const existing = byDate.get(point.date);
    if (existing) {
      existing.resenas = point.count;
    } else {
      byDate.set(point.date, {
        periodo: formatChartDate(point.date),
        usuarios: 0,
        resenas: point.count,
        promociones: 0,
      });
    }
  }

  for (const point of data.series.registrationsByDay) {
    const existing = byDate.get(point.date);
    if (existing) {
      existing.promociones = point.count;
    } else {
      byDate.set(point.date, {
        periodo: formatChartDate(point.date),
        usuarios: 0,
        resenas: 0,
        promociones: point.count,
      });
    }
  }

  return [...byDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, value]) => value);
}

export function mapDashboardToReviewsStatus(
  data: AnalyticsDashboardData,
): ReviewsStatusPoint[] {
  const total = data.distributions.reviewsByStatus.reduce(
    (sum, row) => sum + row.count,
    0,
  );

  if (total === 0) {
    return [];
  }

  return data.distributions.reviewsByStatus.map((row) => ({
    estado: STATUS_LABELS[row.status] ?? "Pendientes",
    valor: Math.round((row.count / total) * 100),
    color: STATUS_COLORS[row.status] ?? "#94a3b8",
  }));
}

export function mapDashboardGeneralKpis(data: AnalyticsDashboardData) {
  const { kpis } = data;
  const approvalRate =
    kpis.reviewsTotalInRange > 0
      ? Math.round(
          (kpis.reviewsApprovedInRange / kpis.reviewsTotalInRange) * 100,
        )
      : 0;

  return {
    usuariosActivos: kpis.newUsersInRange,
    eventosSesion: kpis.sessionActivityEvents,
    resenasTotales: kpis.reviewsTotalInRange,
    tasaAprobacionResenas: approvalRate,
    promocionesActivas: kpis.promotionsActive,
    productosActivos: kpis.productsActive,
    stockBajo: kpis.productsLowStock,
    resenasPendientes: kpis.reviewsPending,
  };
}

export function getDashboardRangeLabel(data: AnalyticsDashboardData): string {
  return formatRangeLabel(data.range.from, data.range.to);
}

export function getDashboardPeriodTitle(days: number): string {
  if (days === 7) return "7 días";
  if (days === 30) return "30 días";
  if (days === 90) return "90 días";
  if (days >= 365) return "12 meses";
  return `${days} días`;
}

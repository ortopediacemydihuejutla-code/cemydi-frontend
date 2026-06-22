export type AnalyticsPeriod = "7d" | "30d" | "90d" | "1y";

export type GeneralActivityPoint = {
  periodo: string;
  usuarios: number;
  resenas: number;
  promociones: number;
};

export type ReviewsStatusPoint = {
  estado: "Aprobadas" | "Pendientes" | "Rechazadas";
  valor: number;
  color: string;
};

export function formatCompact(n: number): string {
  return new Intl.NumberFormat("es-MX", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
}

export function getPeriodLabel(period: AnalyticsPeriod): string {
  if (period === "7d") return "7 días";
  if (period === "30d") return "30 días";
  if (period === "90d") return "90 días";
  return "12 meses";
}

export function getDateRangeLabel(period: AnalyticsPeriod): string {
  const now = new Date();
  const daysBack =
    period === "7d" ? 7 : period === "30d" ? 30 : period === "90d" ? 90 : 365;
  const start = new Date(now);
  start.setDate(now.getDate() - daysBack);
  const fmt = (d: Date) =>
    new Intl.DateTimeFormat("es-MX", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(d);
  return `${fmt(start)} – ${fmt(now)}`;
}

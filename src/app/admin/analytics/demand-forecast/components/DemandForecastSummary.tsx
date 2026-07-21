import {
  type DemandForecast,
  getDemandDifference,
  getDemandStatus,
} from "@/data/demand-forecast";
import { AdminMetricCard } from "@/features/admin/components/admin-metric-card";

export function DemandForecastSummary({
  forecasts,
}: {
  forecasts: DemandForecast[];
}) {
  const totalDemand = forecasts.reduce(
    (total, forecast) => total + forecast.predictedDemand,
    0,
  );
  const shortages = forecasts.filter(
    (forecast) => getDemandDifference(forecast) > 0,
  ).length;
  const highDemand = forecasts.filter(
    (forecast) =>
      getDemandStatus(forecast.currentStock, forecast.predictedDemand) ===
      "Alta demanda",
  ).length;

  return (
    <section aria-label="Resumen de demanda" className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <AdminMetricCard
        context="demand-products"
        label="Productos analizados"
        value={String(forecasts.length)}
        helper="Productos incluidos en la estimación"
      />
      <AdminMetricCard
        context="demand-total"
        label="Demanda total estimada"
        value={String(totalDemand)}
        helper="Unidades previstas para el próximo mes"
      />
      <AdminMetricCard
        context="demand-shortage"
        label="Productos con posible faltante"
        value={String(shortages)}
        helper="Demanda prevista superior al stock"
      />
      <AdminMetricCard
        context="demand-high"
        label="Productos con demanda alta"
        value={String(highDemand)}
        helper="Faltante previsto de 10 unidades o más"
      />
    </section>
  );
}

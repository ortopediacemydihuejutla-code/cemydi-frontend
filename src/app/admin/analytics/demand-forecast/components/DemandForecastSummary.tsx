import {
  type DemandForecast,
  getDemandStatus,
} from "@/data/demand-forecast";
import { AdminMetricCard } from "@/features/admin/components/admin-metric-card";
import type { DemandForecastData } from "@/services/admin/types";

function formatForecastMonth(value: string | null) {
  if (!value) return "Sin datos";
  return new Intl.DateTimeFormat("es-MX", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}-01T00:00:00Z`));
}

function formatCalculationDate(value: string) {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function DemandForecastSummary({
  forecasts,
  model,
  generatedAt,
}: {
  forecasts: DemandForecast[];
  model: DemandForecastData["model"];
  generatedAt: string;
}) {
  const totalDemand = forecasts.reduce(
    (total, forecast) => total + forecast.predictedDemand,
    0,
  );
  const shortages = forecasts.filter(
    (forecast) =>
      getDemandStatus(forecast.currentStock, forecast.predictedDemand) ===
      "Posible faltante",
  ).length;
  const criticalShortages = forecasts.filter(
    (forecast) =>
      getDemandStatus(forecast.currentStock, forecast.predictedDemand) ===
      "Faltante crítico",
  ).length;

  const modelDetails = [
    {
      label: "Registros históricos",
      value: model.historicalRows.toLocaleString("es-MX"),
    },
    {
      label: "Entrenamiento de evaluación",
      value: model.trainingRows.toLocaleString("es-MX"),
    },
    {
      label: "Registros de validación",
      value: model.validationRows.toLocaleString("es-MX"),
    },
    {
      label: "Ajuste final del pronóstico",
      value: model.finalTrainingRows.toLocaleString("es-MX"),
    },
    {
      label: "Meses históricos",
      value: model.historicalMonths.toLocaleString("es-MX"),
    },
    {
      label: "Meses de validación",
      value: model.validationMonths.toLocaleString("es-MX"),
    },
    {
      label: "Mes pronosticado",
      value: formatForecastMonth(model.forecastMonth),
    },
    { label: "Modelo", value: model.name },
    {
      label: "R² de validación",
      value: model.r2.toFixed(3),
      helper: "Proporción de variabilidad explicada por el modelo.",
    },
    {
      label: "MAE de validación",
      value: `${model.mae.toFixed(2)} unidades`,
      helper: "Diferencia absoluta promedio respecto de la demanda real.",
    },
    {
      label: "RMSE de validación",
      value: `${model.rmse.toFixed(2)} unidades`,
      helper: "Error que penaliza con mayor fuerza las desviaciones grandes.",
    },
    {
      label: "Fecha y hora del cálculo",
      value: formatCalculationDate(generatedAt),
    },
  ] as const;

  return (
    <div className="space-y-5">
      <section
        aria-label="Resumen de demanda"
        className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
      >
        <AdminMetricCard
          context="demand-products"
          label="Productos analizados"
          value={String(forecasts.length)}
          helper="Productos activos incluidos en la estimación"
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
          helper="Demanda prevista superior al stock vigente"
        />
        <AdminMetricCard
          context="demand-high"
          label="Productos con faltante crítico"
          value={String(criticalShortages)}
          helper="Diferencia contra stock de 10 unidades o más"
        />
      </section>

      <section
        aria-labelledby="forecast-model-title"
        className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6"
      >
        <div>
          <h2
            id="forecast-model-title"
            className="text-lg font-semibold text-foreground"
          >
            Información del pronóstico
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Las métricas se calculan con los últimos {model.validationMonths}{" "}
            meses, equivalentes a{" "}
            {model.validationRows.toLocaleString("es-MX")} registros, que no
            participaron en el entrenamiento de evaluación. Después de evaluar
            el modelo, se realiza un ajuste final con los{" "}
            {model.finalTrainingRows.toLocaleString("es-MX")} registros
            históricos para generar el pronóstico.
          </p>
          <div className="mt-3 space-y-1 text-sm text-muted-foreground">
            <p>
              Historial disponible hasta:{" "}
              <span className="font-medium text-foreground">
                {formatForecastMonth(model.historicalThrough)}
              </span>
              .
            </p>
            <p>
              Periodo de validación:{" "}
              <span className="font-medium text-foreground">
                {formatForecastMonth(model.validationFrom)} a{" "}
                {formatForecastMonth(model.validationTo)}
              </span>
              .
            </p>
          </div>
        </div>
        <dl className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {modelDetails.map(({ label, value, ...detail }) => (
            <div key={label} className="min-w-0 rounded-xl bg-muted/45 p-4">
              <dt className="text-xs font-medium text-muted-foreground">
                {label}
              </dt>
              <dd className="mt-1 break-words text-sm font-semibold text-foreground">
                {value}
              </dd>
              {"helper" in detail ? (
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {detail.helper}
                </p>
              ) : null}
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}

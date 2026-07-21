import { ArrowUpRight, PackageSearch } from "lucide-react";

import {
  type DemandForecast,
  getDemandDifference,
} from "@/data/demand-forecast";

export function HighDemandProducts({
  forecasts,
}: {
  forecasts: DemandForecast[];
}) {
  const prioritizedProducts = [...forecasts]
    .sort((left, right) => right.predictedDemand - left.predictedDemand)
    .slice(0, 4);

  return (
    <section
      aria-labelledby="high-demand-title"
      className="h-full rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6"
    >
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-500/12 text-amber-700 dark:text-amber-200">
          <PackageSearch className="size-5" aria-hidden="true" />
        </span>
        <div>
          <h2 id="high-demand-title" className="text-lg font-semibold text-foreground">
            Productos con mayor demanda
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Prioridades ordenadas por unidades estimadas.
          </p>
        </div>
      </div>

      <ol className="mt-5 divide-y divide-border">
        {prioritizedProducts.map((forecast, index) => {
          const difference = getDemandDifference(forecast);

          return (
            <li key={forecast.id} className="flex gap-3 py-4 first:pt-0 last:pb-0">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="font-medium leading-snug text-foreground">
                  {forecast.productName}
                </h3>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span>Stock: {forecast.currentStock}</span>
                  <span>Demanda: {forecast.predictedDemand}</span>
                  <span className={difference > 0 ? "font-semibold text-amber-700 dark:text-amber-200" : ""}>
                    Diferencia: {difference > 0 ? "+" : ""}{difference}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-foreground">
                  {forecast.recommendation}
                </p>
              </div>
              <ArrowUpRight className="mt-1 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            </li>
          );
        })}
      </ol>
    </section>
  );
}

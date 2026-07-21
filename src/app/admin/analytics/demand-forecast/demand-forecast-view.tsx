"use client";

import { CheckCircle2, Lightbulb } from "lucide-react";

import { demandForecast } from "@/data/demand-forecast";
import { PageHeader } from "@/features/admin/components/page-header";

import { DemandForecastChart } from "./components/DemandForecastChart";
import { DemandForecastSummary } from "./components/DemandForecastSummary";
import { DemandForecastTable } from "./components/DemandForecastTable";
import { HighDemandProducts } from "./components/HighDemandProducts";

const administrativeBenefits = [
  "Anticipar posibles faltantes.",
  "Planear compras a proveedores.",
  "Mejorar la disponibilidad de productos.",
  "Evitar exceso de inventario.",
  "Preparar promociones o rentas.",
  "Apoyar la toma de decisiones.",
];

export function DemandForecastView() {
  return (
    <div className="flex flex-col gap-8 pb-12">
      <PageHeader
        title="Predicción de demanda de productos"
        subtitle="Estimación mensual de ventas y rentas para apoyar la reposición de inventario."
      />

      <DemandForecastSummary forecasts={demandForecast} />

      <div className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="min-w-0 xl:col-span-7">
          <DemandForecastChart forecasts={demandForecast} />
        </div>
        <div className="min-w-0 xl:col-span-5">
          <HighDemandProducts forecasts={demandForecast} />
        </div>
      </div>

      <DemandForecastTable forecasts={demandForecast} />

      <section
        aria-labelledby="forecast-help-title"
        className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6"
      >
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            <Lightbulb className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h2 id="forecast-help-title" className="text-lg font-semibold text-foreground">
              ¿Cómo ayuda esta predicción?
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Convierte la demanda prevista en decisiones concretas de abastecimiento y operación.
            </p>
          </div>
        </div>

        <ul className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
          {administrativeBenefits.map((benefit) => (
            <li key={benefit} className="flex items-start gap-3 text-sm text-foreground">
              <CheckCircle2
                className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-300"
                aria-hidden="true"
              />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

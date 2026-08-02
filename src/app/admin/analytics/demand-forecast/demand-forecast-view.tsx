"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Lightbulb, RefreshCw } from "lucide-react";

import { PageHeader } from "@/features/admin/components/page-header";
import { Button } from "@/features/admin/components/ui/button";
import { getDemandForecast } from "@/services/admin/analytics";
import type { DemandForecastData } from "@/services/admin/types";

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
  const [data, setData] = useState<DemandForecastData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setData(await getDemandForecast());
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "No se pudo calcular la demanda.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex flex-col gap-8 pb-12">
        <PageHeader
          title="Predicción de demanda de productos"
          subtitle="Calculando el modelo con el historial operacional registrado…"
        />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-36 animate-pulse rounded-2xl border border-border bg-card"
            />
          ))}
        </div>
        <div className="h-[420px] animate-pulse rounded-2xl border border-border bg-card" />
      </div>
    );
  }

  if (!data || error) {
    return (
      <div className="flex flex-col gap-8 pb-12">
        <PageHeader
          title="Predicción de demanda de productos"
          subtitle="Estimación mensual basada en ventas, rentas, interacciones e inventario."
        />
        <section className="rounded-2xl border border-red-500/20 bg-card p-8 text-center">
          <p className="font-medium text-foreground">
            No se pudo calcular el pronóstico.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          <Button className="mt-5" onClick={() => void load()}>
            <RefreshCw />
            Reintentar
          </Button>
        </section>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-12">
      <PageHeader
        title="Predicción de demanda de productos"
        subtitle="Estimación mensual de ventas y rentas calculada con el historial operacional registrado."
      >
        <Button variant="outline" onClick={() => void load()}>
          <RefreshCw />
          Recalcular
        </Button>
      </PageHeader>

      <DemandForecastSummary
        forecasts={data.forecasts}
        model={data.model}
        generatedAt={data.generatedAt}
      />

      <div className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="min-w-0 xl:col-span-7">
          <DemandForecastChart forecasts={data.forecasts} />
        </div>
        <div className="min-w-0 xl:col-span-5">
          <HighDemandProducts forecasts={data.forecasts} />
        </div>
      </div>

      <DemandForecastTable forecasts={data.forecasts} />

      <section
        aria-labelledby="forecast-help-title"
        className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6"
      >
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            <Lightbulb className="size-5" />
          </span>
          <div>
            <h2
              id="forecast-help-title"
              className="text-lg font-semibold text-foreground"
            >
              ¿Cómo ayuda esta predicción?
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Convierte la demanda prevista en decisiones concretas de
              abastecimiento y operación.
            </p>
          </div>
        </div>
        <ul className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
          {administrativeBenefits.map((benefit) => (
            <li
              key={benefit}
              className="flex items-start gap-3 text-sm text-foreground"
            >
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-300" />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

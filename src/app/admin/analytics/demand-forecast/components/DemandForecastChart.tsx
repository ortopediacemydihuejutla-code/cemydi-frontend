"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { DemandForecast } from "@/data/demand-forecast";

const tooltipStyle = {
  borderRadius: "12px",
  border: "1px solid var(--border-soft)",
  backgroundColor: "var(--card)",
};

export function DemandForecastChart({
  forecasts,
}: {
  forecasts: DemandForecast[];
}) {
  return (
    <section
      aria-labelledby="forecast-chart-title"
      className="h-full min-w-0 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6"
    >
      <div>
        <h2 id="forecast-chart-title" className="text-lg font-semibold text-foreground">
          Stock actual vs. demanda estimada
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Comparación de unidades disponibles y requeridas por producto.
        </p>
      </div>

      <div
        className="mt-5 h-[420px] min-w-0 w-full"
        aria-label="Gráfica comparativa de stock y demanda por producto"
      >
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <BarChart
            data={forecasts}
            layout="vertical"
            margin={{ top: 8, right: 10, left: 6, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              horizontal={false}
              stroke="var(--border-soft)"
              opacity={0.6}
            />
            <XAxis
              type="number"
              allowDecimals={false}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "var(--text-muted)" }}
            />
            <YAxis
              type="category"
              dataKey="shortName"
              width={112}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "var(--text-muted)" }}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              cursor={{ fill: "var(--muted)", opacity: 0.4 }}
              formatter={(value, name) => [
                `${Number(value ?? 0)} unidades`,
                String(name),
              ]}
              labelFormatter={(_, payload) =>
                payload[0]?.payload?.productName ?? "Producto"
              }
            />
            <Legend verticalAlign="top" height={36} iconType="circle" />
            <Bar
              dataKey="currentStock"
              name="Stock actual"
              fill="#94a3b8"
              radius={[0, 5, 5, 0]}
              maxBarSize={14}
            />
            <Bar
              dataKey="predictedDemand"
              name="Demanda estimada"
              fill="var(--brand-600)"
              radius={[0, 5, 5, 0]}
              maxBarSize={14}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

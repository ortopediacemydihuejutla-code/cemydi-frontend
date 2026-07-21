"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import {
  productClusterDefinitions,
  type ProductCluster,
  type ProductClusterCode,
} from "@/data/product-clusters";

const tooltipStyle = {
  borderRadius: "12px",
  border: "1px solid var(--border-soft)",
  backgroundColor: "var(--card)",
};

export function ProductClusterChart({ products }: { products: ProductCluster[] }) {
  const data = (Object.keys(productClusterDefinitions) as ProductClusterCode[]).map((code) => ({
    code,
    name: productClusterDefinitions[code].name,
    products: products.filter((product) => product.cluster === code).length,
    color: productClusterDefinitions[code].chartColor,
  }));

  return (
    <section
      aria-labelledby="cluster-distribution-title"
      className="h-full min-w-0 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6"
    >
      <div>
        <h2 id="cluster-distribution-title" className="text-lg font-semibold text-foreground">
          Distribución de productos
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Cantidad de productos asignados a cada segmento.
        </p>
      </div>

      <div className="mt-5 h-80 min-w-0 w-full" aria-label="Gráfica de productos por segmento">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--border-soft)"
              opacity={0.6}
            />
            <XAxis
              dataKey="code"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "var(--text-muted)" }}
              dy={8}
            />
            <YAxis
              allowDecimals={false}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "var(--text-muted)" }}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              cursor={{ fill: "var(--muted)", opacity: 0.45 }}
              formatter={(value) => [`${Number(value ?? 0)} productos`, "Total"]}
              labelFormatter={(code) => {
                const definition = productClusterDefinitions[code as ProductClusterCode];
                return definition ? `${code} · ${definition.name}` : String(code);
              }}
            />
            <Bar dataKey="products" name="Productos" radius={[7, 7, 0, 0]} maxBarSize={68}>
              {data.map((entry) => (
                <Cell key={entry.code} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

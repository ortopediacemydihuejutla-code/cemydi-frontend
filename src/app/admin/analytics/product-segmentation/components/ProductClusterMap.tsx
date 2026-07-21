"use client";

import {
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";

import {
  productClusterDefinitions,
  type ProductCluster,
  type ProductClusterCode,
} from "@/data/product-clusters";

type SegmentMapPoint = {
  productName: string;
  cluster: ProductClusterCode;
  revenue: number;
  movement: number;
  stock: number;
};

type SegmentMapTooltipProps = {
  active?: boolean;
  payload?: Array<{ payload?: SegmentMapPoint }>;
};

const currencyFormatter = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

const compactCurrencyFormatter = new Intl.NumberFormat("es-MX", {
  notation: "compact",
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

function SegmentMapTooltip({ active, payload }: SegmentMapTooltipProps) {
  const point = payload?.[0]?.payload;

  if (!active || !point) return null;

  const cluster = productClusterDefinitions[point.cluster];

  return (
    <div className="max-w-72 rounded-xl border border-border bg-card p-3 text-sm shadow-lg">
      <p className="font-semibold text-foreground">{point.productName}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        {point.cluster} · {cluster.name}
      </p>
      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
        <dt className="text-muted-foreground">Ingresos</dt>
        <dd className="text-right font-medium text-foreground">
          {currencyFormatter.format(point.revenue)}
        </dd>
        <dt className="text-muted-foreground">Movimiento</dt>
        <dd className="text-right font-medium text-foreground">{point.movement}</dd>
        <dt className="text-muted-foreground">Stock</dt>
        <dd className="text-right font-medium text-foreground">{point.stock}</dd>
      </dl>
    </div>
  );
}

export function ProductClusterMap({ products }: { products: ProductCluster[] }) {
  const points = products.map<SegmentMapPoint>((product) => ({
    productName: product.productName,
    cluster: product.cluster,
    revenue: product.generatedRevenue,
    movement: product.soldQuantity + product.rentedQuantity,
    stock: product.stock,
  }));

  return (
    <section
      aria-labelledby="cluster-map-title"
      className="h-full min-w-0 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div>
          <h2 id="cluster-map-title" className="text-lg font-semibold text-foreground">
            Mapa de segmentos
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Ingresos frente al movimiento comercial de cada producto.
          </p>
        </div>
        <p className="shrink-0 text-xs text-muted-foreground">
          Tamaño del punto: stock
        </p>
      </div>

      <div className="mt-5 h-80 min-w-0 w-full" aria-label="Mapa de productos por segmento">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <ScatterChart margin={{ top: 8, right: 12, left: 4, bottom: 8 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border-soft)"
              opacity={0.6}
            />
            <XAxis
              type="number"
              dataKey="revenue"
              name="Ingresos"
              tickFormatter={(value) => compactCurrencyFormatter.format(Number(value))}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "var(--text-muted)" }}
              label={{
                value: "Ingresos generados",
                position: "insideBottom",
                offset: -6,
                fill: "var(--text-muted)",
                fontSize: 11,
              }}
            />
            <YAxis
              type="number"
              dataKey="movement"
              name="Movimiento"
              allowDecimals={false}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "var(--text-muted)" }}
              label={{
                value: "Ventas + rentas",
                angle: -90,
                position: "insideLeft",
                fill: "var(--text-muted)",
                fontSize: 11,
              }}
            />
            <ZAxis type="number" dataKey="stock" range={[70, 320]} name="Stock" />
            <Tooltip
              cursor={{ strokeDasharray: "3 3", stroke: "var(--text-muted)" }}
              content={<SegmentMapTooltip />}
            />
            <Legend
              verticalAlign="top"
              align="right"
              height={34}
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 12 }}
            />
            {(Object.keys(productClusterDefinitions) as ProductClusterCode[]).map((code) => (
              <Scatter
                key={code}
                name={code}
                data={points.filter((point) => point.cluster === code)}
                fill={productClusterDefinitions[code].chartColor}
              />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

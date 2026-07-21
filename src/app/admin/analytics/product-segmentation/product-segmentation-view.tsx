"use client";

import { ArrowRight, Boxes } from "lucide-react";

import {
  productClusterDefinitions,
  productClusters,
  type ProductClusterCode,
} from "@/data/product-clusters";
import { PageHeader } from "@/features/admin/components/page-header";

import { ProductClusterChart } from "./components/ProductClusterChart";
import { ProductClusterMap } from "./components/ProductClusterMap";
import { ProductClusterSummary } from "./components/ProductClusterSummary";
import { ProductClusterTable } from "./components/ProductClusterTable";

const clusterCounts = productClusters.reduce<Record<ProductClusterCode, number>>(
  (counts, product) => {
    counts[product.cluster] += 1;
    return counts;
  },
  { C1: 0, C2: 0, C3: 0, C4: 0 },
);

export function ProductSegmentationView() {
  return (
    <div className="flex flex-col gap-8 pb-12">
      <PageHeader
        title="Segmentación de productos"
        subtitle="Agrupación de productos según ventas, rentas, consultas, stock e ingresos generados."
      />

      <div className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="min-w-0 xl:col-span-8">
          <ProductClusterMap products={productClusters} />
        </div>
        <div className="min-w-0 xl:col-span-4">
          <ProductClusterChart products={productClusters} />
        </div>
      </div>

      <ProductClusterSummary counts={clusterCounts} />

      <ProductClusterTable products={productClusters} />

      <section
        aria-labelledby="cluster-help-title"
        className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6"
      >
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <Boxes className="size-5" aria-hidden="true" />
            </span>
            <div>
              <h2 id="cluster-help-title" className="text-lg font-semibold text-foreground">
                ¿Cómo ayuda esta agrupación?
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Convierte el comportamiento comercial en prioridades claras para inventario y operación.
              </p>
            </div>
          </div>

          <ul className="mt-6 divide-y divide-border">
            {(Object.keys(productClusterDefinitions) as ProductClusterCode[]).map((code) => {
              const cluster = productClusterDefinitions[code];

              return (
                <li key={code} className="flex gap-3 py-4 first:pt-0 last:pb-0">
                  <span className="mt-0.5 font-semibold text-primary">{code}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground">{cluster.name}</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {cluster.action}
                    </p>
                  </div>
                  <ArrowRight
                    className="mt-1 size-4 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                </li>
              );
            })}
          </ul>
      </section>
    </div>
  );
}

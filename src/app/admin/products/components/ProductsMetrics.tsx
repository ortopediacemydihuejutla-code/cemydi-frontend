"use client";

import { AdminMetricCard } from "@/features/admin/components/admin-metric-card";
import type { ProductsAdminState } from "../hooks/useProducts";

type ProductsMetricsProps = {
  state: Pick<ProductsAdminState, "activeProducts" | "totalStock" | "recipeProducts">;
};

export function ProductsMetrics({ state }: ProductsMetricsProps) {
  const { activeProducts, totalStock, recipeProducts } = state;

  return (
    <section className="grid gap-4 md:grid-cols-3">
      <AdminMetricCard
        context="products-active"
        label="Productos activos"
        value={activeProducts}
      />
      <AdminMetricCard context="products-stock" label="Inventario total" value={totalStock} />
      <AdminMetricCard
        context="products-recipe"
        label="Requieren receta"
        value={recipeProducts}
      />
    </section>
  );
}

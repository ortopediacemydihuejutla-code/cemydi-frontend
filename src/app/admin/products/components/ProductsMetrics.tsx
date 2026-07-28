"use client";

import { AdminMetricCard } from "@/features/admin/components/admin-metric-card";
import type { ProductsAdminState } from "../hooks/useProducts";

type ProductsMetricsProps = {
  state: Pick<ProductsAdminState, "activeProducts" | "totalStock" | "recipeProducts">;
  loading?: boolean;
};

export function ProductsMetrics({ state, loading = false }: ProductsMetricsProps) {
  const { activeProducts, totalStock, recipeProducts } = state;

  return (
    <section className="grid gap-4 md:grid-cols-3" aria-busy={loading}>
      <AdminMetricCard
        context="products-active"
        label="Productos activos"
        value={loading ? "—" : activeProducts}
      />
      <AdminMetricCard
        context="products-stock"
        label="Inventario total"
        value={loading ? "—" : totalStock}
      />
      <AdminMetricCard
        context="products-recipe"
        label="Requieren receta"
        value={loading ? "—" : recipeProducts}
      />
    </section>
  );
}

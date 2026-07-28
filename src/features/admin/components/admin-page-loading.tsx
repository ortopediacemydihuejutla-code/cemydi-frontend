import {
  AdminCardListSkeleton,
  AdminChartGridSkeleton,
  AdminFormSkeleton,
  AdminTableSkeleton,
} from "@/features/admin/components/admin-content-skeletons";
import { AdminMetricCard } from "@/features/admin/components/admin-metric-card";
import { Skeleton } from "@/features/admin/components/ui/skeleton";
import { cn } from "@/features/admin/lib/utils";

export type AdminLoadingVariant =
  | "about"
  | "analytics"
  | "analytics-charts"
  | "catalog"
  | "dashboard"
  | "database"
  | "legal"
  | "product-form"
  | "products"
  | "promotions"
  | "rentals"
  | "reviews"
  | "suppliers"
  | "users";

type AdminPageLoadingProps = {
  variant?: AdminLoadingVariant;
  className?: string;
};

function PageHeadingSkeleton() {
  return (
    <div className="space-y-3" aria-hidden="true">
      <Skeleton className="h-8 w-56 max-w-2/3" />
      <Skeleton className="h-4 w-[34rem] max-w-full" />
    </div>
  );
}

function PendingMetricCards({ variant }: { variant: AdminLoadingVariant }) {
  if (variant === "products") {
    return (
      <section className="grid gap-4 md:grid-cols-3" aria-busy="true">
        <AdminMetricCard context="products-active" label="Productos activos" value="—" />
        <AdminMetricCard context="products-stock" label="Inventario total" value="—" />
        <AdminMetricCard context="products-recipe" label="Requieren receta" value="—" />
      </section>
    );
  }

  if (variant === "promotions") {
    return (
      <section className="grid gap-4 md:grid-cols-3" aria-busy="true">
        <AdminMetricCard context="promotions-total" label="Total promociones" value="—" />
        <AdminMetricCard context="promotions-active" label="Activas" value="—" />
        <AdminMetricCard context="promotions-scheduled" label="Programadas" value="—" />
      </section>
    );
  }

  if (variant === "database") {
    return (
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" aria-busy="true">
        <AdminMetricCard
          context="database-online"
          label="Estado de la base"
          value="—"
          helper="Versión no disponible"
        />
        <AdminMetricCard
          context="database-connections"
          label="Conexiones activas"
          value="—"
          helper="Resumen de uso de conexiones"
        />
        <AdminMetricCard
          context="database-tables"
          label="Tablas detectadas"
          value="—"
          helper="Registros estimados"
        />
        <AdminMetricCard
          context="database-alerts"
          label="Intentos fallidos"
          value="—"
          helper="Intentos recientes"
        />
      </section>
    );
  }

  if (variant === "analytics") {
    return (
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-busy="true">
        <AdminMetricCard
          context="analytics-sessions"
          label="Nuevos usuarios"
          value="—"
          helper="Actividad del periodo"
        />
        <AdminMetricCard
          context="reviews-total"
          label="Reseñas en el periodo"
          value="—"
          helper="Tasa de aprobación"
        />
        <AdminMetricCard
          context="promotions-active"
          label="Promociones activas"
          value="—"
          helper="Campañas vigentes en catálogo"
        />
        <AdminMetricCard
          context="products-active"
          label="Productos activos"
          value="—"
          helper="Estado actual del inventario"
        />
      </section>
    );
  }

  if (variant !== "dashboard") {
    return null;
  }

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-busy="true">
      <AdminMetricCard
        context="analytics-sessions"
        label="Nuevos usuarios"
        value="—"
        helper="Últimos 30 días"
      />
      <AdminMetricCard
        context="analytics-sessions"
        label="Actividad de sesión"
        value="—"
        helper="Eventos registrados en el periodo"
      />
      <AdminMetricCard
        context="products-active"
        label="Productos activos"
        value="—"
        helper="En catálogo y visibles"
      />
      <AdminMetricCard
        context="reviews-pending"
        label="Reseñas pendientes"
        value="—"
        helper="Esperando moderación"
      />
    </section>
  );
}

export function AdminPageLoading({
  variant = "dashboard",
  className,
}: AdminPageLoadingProps) {
  if (variant === "analytics-charts") {
    return <AdminChartGridSkeleton count={2} className={className} />;
  }

  const isForm =
    variant === "about" || variant === "legal" || variant === "product-form";
  const isCardList = variant === "promotions";

  return (
    <div
      className={cn("w-full min-w-0 space-y-6", className)}
      role="status"
      aria-label="Cargando información del panel"
      aria-busy="true"
    >
      <PageHeadingSkeleton />

      {!isForm ? <PendingMetricCards variant={variant} /> : null}

      {isForm ? (
        <AdminFormSkeleton />
      ) : variant === "analytics" ? (
        <AdminChartGridSkeleton />
      ) : isCardList ? (
        <AdminCardListSkeleton />
      ) : (
        <AdminTableSkeleton
          columns={variant === "users" ? 6 : 5}
          showAvatar={variant === "users" || variant === "products"}
        />
      )}
    </div>
  );
}

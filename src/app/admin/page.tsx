"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Package,
  Users,
  BarChart3,
  Tag,
  LayersPlus,
  Factory,
  MessageSquareText,
  Megaphone,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";

import {
  getAdminRecentActivity,
  getAnalyticsDashboard,
  type AdminActivityItem,
  type AnalyticsDashboardData,
} from "@/services/admin";
import { AdminMetricCard } from "@/features/admin/components/admin-metric-card";
import { AdminPageLoading } from "@/features/admin/components/admin-page-loading";
import { PageHeader } from "@/features/admin/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/features/admin/components/ui/card";
import { useAdminRouteGate } from "@/features/admin/hooks/use-admin-route-gate";

const QUICK_LINKS = [
  {
    label: "Productos",
    description: "Gestiona el catálogo de productos",
    href: "/admin/products",
    icon: Package,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10 dark:bg-emerald-400/12",
  },
  {
    label: "Categorías",
    description: "Organiza las categorías",
    href: "/admin/categories",
    icon: LayersPlus,
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-500/10 dark:bg-violet-400/12",
  },
  {
    label: "Marcas",
    description: "Administra las marcas registradas",
    href: "/admin/brands",
    icon: Tag,
    color: "text-sky-600 dark:text-sky-400",
    bg: "bg-sky-500/10 dark:bg-sky-400/12",
  },
  {
    label: "Proveedores",
    description: "Directorio de proveedores",
    href: "/admin/suppliers",
    icon: Factory,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10 dark:bg-amber-400/12",
  },
  {
    label: "Usuarios",
    description: "Gestiona cuentas de usuario",
    href: "/admin/users",
    icon: Users,
    color: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-500/10 dark:bg-rose-400/12",
  },
  {
    label: "Promociones",
    description: "Descuentos y ofertas activas",
    href: "/admin/promotions",
    icon: Megaphone,
    color: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-500/10 dark:bg-indigo-400/12",
  },
  {
    label: "Reseñas",
    description: "Modera las reseñas de clientes",
    href: "/admin/reviews",
    icon: MessageSquareText,
    color: "text-teal-600 dark:text-teal-400",
    bg: "bg-teal-500/10 dark:bg-teal-400/12",
  },
  {
    label: "Analytics",
    description: "Métricas operativas del catálogo",
    href: "/admin/analytics",
    icon: BarChart3,
    color: "text-fuchsia-600 dark:text-fuchsia-400",
    bg: "bg-fuchsia-500/10 dark:bg-fuchsia-400/12",
  },
];

type DashboardAlert = {
  id: string;
  type: "warning" | "info" | "success";
  title: string;
  description: string;
  href: string;
};

function buildDashboardAlerts(kpis: AnalyticsDashboardData["kpis"]): DashboardAlert[] {
  const alerts: DashboardAlert[] = [];

  if (kpis.productsLowStock > 0) {
    alerts.push({
      id: "low-stock",
      type: "warning",
      title: "Stock bajo",
      description: `${kpis.productsLowStock} producto${kpis.productsLowStock === 1 ? "" : "s"} con inventario menor a 5 unidades.`,
      href: "/admin/products",
    });
  }

  if (kpis.reviewsPending > 0) {
    alerts.push({
      id: "pending-reviews",
      type: "info",
      title: "Reseñas pendientes",
      description: `Hay ${kpis.reviewsPending} reseña${kpis.reviewsPending === 1 ? "" : "s"} esperando aprobación.`,
      href: "/admin/reviews",
    });
  }

  if (alerts.length === 0) {
    alerts.push({
      id: "all-clear",
      type: "success",
      title: "Sin alertas operativas",
      description: "No hay stock bajo ni reseñas pendientes en este momento.",
      href: "/admin/analytics",
    });
  }

  return alerts;
}

const ALERT_STYLES = {
  warning: {
    icon: AlertTriangle,
    iconColor: "text-amber-600 dark:text-amber-400",
    iconBg: "bg-amber-500/10 dark:bg-amber-400/12",
    bar: "bg-amber-400 dark:bg-amber-500",
  },
  info: {
    icon: Clock,
    iconColor: "text-sky-600 dark:text-sky-400",
    iconBg: "bg-sky-500/10 dark:bg-sky-400/12",
    bar: "bg-sky-400 dark:bg-sky-500",
  },
  success: {
    icon: CheckCircle2,
    iconColor: "text-emerald-600 dark:text-emerald-400",
    iconBg: "bg-emerald-500/10 dark:bg-emerald-400/12",
    bar: "bg-emerald-400 dark:bg-emerald-500",
  },
};

const ACTIVITY_STYLES: Record<
  AdminActivityItem["category"],
  { icon: typeof Package; iconColor: string; iconBg: string }
> = {
  product: {
    icon: Package,
    iconColor: "text-emerald-600 dark:text-emerald-400",
    iconBg: "bg-emerald-500/10 dark:bg-emerald-400/12",
  },
  user: {
    icon: Users,
    iconColor: "text-rose-600 dark:text-rose-400",
    iconBg: "bg-rose-500/10 dark:bg-rose-400/12",
  },
  review: {
    icon: MessageSquareText,
    iconColor: "text-teal-600 dark:text-teal-400",
    iconBg: "bg-teal-500/10 dark:bg-teal-400/12",
  },
  promotion: {
    icon: Megaphone,
    iconColor: "text-indigo-600 dark:text-indigo-400",
    iconBg: "bg-indigo-500/10 dark:bg-indigo-400/12",
  },
  supplier: {
    icon: Factory,
    iconColor: "text-amber-600 dark:text-amber-400",
    iconBg: "bg-amber-500/10 dark:bg-amber-400/12",
  },
};

function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 60) {
    return "Hace un momento";
  }

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) {
    return `Hace ${diffMin} min`;
  }

  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) {
    return `Hace ${diffHour} h`;
  }

  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) {
    return `Hace ${diffDay} d`;
  }

  return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

export default function AdminPage() {
  const { blockingFullPage } = useAdminRouteGate();
  const [dashboard, setDashboard] = useState<AnalyticsDashboardData | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const [activity, setActivity] = useState<AdminActivityItem[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [activityError, setActivityError] = useState<string | null>(null);

  useEffect(() => {
    if (blockingFullPage) {
      return;
    }

    let cancelled = false;

    const loadDashboard = async () => {
      setDashboardLoading(true);
      setDashboardError(null);

      try {
        const data = await getAnalyticsDashboard(30);
        if (!cancelled) {
          setDashboard(data);
        }
      } catch (error) {
        if (!cancelled) {
          setDashboard(null);
          setDashboardError(
            error instanceof Error ? error.message : "No se pudo cargar el resumen",
          );
        }
      } finally {
        if (!cancelled) {
          setDashboardLoading(false);
        }
      }
    };

    void loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [blockingFullPage]);

  useEffect(() => {
    if (blockingFullPage) {
      return;
    }

    let cancelled = false;

    const loadActivity = async () => {
      setActivityLoading(true);
      setActivityError(null);

      try {
        const data = await getAdminRecentActivity(12);
        if (!cancelled) {
          setActivity(data.items);
        }
      } catch (error) {
        if (!cancelled) {
          setActivity([]);
          setActivityError(
            error instanceof Error ? error.message : "No se pudo cargar la actividad",
          );
        }
      } finally {
        if (!cancelled) {
          setActivityLoading(false);
        }
      }
    };

    void loadActivity();

    return () => {
      cancelled = true;
    };
  }, [blockingFullPage]);

  const alerts = useMemo(
    () => (dashboard ? buildDashboardAlerts(dashboard.kpis) : []),
    [dashboard],
  );

  if (blockingFullPage) {
    return <AdminPageLoading layout="viewport" />;
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Inicio"
        subtitle="Bienvenido al panel de administración de Cemydi. Aquí tienes un resumen del estado general del sistema."
      />

      {dashboardError ? (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-100"
        >
          {dashboardError}
        </div>
      ) : null}

      {/* KPI Cards */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardLoading || !dashboard ? (
          <div className="col-span-full">
            <AdminPageLoading layout="section" />
          </div>
        ) : (
          <>
            <AdminMetricCard
              context="analytics-sessions"
              label="Nuevos usuarios"
              value={String(dashboard.kpis.newUsersInRange)}
              helper="Últimos 30 días"
            />
            <AdminMetricCard
              context="analytics-sessions"
              label="Actividad de sesión"
              value={String(dashboard.kpis.sessionActivityEvents)}
              helper="Eventos registrados en el periodo"
            />
            <AdminMetricCard
              context="products-active"
              label="Productos activos"
              value={String(dashboard.kpis.productsActive)}
              helper="En catálogo y visibles"
            />
            <AdminMetricCard
              context="reviews-pending"
              label="Reseñas pendientes"
              value={String(dashboard.kpis.reviewsPending)}
              helper="Esperando moderación"
            />
          </>
        )}
      </section>

      {/* Accesos rápidos + Alertas */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Accesos rápidos — ocupa 2 columnas */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <ShoppingBag className="size-4 text-(--text-muted)" />
                Accesos rápidos
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5 sm:px-6 sm:pb-6">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {QUICK_LINKS.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group flex flex-col items-center gap-2.5 rounded-2xl border border-(--border-soft) bg-(--surface) px-3 py-4 text-center transition-all duration-200 hover:border-(--brand-400) hover:bg-(--brand-50) hover:shadow-md dark:hover:bg-(--brand-950)"
                  >
                    <div
                      className={`flex size-10 items-center justify-center rounded-xl ${item.bg} transition-transform duration-200 group-hover:scale-110`}
                    >
                      <Icon className={`size-4.5 ${item.color}`} />
                    </div>
                    <div>
                      <p className="text-[0.8125rem] font-semibold leading-tight text-(--text-main)">
                        {item.label}
                      </p>
                      <p className="mt-0.5 text-[0.6875rem] leading-snug text-(--text-muted)">
                        {item.description}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Alertas */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="size-4 text-(--text-muted)" />
              Estado &amp; alertas
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 sm:px-6 sm:pb-6">
            {dashboardLoading ? (
              <AdminPageLoading layout="section" />
            ) : (
              <ul className="flex flex-col gap-3">
                {alerts.map((alert) => {
                  const styles = ALERT_STYLES[alert.type];
                  const Icon = styles.icon;
                  return (
                    <li key={alert.id}>
                      <Link
                        href={alert.href}
                        className="group flex items-start gap-3 rounded-xl border border-(--border-soft) bg-(--surface) p-3 transition-all duration-200 hover:border-(--brand-400) hover:shadow-sm"
                      >
                        <div
                          className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg ${styles.iconBg}`}
                        >
                          <Icon className={`size-3.5 ${styles.iconColor}`} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[0.8125rem] font-semibold leading-tight text-(--text-main)">
                            {alert.title}
                          </p>
                          <p className="mt-0.5 text-xs leading-relaxed text-(--text-muted)">
                            {alert.description}
                          </p>
                        </div>
                        <ArrowUpRight className="mt-0.5 size-3.5 shrink-0 text-(--text-muted) opacity-0 transition-opacity group-hover:opacity-100" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Actividad reciente */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="size-4 text-(--text-muted)" />
              Actividad reciente
            </CardTitle>
            <Link
              href="/admin/analytics"
              className="flex items-center gap-1 text-xs font-medium text-(--brand-600) hover:underline"
            >
              Ver analytics
              <ArrowUpRight className="size-3" />
            </Link>
          </div>
        </CardHeader>
        <CardContent className="px-5 pb-5 sm:px-6 sm:pb-6">
          {activityLoading ? (
            <AdminPageLoading layout="section" />
          ) : activityError ? (
            <p className="m-0 text-center text-sm text-red-600 dark:text-red-400">
              {activityError}
            </p>
          ) : activity.length === 0 ? (
            <p className="m-0 text-center text-sm text-(--text-muted)">
              No hay actividad registrada en los últimos 30 días.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {activity.map((item) => {
                const styles = ACTIVITY_STYLES[item.category];
                const Icon = styles.icon;
                return (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      className="group flex items-center gap-3 rounded-xl border border-(--border-soft) bg-(--surface) px-3 py-2.5 transition-all duration-200 hover:border-(--brand-400) hover:shadow-sm"
                    >
                      <div
                        className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${styles.iconBg}`}
                      >
                        <Icon className={`size-3.5 ${styles.iconColor}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[0.8125rem] font-medium text-(--text-main)">
                          {item.title}
                        </p>
                        <p className="text-xs text-(--text-muted)">
                          {formatRelativeTime(item.occurredAt)}
                        </p>
                      </div>
                      <ArrowUpRight className="size-3.5 shrink-0 text-(--text-muted) opacity-0 transition-opacity group-hover:opacity-100" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

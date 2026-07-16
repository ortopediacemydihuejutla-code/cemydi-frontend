"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Bell, CheckCircle2, ClipboardCheck, LoaderCircle, MessageSquareText, Package, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

import { getAnalyticsDashboard, listAdminRentals } from "@/services/admin";
import { buildAdminNotifications } from "@/features/admin/lib/admin-header-data";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const NOTIFICATIONS_QUERY_KEY = ["admin", "header-notifications"] as const;
const REFRESH_TOAST_ID = "admin-notifications-refresh";

async function loadAdminNotifications() {
  const [analytics, rentals] = await Promise.all([
    getAnalyticsDashboard(30),
    listAdminRentals({ status: "PENDING", page: 1, pageSize: 1 }),
  ]);

  return buildAdminNotifications({
    productsLowStock: analytics.kpis.productsLowStock,
    reviewsPending: analytics.kpis.reviewsPending,
    rentalsPending: rentals.counts.PENDING,
  });
}

const notificationStyles = {
  warning: { icon: Package, className: "bg-amber-500/12 text-amber-700 dark:text-amber-300" },
  info: { icon: ClipboardCheck, className: "bg-sky-500/12 text-sky-700 dark:text-sky-300" },
  success: { icon: CheckCircle2, className: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300" },
} as const;

export function AdminNotificationCenter() {
  const { data = [], isLoading, isFetching, error, refetch } = useQuery({
    queryKey: NOTIFICATIONS_QUERY_KEY,
    queryFn: loadAdminNotifications,
    staleTime: 60_000,
    refetchInterval: 120_000,
  });
  const actionableCount = data.filter((item) => item.actionable).length;

  const handleRefresh = async () => {
    toast.loading("Actualizando notificaciones…", { id: REFRESH_TOAST_ID });
    const result = await refetch();

    if (result.error) {
      toast.error("No se pudieron actualizar las notificaciones.", {
        id: REFRESH_TOAST_ID,
      });
      return;
    }

    toast.success("Notificaciones actualizadas.", { id: REFRESH_TOAST_ID });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="relative size-9 rounded-full text-[var(--brand-700)] hover:bg-[color-mix(in_srgb,var(--brand-600)_12%,transparent)] hover:text-[var(--brand-900)]"
          aria-label={actionableCount > 0 ? `Notificaciones, ${actionableCount} pendientes` : "Notificaciones"}
        >
          <Bell className="size-5" aria-hidden />
          {actionableCount > 0 ? (
            <span className="absolute right-0.5 top-0.5 inline-flex min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold leading-4 text-white" aria-hidden>
              {actionableCount > 9 ? "9+" : actionableCount}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[min(380px,calc(100vw-1rem))] overflow-hidden rounded-xl bg-[var(--card)] p-0 shadow-[var(--shadow-md)]">
        <div className="flex min-h-14 items-center justify-between gap-3 px-4 py-3">
          <div>
            <DropdownMenuLabel className="p-0 text-sm font-bold text-[var(--text-main)]">Notificaciones</DropdownMenuLabel>
            <p className="m-0 text-xs text-[var(--text-muted)]">
              {actionableCount > 0 ? `${actionableCount} asunto${actionableCount === 1 ? "" : "s"} por atender` : "Operación al día"}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 shrink-0 rounded-full"
            aria-label="Actualizar notificaciones"
            disabled={isFetching}
            onClick={(event) => {
              event.preventDefault();
              void handleRefresh();
            }}
          >
            <RefreshCw className={`size-4 ${isFetching ? "animate-spin" : ""}`} aria-hidden />
          </Button>
        </div>
        <DropdownMenuSeparator className="m-0" />

        <div className="min-h-[116px] p-1.5">
          {isLoading ? (
            <div className="flex min-h-[104px] items-center justify-center gap-2 text-sm text-[var(--text-muted)]" role="status">
              <LoaderCircle className="size-4 animate-spin" aria-hidden />
              Consultando alertas…
            </div>
          ) : error ? (
            <div className="grid min-h-[104px] place-items-center gap-2 px-4 py-3 text-center">
              <AlertTriangle className="size-5 text-amber-600" aria-hidden />
              <p className="m-0 text-sm text-[var(--text-muted)]">No pudimos cargar las notificaciones.</p>
              <Button type="button" size="sm" variant="outline" onClick={() => void handleRefresh()}>Reintentar</Button>
            </div>
          ) : (
            data.map((item) => {
              const styles = notificationStyles[item.tone];
              const Icon = item.id === "reviews-pending" ? MessageSquareText : styles.icon;

              return (
                <DropdownMenuItem key={item.id} asChild className="items-start rounded-lg p-0 focus:bg-[var(--surface)]">
                  <Link href={item.href} className="flex min-h-[68px] w-full items-start gap-3 px-3 py-2.5">
                    <span className={`mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-lg ${styles.className}`}>
                      <Icon className="size-4" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-[var(--text-main)]">{item.title}</span>
                      <span className="mt-0.5 block text-xs leading-5 text-[var(--text-muted)]">{item.description}</span>
                    </span>
                  </Link>
                </DropdownMenuItem>
              );
            })
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

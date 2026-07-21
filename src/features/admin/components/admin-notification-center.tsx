"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  Bell,
  BellOff,
  Check,
  ClipboardCheck,
  LoaderCircle,
  MessageSquareText,
  Package,
  RefreshCw,
  ShoppingBag,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

import { useAuth } from "@/providers/AuthContext";
import {
  getAdminNotifications,
  type AdminNotificationCategory,
  type AdminNotificationItem,
} from "@/services/admin";
import { formatNotificationTime } from "@/features/admin/lib/admin-header-data";
import { cn } from "@/features/admin/lib/utils";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const NOTIFICATIONS_QUERY_KEY = ["admin", "notifications"] as const;
const READ_STORAGE_PREFIX = "cemydi:admin-notifications:read";
const MAX_PERSISTED_READ_IDS = 250;
const MAX_INDIVIDUAL_TOASTS = 3;

type NotificationFilter = "all" | "unread";

const notificationStyles: Record<
  AdminNotificationCategory,
  {
    icon: typeof Bell;
    iconClassName: string;
    label: string;
  }
> = {
  rental: {
    icon: ClipboardCheck,
    iconClassName: "bg-sky-500/12 text-sky-700 dark:text-sky-300",
    label: "Renta",
  },
  review: {
    icon: MessageSquareText,
    iconClassName: "bg-violet-500/12 text-violet-700 dark:text-violet-300",
    label: "Reseña",
  },
  inventory: {
    icon: Package,
    iconClassName: "bg-amber-500/14 text-amber-700 dark:text-amber-300",
    label: "Inventario",
  },
  sale: {
    icon: ShoppingBag,
    iconClassName: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
    label: "Venta",
  },
};

function readStoredIds(storageKey: string) {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) ?? "[]");
    if (!Array.isArray(stored)) return new Set<string>();

    return new Set(
      stored.filter((value): value is string => typeof value === "string"),
    );
  } catch {
    return new Set<string>();
  }
}

function showNotificationToast(
  item: AdminNotificationItem,
  onOpen: () => void,
) {
  const styles = notificationStyles[item.category];
  const Icon = styles.icon;

  toast.custom(
    (currentToast) => (
      <div
        className={cn(
          "pointer-events-auto flex w-[min(400px,calc(100vw-32px))] items-start gap-3 rounded-2xl border border-[var(--border-soft)] bg-[var(--card)] p-3.5 text-[var(--text-main)] shadow-[0_18px_45px_rgba(15,42,50,0.2)] transition duration-200",
          currentToast.visible
            ? "translate-y-0 opacity-100"
            : "-translate-y-2 opacity-0",
        )}
        role="status"
      >
        <span
          className={cn(
            "inline-flex size-10 shrink-0 items-center justify-center rounded-xl",
            styles.iconClassName,
          )}
        >
          <Icon className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-5">{item.title}</p>
          <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-[var(--text-muted)]">
            {item.description}
          </p>
          <Link
            href={item.href}
            className="mt-2 inline-flex text-xs font-semibold text-[var(--brand-700)] hover:text-[var(--brand-900)] hover:underline"
            onClick={() => {
              onOpen();
              toast.dismiss(currentToast.id);
            }}
          >
            Ver detalle
          </Link>
        </div>
        <button
          type="button"
          className="inline-flex size-7 shrink-0 items-center justify-center rounded-full text-[var(--text-muted)] transition hover:bg-[var(--surface)] hover:text-[var(--text-main)]"
          aria-label="Cerrar notificación"
          onClick={() => toast.dismiss(currentToast.id)}
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>
    ),
    { id: `admin-notification-${item.id}`, duration: 6_500 },
  );
}

export function AdminNotificationCenter() {
  const { user } = useAuth();
  const [open, setOpen] = React.useState(false);
  const [activeFilter, setActiveFilter] =
    React.useState<NotificationFilter>("all");
  const [readIds, setReadIds] = React.useState<Set<string>>(() => new Set());
  const [readStateReady, setReadStateReady] = React.useState(false);
  const observedIdsRef = React.useRef<Set<string> | null>(null);
  const storageKey = `${READ_STORAGE_PREFIX}:${user?.id ?? "admin"}`;

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: NOTIFICATIONS_QUERY_KEY,
    queryFn: () => getAdminNotifications(40),
    enabled: user?.rol === "ADMIN",
    staleTime: 10_000,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  const items = React.useMemo(() => data?.items ?? [], [data]);

  React.useEffect(() => {
    setReadStateReady(false);
    observedIdsRef.current = null;
    setReadIds(readStoredIds(storageKey));
    setReadStateReady(true);
  }, [storageKey]);

  React.useEffect(() => {
    if (!readStateReady) return;

    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify([...readIds].slice(-MAX_PERSISTED_READ_IDS)),
      );
    } catch {
      // La navegación sigue funcionando si el almacenamiento está restringido.
    }
  }, [readIds, readStateReady, storageKey]);

  const markAsRead = React.useCallback((id: string) => {
    setReadIds((current) => {
      if (current.has(id)) return current;
      const next = new Set(current);
      next.add(id);
      return next;
    });
  }, []);

  React.useEffect(() => {
    if (!readStateReady || !data) return;

    const currentIds = new Set(items.map((item) => item.id));
    const previousIds = observedIdsRef.current;
    observedIdsRef.current = currentIds;

    // La primera respuesta establece la línea base y nunca genera una ráfaga de toasts.
    if (previousIds === null) return;

    const incoming = items.filter((item) => !previousIds.has(item.id));
    if (incoming.length === 0) return;

    setReadIds((current) => {
      const next = new Set(current);
      for (const item of incoming) next.delete(item.id);
      return next;
    });

    for (const item of incoming.slice(0, MAX_INDIVIDUAL_TOASTS)) {
      showNotificationToast(item, () => markAsRead(item.id));
    }

    if (incoming.length > MAX_INDIVIDUAL_TOASTS) {
      const remaining = incoming.length - MAX_INDIVIDUAL_TOASTS;
      toast(`${remaining} notificación${remaining === 1 ? "" : "es"} nueva${remaining === 1 ? "" : "s"} más`, {
        id: "admin-notifications-batch",
        icon: <Bell className="size-4 text-[var(--brand-700)]" />,
      });
    }
  }, [data, items, markAsRead, readStateReady]);

  const unreadItems = React.useMemo(
    () => items.filter((item) => !readIds.has(item.id)),
    [items, readIds],
  );
  const unreadCount = readStateReady ? unreadItems.length : 0;
  const visibleItems = activeFilter === "unread" ? unreadItems : items;

  const markAllAsRead = () => {
    setReadIds((current) => {
      const next = new Set(current);
      for (const item of items) next.add(item.id);
      return next;
    });
  };

  const closeAndRead = (id: string) => {
    markAsRead(id);
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="relative size-9 rounded-full text-[var(--brand-700)] hover:bg-[color-mix(in_srgb,var(--brand-600)_12%,transparent)] hover:text-[var(--brand-900)]"
          aria-label={
            unreadCount > 0
              ? `Notificaciones, ${unreadCount} sin leer`
              : "Notificaciones"
          }
        >
          <Bell className="size-5" aria-hidden />
          {unreadCount > 0 ? (
            <span
              className="absolute -right-0.5 -top-0.5 inline-flex min-w-[18px] items-center justify-center rounded-full border-2 border-[var(--card)] bg-red-600 px-1 text-[10px] font-bold leading-[14px] text-white"
              aria-hidden
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-[min(400px,calc(100vw-1rem))] overflow-hidden rounded-2xl bg-[var(--card)] p-0 shadow-[0_20px_50px_rgba(15,42,50,0.17)]"
      >
        <div className="flex items-start justify-between gap-4 px-4 pb-3 pt-4">
          <div>
            <h2 className="text-base font-bold tracking-tight text-[var(--text-main)]">
              Notificaciones
            </h2>
            <p className="mt-0.5 text-xs text-[var(--text-muted)]">
              {unreadCount > 0
                ? `${unreadCount} sin leer`
                : "No tienes asuntos nuevos"}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs text-[var(--brand-700)]"
              disabled={unreadCount === 0}
              onClick={(event) => {
                event.preventDefault();
                markAllAsRead();
              }}
            >
              <Check className="size-3.5" aria-hidden />
              Marcar todas
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="rounded-full text-[var(--text-muted)]"
              aria-label="Buscar notificaciones nuevas"
              title="Buscar notificaciones nuevas"
              disabled={isFetching}
              onClick={(event) => {
                event.preventDefault();
                void refetch();
              }}
            >
              <RefreshCw
                className={cn("size-4", isFetching && "animate-spin")}
                aria-hidden
              />
            </Button>
          </div>
        </div>

        <div
          className="mx-4 grid grid-cols-2 border-b border-[var(--border-soft)]"
          role="tablist"
          aria-label="Filtrar notificaciones"
        >
          {(
            [
              ["all", "Todas", items.length],
              ["unread", "Sin leer", unreadCount],
            ] as const
          ).map(([id, label, count]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={activeFilter === id}
              onClick={() => setActiveFilter(id)}
              className={cn(
                "relative -mb-px inline-flex h-9 items-center justify-center gap-1.5 border-b-2 px-2 text-xs font-semibold transition",
                activeFilter === id
                  ? "border-[var(--brand-600)] text-[var(--brand-900)]"
                  : "border-transparent text-[var(--text-muted)] hover:border-[var(--border-soft)] hover:text-[var(--text-main)]",
              )}
            >
              {label}
              <span
                className={cn(
                  "inline-flex min-w-[18px] items-center justify-center rounded-full px-1.5 text-[9px] leading-[18px]",
                  activeFilter === id
                    ? "bg-[color-mix(in_srgb,var(--brand-600)_12%,var(--surface))] text-[var(--brand-800)]"
                    : "bg-[var(--surface)] text-[var(--text-muted)]",
                )}
              >
                {count > 99 ? "99+" : count}
              </span>
            </button>
          ))}
        </div>

        <DropdownMenuSeparator className="m-0" />

        <div
          className="max-h-[min(390px,58vh)] min-h-[180px] overflow-y-auto overscroll-contain p-2"
          role="tabpanel"
        >
          {isLoading ? (
            <div
              className="flex min-h-[164px] items-center justify-center gap-2 text-sm text-[var(--text-muted)]"
              role="status"
            >
              <LoaderCircle className="size-4 animate-spin" aria-hidden />
              Consultando notificaciones…
            </div>
          ) : error ? (
            <div className="grid min-h-[164px] place-content-center justify-items-center gap-2 px-6 text-center">
              <span className="inline-flex size-10 items-center justify-center rounded-full bg-amber-500/12 text-amber-700 dark:text-amber-300">
                <AlertTriangle className="size-5" aria-hidden />
              </span>
              <p className="text-sm font-semibold text-[var(--text-main)]">
                No pudimos cargar las notificaciones
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                Revisa tu conexión e inténtalo de nuevo.
              </p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="mt-1"
                onClick={() => void refetch()}
              >
                Reintentar
              </Button>
            </div>
          ) : visibleItems.length === 0 ? (
            <div className="grid min-h-[164px] place-content-center justify-items-center gap-2 px-6 text-center">
              <span className="inline-flex size-10 items-center justify-center rounded-full bg-[var(--surface)] text-[var(--brand-700)]">
                <BellOff className="size-5" aria-hidden />
              </span>
              <p className="text-sm font-semibold text-[var(--text-main)]">
                {activeFilter === "unread"
                  ? "Ya revisaste todo"
                  : "Todo está al día"}
              </p>
              <p className="max-w-[260px] text-xs leading-5 text-[var(--text-muted)]">
                {activeFilter === "unread"
                  ? "Las notificaciones nuevas aparecerán aquí automáticamente."
                  : "No hay solicitudes, reseñas o alertas de inventario pendientes."}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {visibleItems.map((item) => {
                const styles = notificationStyles[item.category];
                const Icon = styles.icon;
                const unread = !readIds.has(item.id);

                return (
                  <div
                    key={item.id}
                    className={cn(
                      "group relative overflow-hidden rounded-xl border border-transparent transition hover:border-[var(--border-soft)] hover:bg-[var(--surface)]",
                      unread &&
                        "bg-[color-mix(in_srgb,var(--brand-600)_5%,var(--card))]",
                    )}
                  >
                    <Link
                      href={item.href}
                      className="flex min-h-[78px] items-start gap-3 px-3 py-2.5 pr-11"
                      onClick={() => closeAndRead(item.id)}
                    >
                      <span
                        className={cn(
                          "mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-xl",
                          styles.iconClassName,
                        )}
                      >
                        <Icon className="size-[18px]" aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="truncate text-sm font-semibold text-[var(--text-main)]">
                            {item.title}
                          </span>
                          {unread ? (
                            <span
                              className="size-2 shrink-0 rounded-full bg-[var(--brand-600)]"
                              aria-label="Sin leer"
                            />
                          ) : null}
                        </span>
                        <span className="mt-0.5 line-clamp-2 block text-xs leading-5 text-[var(--text-muted)]">
                          {item.description}
                        </span>
                        <span className="mt-1 flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
                          <span>{styles.label}</span>
                          <span aria-hidden>·</span>
                          <time dateTime={item.occurredAt}>
                            {formatNotificationTime(item.occurredAt)}
                          </time>
                        </span>
                      </span>
                    </Link>

                    {unread ? (
                      <button
                        type="button"
                        className="absolute right-2.5 top-3 inline-flex size-7 items-center justify-center rounded-full text-[var(--text-muted)] opacity-70 transition hover:bg-[var(--card)] hover:text-[var(--brand-800)] hover:shadow-sm focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-500)] group-hover:opacity-100"
                        aria-label={`Marcar como leída: ${item.title}`}
                        title="Marcar como leída"
                        onClick={() => markAsRead(item.id)}
                      >
                        <Check className="size-4" aria-hidden />
                      </button>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </DropdownMenuContent>
    </DropdownMenu>
  );
}

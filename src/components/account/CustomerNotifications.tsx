"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  AnimatePresence,
  motion,
  useIsPresent,
  useReducedMotion,
} from "framer-motion";
import { Bell, Settings2, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AccountPageHeader } from "@/components/account/AccountPageHeader";
import { useAuth } from "@/providers/AuthContext";
import {
  getNotificationDetail,
  getNotificationPromotion,
  getNotifications,
  notificationHref,
  readNotifications,
  readAllNotifications,
} from "@/services/notifications";
import { NotificationRow } from "./NotificationRow";
import { requestWebPushOnAccess } from "@/lib/pwa/push";

const filters = [
  ["ALL", "Todas"],
  ["RENTAL", "Rentas"],
  ["SYSTEM", "Sistema"],
  ["OFFER", "Ofertas"],
] as const;
const NotificationListTransition = forwardRef<
  HTMLDivElement,
  { children: ReactNode; direction: number; reducedMotion: boolean | null }
>(function NotificationListTransition(
  { children, direction, reducedMotion },
  ref,
) {
  const present = useIsPresent();
  return (
    <motion.div
      ref={ref}
      aria-hidden={!present || undefined}
      inert={!present || undefined}
      initial={{
        opacity: reducedMotion ? 1 : 0.55,
        x: reducedMotion ? 0 : direction * 16,
      }}
      animate={{ opacity: 1, x: 0 }}
      exit={{
        opacity: 0,
        x: reducedMotion ? 0 : -direction * 16,
        pointerEvents: "none",
      }}
      transition={{ duration: reducedMotion ? 0 : 0.18 }}
      className="space-y-5"
    >
      {children}
    </motion.div>
  );
});
export function CustomerNotifications() {
  const { user } = useAuth();
  return user?.rol === "CLIENT" ? (
    <NotificationInbox key={user.id} />
  ) : (
    <p>Esta sección está disponible para cuentas de cliente.</p>
  );
}
function NotificationInbox() {
  const { user } = useAuth();
  useEffect(() => {
    void requestWebPushOnAccess();
  }, []);
  const [filter, setFilter] = useState<string>("ALL");
  const [loadedFilter, setLoadedFilter] = useState("ALL");
  const pageCount = useRef(1);
  const feedLimits = useRef({ total: 0, pageSize: 20 });
  const activeFilter = useRef("ALL");
  const refreshRequest = useRef<object | null>(null);
  const sentinel = useRef<HTMLDivElement>(null);
  const scrolled = useRef(false);
  const loadingMore = useRef(false);
  const [morePending, setMorePending] = useState(false);
  const [moreError, setMoreError] = useState("");
  const [data, setData] = useState<Awaited<
    ReturnType<typeof getNotifications>
  > | null>(null);
  const [error, setError] = useState("");
  const [writeError, setWriteError] = useState("");
  const [version, setVersion] = useState(0);
  const [reading, setReading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const busy = useRef(false);
  const revision = useRef(0);
  const direction = useRef(1);
  const reducedMotion = useReducedMotion();
  useEffect(() => {
    let cancelled = false;
    let inFlight = false;
    let requestToken: object | null = null;
    const load = async () => {
      if (inFlight || busy.current || loadingMore.current) return;
      inFlight = true;
      requestToken = {};
      refreshRequest.current = requestToken;
      const expected = revision.current;
      setRefreshing(true);
      try {
        const pages = await Promise.all(
          Array.from({ length: pageCount.current }, (_, index) =>
            getNotifications(index + 1, filter === "ALL" ? undefined : filter),
          ),
        );
        const items = [
          ...new Map(
            pages
              .flatMap((result) => result.items)
              .map((item) => [item.id, item]),
          ).values(),
        ];
        const result = { ...pages[0], page: pages.length, items };
        if (!cancelled && expected === revision.current) {
          feedLimits.current = {
            total: result.total,
            pageSize: result.pageSize,
          };
          setData(result);
          setLoadedFilter(filter);
          setError("");
        }
      } catch {
        if (!cancelled && expected === revision.current)
          setError(
            "No pudimos actualizar las notificaciones. Revisa tu conexión.",
          );
      } finally {
        inFlight = false;
        if (refreshRequest.current === requestToken)
          refreshRequest.current = null;
        if (!cancelled) setRefreshing(false);
      }
    };
    void load();
    const refresh = () => {
      if (document.visibilityState === "visible" && navigator.onLine)
        void load();
    };
    const interval = setInterval(refresh, 30000);
    window.addEventListener("focus", refresh);
    window.addEventListener("online", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      cancelled = true;
      if (refreshRequest.current === requestToken)
        refreshRequest.current = null;
      clearInterval(interval);
      window.removeEventListener("focus", refresh);
      window.removeEventListener("online", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [filter, version]);
  const waiting = !!data && loadedFilter !== filter;
  const hasMore = !!data && data.page * data.pageSize < data.total;
  const loadMore = useCallback(async () => {
    if (
      !data ||
      !hasMore ||
      waiting ||
      reading ||
      refreshing ||
      busy.current ||
      loadingMore.current ||
      refreshRequest.current ||
      activeFilter.current !== filter ||
      pageCount.current * feedLimits.current.pageSize >=
        feedLimits.current.total ||
      !navigator.onLine
    )
      return;
    loadingMore.current = true;
    setMorePending(true);
    setMoreError("");
    const expected = revision.current;
    try {
      const result = await getNotifications(
        pageCount.current + 1,
        filter === "ALL" ? undefined : filter,
      );
      if (expected !== revision.current) return;
      pageCount.current = result.page;
      feedLimits.current = { total: result.total, pageSize: result.pageSize };
      setData((previous) =>
        previous
          ? {
              ...result,
              items: [
                ...new Map(
                  [...previous.items, ...result.items].map((item) => [
                    item.id,
                    item,
                  ]),
                ).values(),
              ],
            }
          : previous,
      );
    } catch {
      if (expected === revision.current)
        setMoreError("No pudimos cargar más notificaciones.");
    } finally {
      loadingMore.current = false;
      setMorePending(false);
      if (expected !== revision.current) setVersion((value) => value + 1);
    }
  }, [data, hasMore, waiting, reading, refreshing, filter]);
  useEffect(() => {
    const target = sentinel.current;
    if (!target || !hasMore || moreError) return;
    const check = () => {
      if (
        scrolled.current &&
        target.getBoundingClientRect().top < window.innerHeight + 160
      )
        void loadMore();
    };
    const onScroll = () => {
      scrolled.current = true;
      check();
    };
    const observer =
      typeof IntersectionObserver === "undefined"
        ? null
        : new IntersectionObserver(check, { rootMargin: "160px" });
    observer?.observe(target);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      observer?.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [hasMore, loadMore, moreError]);
  const markRead = async (ids?: string[]) => {
    if (busy.current || !data || waiting) return;
    busy.current = true;
    revision.current += 1;
    setReading(true);
    setWriteError("");
    const snapshot = data;
    const targets = ids ? new Set(ids) : null;
    const count = targets
      ? data.items.filter((item) => !item.readAt && targets.has(item.id)).length
      : data.unreadCount;
    const now = new Date().toISOString();
    setData({
      ...data,
      unreadCount: Math.max(0, data.unreadCount - count),
      items: data.items.map((item) =>
        !item.readAt && (!targets || targets.has(item.id))
          ? { ...item, readAt: now }
          : item,
      ),
    });
    window.dispatchEvent(
      new CustomEvent("cemydi:notifications-read", {
        detail: {
          userId: user?.id,
          unreadCount: Math.max(0, data.unreadCount - count),
        },
      }),
    );
    try {
      if (ids) await readNotifications(ids);
      else await readAllNotifications();
      window.dispatchEvent(new Event("cemydi:notifications-read"));
    } catch {
      setData(snapshot);
      window.dispatchEvent(
        new CustomEvent("cemydi:notifications-read", {
          detail: { userId: user?.id, unreadCount: snapshot.unreadCount },
        }),
      );
      setWriteError("No se pudieron marcar las notificaciones como leídas.");
    } finally {
      busy.current = false;
      setReading(false);
      setVersion((v) => v + 1);
    }
  };
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-3">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-2">
          <AccountPageHeader
            compact
            title="Notificaciones"
            className="max-[360px]:[&_h2]:text-2xl"
          />
          {data && (
            <span
              aria-label={`${data.unreadCount} notificaciones sin leer`}
              aria-live="polite"
              className="inline-flex min-w-6 shrink-0 items-center justify-center rounded-full bg-[#e9f5f3] px-2 py-0.5 text-xs font-semibold text-[#207a77]"
            >
              {data.unreadCount > 99 ? "99+" : data.unreadCount}
            </span>
          )}
        </div>
        <Button
          asChild
          variant="ghost"
          className="size-11 shrink-0 rounded-xl p-0"
        >
          <Link
            href="/configuracion#notification-preferences-heading"
            aria-label="Ajustes de notificaciones"
          >
            <Settings2 className="size-5" aria-hidden />
          </Link>
        </Button>
      </div>
      <div
        aria-label="Filtrar notificaciones"
        className="flex shrink-0 justify-center gap-1 overflow-x-auto border-b border-[#e7edef]"
      >
        {filters.map(([id, label], index) => (
          <Button
            key={id}
            variant="ghost"
            aria-pressed={filter === id}
            className={`relative h-12 shrink-0 rounded-none px-3 sm:px-6 ${filter === id ? "font-semibold text-[#207a77]" : "text-[#607173]"}`}
            onClick={() => {
              if (id === filter) return;
              direction.current =
                index > filters.findIndex(([key]) => key === filter) ? 1 : -1;
              setFilter(id);
              activeFilter.current = id;
              revision.current += 1;
              pageCount.current = 1;
              scrolled.current = false;
              setMoreError("");
            }}
          >
            {label}
            {filter === id && (
              <motion.span
                layoutId="notification-tab-line"
                className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-[#258e8b]"
                transition={
                  reducedMotion
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 400, damping: 32 }
                }
              />
            )}
          </Button>
        ))}
      </div>
      {data && (
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button
            variant="ghost"
            className="min-h-11 text-xs text-[#207a77]"
            disabled={reading || waiting || data.unreadCount === 0}
            onClick={() => void markRead()}
          >
            <CheckCheck className="size-4" aria-hidden />
            Marcar todas como leídas
          </Button>
        </div>
      )}
      {(error || writeError) && (
        <div role="alert" className="space-y-3">
          <p className="text-sm text-red-700">{writeError || error}</p>
          <Button
            variant="outline"
            onClick={() => {
              setWriteError("");
              setVersion((v) => v + 1);
            }}
          >
            Reintentar
          </Button>
        </div>
      )}
      {!data && !error && (
        <p role="status" className="py-12 text-center text-sm text-[#607173]">
          Cargando notificaciones…
        </p>
      )}
      {waiting && (
        <p role="status" className="sr-only">
          Cargando sección…
        </p>
      )}
      {data && (
        <>
          <div className="relative" aria-busy={waiting}>
            <AnimatePresence
              initial={false}
              mode="popLayout"
              custom={direction.current}
            >
              <NotificationListTransition
                key={loadedFilter}
                direction={direction.current}
                reducedMotion={reducedMotion}
              >
                {data.items.length === 0 ? (
                  <div className="py-12 text-center">
                    <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-[#e9f5f3]">
                      <Bell className="size-6 text-[#207a77]" aria-hidden />
                    </div>
                    <h2 className="font-semibold">
                      No tienes notificaciones en esta sección
                    </h2>
                    <p className="mt-2 text-sm text-[#607173]">
                      Los próximos avisos de CEMYDI aparecerán aquí.
                    </p>
                  </div>
                ) : (
                  <ul aria-label="Lista de notificaciones">
                    {data.items.map((item) => (
                      <NotificationRow
                        key={item.id}
                        item={item}
                        disabled={waiting}
                        readDisabled={reading}
                        onRead={() => void markRead([item.id])}
                      />
                    ))}
                  </ul>
                )}
              </NotificationListTransition>
            </AnimatePresence>
          </div>
          <div
            ref={sentinel}
            aria-live="polite"
            className={morePending ? "min-h-11" : "h-1"}
          >
            {morePending && (
              <p
                role="status"
                className="py-3 text-center text-xs text-[#607173]"
              >
                Cargando más notificaciones…
              </p>
            )}
          </div>
          {moreError && (
            <div role="alert" className="text-center text-sm text-red-700">
              <p>{moreError}</p>
              <Button variant="ghost" onClick={() => void loadMore()}>
                Reintentar carga
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export function CustomerNotificationRedirect({ id }: { id: string }) {
  const { user } = useAuth();
  return user?.rol === "CLIENT" ? (
    <NotificationRedirect key={`${user.id}:${id}`} id={id} />
  ) : null;
}
function NotificationRedirect({ id }: { id: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [version, setVersion] = useState(0);
  useEffect(() => {
    let cancelled = false;
    void getNotificationDetail(id)
      .then(({ item }) => {
        if (cancelled) return;
        if (!item.readAt)
          void readNotifications([id])
            .then(() =>
              window.dispatchEvent(new Event("cemydi:notifications-read")),
            )
            .catch(() => undefined);
        router.replace(notificationHref(item) ?? "/notificaciones");
      })
      .catch(() => {
        if (!cancelled) setError("No pudimos abrir esta notificación.");
      });
    return () => {
      cancelled = true;
    };
  }, [id, version, router]);
  return error ? (
    <div role="alert" className="space-y-4">
      <p>{error}</p>
      <Button
        variant="outline"
        onClick={() => {
          setError("");
          setVersion((v) => v + 1);
        }}
      >
        Reintentar
      </Button>
      <Link href="/notificaciones" className="block text-sm underline">
        Volver a notificaciones
      </Link>
    </div>
  ) : (
    <p role="status">Abriendo destino…</p>
  );
}

export function NotificationPromotion({ id }: { id: string }) {
  const { user } = useAuth();
  return user?.rol === "CLIENT" ? (
    <PromotionDetail key={`${user.id}:${id}`} id={id} />
  ) : null;
}
function PromotionDetail({ id }: { id: string }) {
  const [data, setData] = useState<Awaited<
    ReturnType<typeof getNotificationPromotion>
  > | null>(null);
  const [error, setError] = useState(false);
  const [version, setVersion] = useState(0);
  useEffect(() => {
    let cancelled = false;
    void getNotificationPromotion(id)
      .then((result) => {
        if (!cancelled) {
          setData(result);
          setError(false);
        }
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [id, version]);
  if (error)
    return (
      <div className="space-y-4" role="alert">
        <h1 className="text-xl font-semibold">Promoción no disponible</h1>
        <p>Puede haber terminado o existir un problema de conexión.</p>
        <Button variant="outline" onClick={() => setVersion((v) => v + 1)}>
          Reintentar
        </Button>
        <Link className="block underline" href="/catalogo">
          Explorar catálogo
        </Link>
      </div>
    );
  if (!data) return <p role="status">Cargando promoción…</p>;
  return (
    <div className="space-y-5">
      <AccountPageHeader
        title={data.promotion.description || "Oferta CEMYDI"}
        description={`${data.promotion.discountPercent}% de descuento · Hasta ${new Date(data.promotion.endAt).toLocaleDateString("es-MX")}`}
      />
      <ul className="divide-y divide-[#deebeb]">
        {data.promotion.products.map((product) => (
          <li key={product.id}>
            <Link
              className="block py-4 font-semibold text-[#1f6a67] hover:underline"
              href={`/producto/${product.id}`}
            >
              {product.nombre}
            </Link>
          </li>
        ))}
      </ul>
      <Link className="text-sm underline" href="/notificaciones">
        Volver a notificaciones
      </Link>
    </div>
  );
}

export function CustomerNotificationBell({
  variant = "account",
}: {
  variant?: "account" | "header";
}) {
  const { user } = useAuth();
  return user?.rol === "CLIENT" ? (
    <NotificationBell key={user.id} variant={variant} userId={user.id} />
  ) : null;
}
function NotificationBell({
  variant,
  userId,
}: {
  variant: "account" | "header";
  userId: number;
}) {
  const [count, setCount] = useState(0);
  const countRevision = useRef(0);
  const refresh = useCallback(async () => {
    if (document.visibilityState !== "visible" || !navigator.onLine) return;
    try {
      const expected = countRevision.current;
      const result = await getNotifications();
      if (expected === countRevision.current) setCount(result.unreadCount);
    } catch {
      /* The inbox displays request failures; navigation remains available. */
    }
  }, []);
  useEffect(() => {
    let cancelled = false;
    const update = async () => {
      const expected = countRevision.current;
      try {
        const result = await getNotifications();
        if (!cancelled && expected === countRevision.current)
          setCount(result.unreadCount);
      } catch {
        /* The inbox provides recovery. */
      }
    };
    void update();
    const timer = setInterval(() => {
      if (document.visibilityState === "visible" && navigator.onLine)
        void update();
    }, 30000);
    window.addEventListener("focus", refresh);
    const onRead = (event: Event) => {
      const detail = (
        event as CustomEvent<{ userId: number; unreadCount: number }>
      ).detail;
      if (detail) {
        if (detail.userId === userId) {
          countRevision.current += 1;
          setCount(detail.unreadCount);
        }
      } else void refresh();
    };
    window.addEventListener("cemydi:notifications-read", onRead);
    return () => {
      cancelled = true;
      clearInterval(timer);
      window.removeEventListener("focus", refresh);
      window.removeEventListener("cemydi:notifications-read", onRead);
    };
  }, [refresh, userId]);
  return (
    <Link
      href="/notificaciones"
      onClick={() => {
        void requestWebPushOnAccess();
      }}
      aria-label={`Notificaciones${count ? `, ${count} sin leer` : ""}`}
      className={`relative inline-flex size-10 shrink-0 items-center justify-center rounded-full ${variant === "header" ? "text-white hover:bg-white/12" : "text-[#1f6a67] hover:bg-[#edf6f5]"}`}
    >
      <Bell className="size-5" aria-hidden />
      {count > 0 && (
        <span
          aria-hidden
          className={
            variant === "header"
              ? "absolute -top-1 -right-1 inline-flex min-h-4.5 min-w-4.5 items-center justify-center rounded-full bg-white px-1 text-[0.65rem] font-extrabold leading-none text-[#258e8b] shadow-sm ring-1.5 ring-[#258e8b]"
              : "absolute right-0 top-0 rounded-full border-2 border-white bg-[#207a77] px-1.5 text-[10px] font-semibold text-white"
          }
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}

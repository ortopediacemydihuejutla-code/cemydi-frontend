"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  Eye,
  FileText,
  PackageCheck,
  Search,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  AccountPageHeader,
  accountInputClassName,
} from "@/components/account/AccountPageHeader";
import { AccountEmptyState } from "@/components/account/AccountEmptyState";
import { AccountPagination } from "@/components/account/AccountPagination";
import { CustomerAccountShell } from "@/components/account/CustomerAccountShell";
import { AuthRouteLoading } from "@/components/auth/auth-route-loading";
import RentalCancellationDialog from "@/components/rentals/RentalCancellationDialog";
import {
  getRentalDueDate,
  getRentalStatusPresentation,
} from "@/components/rentals/rental-status";
import {
  formatCurrencyMx,
  formatDateEsMx,
  formatDateOnlyEsMx,
} from "@/lib/formatters";
import { useAuth } from "@/providers/AuthContext";
import {
  cancelMyRental,
  listMyRentals,
  type MyRentalCounts,
  type MyRentalFilter,
  type RentalRequest,
} from "@/services/rentals";

const STATUS_FILTERS: Array<{ value: MyRentalFilter; label: string }> = [
  { value: "ALL", label: "Todos los estados" },
  { value: "PENDING", label: "Pendientes" },
  { value: "DOCUMENTATION_PENDING", label: "Falta documentación" },
  { value: "APPROVED", label: "Aprobadas" },
  { value: "DELIVERED", label: "Activas" },
  { value: "DUE_SOON", label: "Próximas a vencer" },
  { value: "RETURNED", label: "Devueltas" },
  { value: "REJECTED", label: "Rechazadas" },
  { value: "CANCELLED", label: "Canceladas" },
];

function rentalDisplayFolio(rental: RentalRequest) {
  return rental.folio ?? "Solicitud " + rental.id.slice(-8).toUpperCase();
}

export default function MisRentasPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [rentals, setRentals] = useState<RentalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<MyRentalFilter>("ALL");
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 8,
    total: 0,
    totalPages: 1,
  });
  const [counts, setCounts] = useState<MyRentalCounts>({
    all: 0,
    pending: 0,
    documentationPending: 0,
    scheduled: 0,
    active: 0,
    dueSoon: 0,
    finalized: 0,
    rejected: 0,
    cancelled: 0,
  });
  const [cancellationTarget, setCancellationTarget] =
    useState<RentalRequest | null>(null);
  const [canceling, setCanceling] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login");
    }
  }, [authLoading, router, user]);

  useEffect(() => {
    if (authLoading || !user) return;
    if (user.rol !== "CLIENT") {
      setRentals([]);
      setCounts({
        all: 0,
        pending: 0,
        documentationPending: 0,
        scheduled: 0,
        active: 0,
        dueSoon: 0,
        finalized: 0,
        rejected: 0,
        cancelled: 0,
      });
      setPagination({
        page: 1,
        pageSize: 8,
        total: 0,
        totalPages: 1,
      });
      setLoadError(null);
      setLoading(false);
      return;
    }
    let cancelled = false;

    setLoading(true);
    setLoadError(null);
    setRentals([]);
    const timeoutId = window.setTimeout(() => void (async () => {
      try {
        const result = await listMyRentals({
          status: statusFilter,
          search,
          page,
          pageSize: 8,
        });
        if (!cancelled) {
          setRentals(result.rentals);
          setPagination(result.pagination);
          setCounts(result.counts);
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "No se pudieron cargar tus rentas.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })(), search.trim() ? 300 : 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [authLoading, page, reloadKey, search, statusFilter, user]);

  const handleCancelRental = async () => {
    if (!cancellationTarget) return;
    try {
      setCanceling(true);
      const result = await cancelMyRental(cancellationTarget.id);
      setRentals((current) =>
        current.map((rental) =>
          rental.id === cancellationTarget.id ? result.rental : rental,
        ),
      );
      setCancellationTarget(null);
      setReloadKey((current) => current + 1);
      toast.success(result.message);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo cancelar la solicitud.",
      );
    } finally {
      setCanceling(false);
    }
  };

  if (authLoading) {
    return (
      <AuthRouteLoading
        title="Cargando rentas"
        description="Preparando tus solicitudes..."
      />
    );
  }
  if (!user) return null;

  return (
    <CustomerAccountShell>
      <div>
        <AccountPageHeader
          title="Mis rentas"
          description="Consulta tus solicitudes, documentos y fechas de devolución."
          actions={
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded-full border border-[#cfdedd] bg-[#f4f8f8] px-3 py-1.5 text-[#405b65]">
              {counts.all} solicitud{counts.all === 1 ? "" : "es"}
            </span>
            <span className="rounded-full border border-[#665940] px-3 py-1.5 text-[#cdb07b]">
              {counts.pending} pendiente{counts.pending === 1 ? "" : "s"}
            </span>
            {counts.documentationPending > 0 ? (
              <span className="rounded-full border border-[#68494c] px-3 py-1.5 text-[#d9a0a5]">
                {counts.documentationPending} con documentos pendientes
              </span>
            ) : null}
            {counts.dueSoon > 0 ? (
              <span className="rounded-full border border-[#665940] px-3 py-1.5 text-[#cdb07b]">
                {counts.dueSoon} próxima{counts.dueSoon === 1 ? "" : "s"} a vencer
              </span>
            ) : null}
          </div>
          }
        />

        <section className="grid gap-3 border-b border-[#deebeb] py-5 sm:grid-cols-[minmax(0,1fr)_240px]">
          <label className="relative">
            <span className="sr-only">Buscar rentas</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#71858c]" />
            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Buscar por folio o producto"
              className={`${accountInputClassName} pl-10`}
            />
          </label>
          <label>
            <span className="sr-only">Filtrar por estado</span>
            <select
              value={statusFilter}
              onChange={(event) => {
                  setStatusFilter(event.target.value as MyRentalFilter);
                  setPage(1);
              }}
              className={accountInputClassName}
            >
              {STATUS_FILTERS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </section>

        {loading ? (
          <div className="py-10">
            <p className="text-sm text-[#607173]">Cargando solicitudes...</p>
          </div>
        ) : loadError ? (
          <div className="py-12">
            <XCircle className="size-8 text-[#d9a0a5]" />
            <h2 className="mt-4 text-lg font-semibold text-[#17333f]">
              No pudimos cargar tus rentas
            </h2>
            <p className="mt-2 text-sm text-[#607173]">{loadError}</p>
            <button
              type="button"
              onClick={() => setReloadKey((current) => current + 1)}
              className="mt-5 rounded-[8px] bg-[#1f6a67] px-4 py-2.5 text-sm font-semibold text-white"
            >
              Reintentar
            </button>
          </div>
        ) : counts.all === 0 ? (
          <AccountEmptyState
            icon={PackageCheck}
            title="Aún no tienes solicitudes de renta"
            description="Agrega productos de renta al carrito y envía tu solicitud para revisión."
            action={
              <Link
                href="/catalogo"
                className="inline-flex rounded-[8px] bg-[#1f6a67] px-4 py-2.5 text-sm font-semibold text-white no-underline hover:bg-[#154f4d]"
              >
                Ver catálogo
              </Link>
            }
          />
        ) : rentals.length === 0 ? (
          <AccountEmptyState
            icon={Search}
            title="No encontramos rentas con esos filtros"
            description="Prueba con otro folio, producto o estado."
            compact
            action={
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("ALL");
                  setPage(1);
                }}
                className="text-sm font-semibold text-[#1f6a67]"
              >
                Limpiar filtros
              </button>
            }
          />
        ) : (
          <div className="overflow-hidden rounded-xl border border-[#deebeb] bg-white">
            {rentals.map((rental) => {
              const presentation = getRentalStatusPresentation(rental);
              const dueDate = getRentalDueDate(rental);
              const documentCount = rental.items.filter(
                (item) => item.prescription,
              ).length;
              return (
                <article
                  key={rental.id}
                  className="border-b border-[#deebeb] px-5 py-5 transition-colors last:border-b-0 hover:bg-[#f9fbfb]"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <span
                        className={
                          "rounded-full px-3 py-1 text-xs font-bold " +
                          presentation.className
                        }
                      >
                        {presentation.label}
                      </span>
                      <h2 className="mt-3 text-[1.05rem] font-semibold text-[#17333f]">
                        {rentalDisplayFolio(rental)}
                      </h2>
                      <p className="mt-1 text-xs text-[#718184]">
                        Enviada:{" "}
                        {formatDateEsMx(rental.createdAt, { style: "short" })}
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <strong className="text-lg text-[#17333f]">
                        {formatCurrencyMx(rental.total, { fractionDigits: 0 })}
                      </strong>
                      <p className="mt-1 text-xs text-[#718184]">Total estimado</p>
                    </div>
                  </div>

                  <div className="mt-4 border-y border-[#deebeb] py-2">
                    {rental.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-col gap-2 border-b border-[#deebeb] py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[#17333f]">
                            {item.quantity} × {item.product.nombre}
                          </p>
                          <p className="mt-1 flex items-center gap-2 text-xs text-[#607173]">
                            <CalendarDays className="size-4 shrink-0 text-[#1f6a67]" />
                            {formatDateOnlyEsMx(item.startDate, { style: "short" })}{" "}
                            – {formatDateOnlyEsMx(item.endDate, { style: "short" })}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          {item.prescription ? (
                            <span className="inline-flex items-center gap-1 font-semibold text-[#1f6a67]">
                              <FileText className="size-4" /> Receta
                            </span>
                          ) : null}
                          <strong className="text-[#17333f]">
                            {formatCurrencyMx(item.lineTotal, {
                              fractionDigits: 0,
                            })}
                          </strong>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-[#607173]">
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      <span>
                        {rental.items.length} producto
                        {rental.items.length === 1 ? "" : "s"}
                      </span>
                      <span>
                        {documentCount} documento
                        {documentCount === 1 ? "" : "s"}
                      </span>
                      {dueDate ? (
                        <span>
                          Devolución:{" "}
                          {formatDateOnlyEsMx(dueDate.toISOString(), {
                            style: "short",
                          })}
                        </span>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {rental.status === "PENDING" ? (
                        <button
                          type="button"
                          onClick={() => setCancellationTarget(rental)}
                          className="inline-flex items-center gap-2 rounded-[8px] border border-[#e4b9b5] px-3.5 py-2.5 text-sm font-semibold text-[#b42318] transition hover:bg-[#fff1f1]"
                        >
                          <XCircle className="size-4" /> Cancelar
                        </button>
                      ) : null}
                      <Link
                        href={"/mis-rentas/" + encodeURIComponent(rental.id)}
                        className="inline-flex items-center gap-2 rounded-[8px] border border-[#bdd5d4] px-3.5 py-2.5 text-sm font-semibold text-[#1f6a67] no-underline transition hover:bg-[#f0f8f7]"
                      >
                        <Eye className="size-4" /> Ver detalle
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
            <AccountPagination
              page={pagination.page}
              pageSize={pagination.pageSize}
              total={pagination.total}
              totalPages={pagination.totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      <RentalCancellationDialog
        open={Boolean(cancellationTarget)}
        rental={cancellationTarget}
        submitting={canceling}
        onOpenChange={(open) => {
          if (!open) setCancellationTarget(null);
        }}
        onConfirm={handleCancelRental}
      />
    </CustomerAccountShell>
  );
}

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
      return;
    }
    if (user.rol !== "CLIENT") router.replace("/perfil");
  }, [authLoading, router, user]);

  useEffect(() => {
    if (authLoading || !user || user.rol !== "CLIENT") return;
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
  if (!user || user.rol !== "CLIENT") return null;

  return (
    <div className="min-h-[calc(100vh-120px)] bg-[#f3f6f6] px-4 py-9">
      <main className="mx-auto max-w-[1080px]">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-[2rem] font-semibold leading-tight text-[#0f3231] sm:text-[2.35rem]">
              Mis rentas
            </h1>
            <p className="mt-2 max-w-2xl text-[1rem] leading-7 text-[#607173]">
              Consulta tus solicitudes, documentos y fechas de devolución.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-sm font-bold">
            <span className="rounded-full bg-white px-4 py-2 text-[#405b65] shadow-[0_10px_22px_rgba(16,50,49,0.07)]">
              {counts.all} solicitud{counts.all === 1 ? "" : "es"}
            </span>
            <span className="rounded-full bg-[#fff7e8] px-4 py-2 text-[#845b12]">
              {counts.pending} pendiente{counts.pending === 1 ? "" : "s"}
            </span>
            {counts.documentationPending > 0 ? (
              <span className="rounded-full bg-[#fff1f1] px-4 py-2 text-[#9b2c25]">
                {counts.documentationPending} con documentos pendientes
              </span>
            ) : null}
            {counts.dueSoon > 0 ? (
              <span className="rounded-full bg-[#fff1df] px-4 py-2 text-[#a15c08]">
                {counts.dueSoon} próxima{counts.dueSoon === 1 ? "" : "s"} a vencer
              </span>
            ) : null}
          </div>
        </header>

        <section className="mb-5 grid gap-3 rounded-[22px] border border-[#dae5e5] bg-white p-4 shadow-[0_14px_28px_rgba(16,50,49,0.06)] sm:grid-cols-[minmax(0,1fr)_240px]">
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
              className="h-11 w-full rounded-xl border border-[#d4dfe2] bg-white pl-10 pr-3 text-sm text-[#193844] outline-none focus:border-[#1f6a67]"
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
              className="h-11 w-full rounded-xl border border-[#d4dfe2] bg-white px-3 text-sm font-semibold text-[#405b65] outline-none focus:border-[#1f6a67]"
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
          <div className="rounded-[24px] border border-[#dae5e5] bg-white p-6 shadow-[0_18px_36px_rgba(16,50,49,0.08)]">
            <p className="bg-[#edf4f5] px-4 py-3 font-semibold text-[#3d5d66]">
              Cargando solicitudes...
            </p>
          </div>
        ) : loadError ? (
          <div className="rounded-[24px] border border-[#f3c7c2] bg-white px-5 py-10 text-center shadow-[0_18px_36px_rgba(16,50,49,0.08)]">
            <XCircle className="mx-auto size-10 text-[#b42318]" />
            <h2 className="mt-3 text-lg font-semibold text-[#17333f]">
              No pudimos cargar tus rentas
            </h2>
            <p className="mt-2 text-[#607173]">{loadError}</p>
            <button
              type="button"
              onClick={() => setReloadKey((current) => current + 1)}
              className="mt-5 rounded-full bg-[#1f6a67] px-5 py-2.5 font-bold text-white"
            >
              Reintentar
            </button>
          </div>
        ) : counts.all === 0 ? (
          <div className="rounded-[28px] border border-[#dae5e5] bg-white px-5 py-14 text-center shadow-[0_18px_36px_rgba(16,50,49,0.08)]">
            <PackageCheck className="mx-auto size-12 text-[#1f6a67]" />
            <h2 className="mt-4 text-[1.35rem] font-semibold text-[#17333f]">
              Aún no tienes solicitudes de renta
            </h2>
            <p className="mx-auto mt-2 max-w-[520px] text-[#607173]">
              Agrega productos de renta al carrito y envía tu solicitud para
              revisión.
            </p>
            <Link
              href="/catalogo"
              className="mt-6 inline-flex rounded-full bg-[#1f6a67] px-6 py-3 font-bold text-white no-underline"
            >
              Ver catálogo
            </Link>
          </div>
        ) : rentals.length === 0 ? (
          <div className="rounded-[24px] border border-[#dae5e5] bg-white px-5 py-10 text-center shadow-[0_18px_36px_rgba(16,50,49,0.08)]">
            <h2 className="text-lg font-semibold text-[#17333f]">
              No encontramos rentas con esos filtros
            </h2>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("ALL");
                setPage(1);
              }}
              className="mt-4 font-bold text-[#1f6a67]"
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          <div className="grid gap-5">
            {rentals.map((rental) => {
              const presentation = getRentalStatusPresentation(rental);
              const dueDate = getRentalDueDate(rental);
              const documentCount = rental.items.filter(
                (item) => item.prescription,
              ).length;
              return (
                <article
                  key={rental.id}
                  className="rounded-[24px] border border-[#dae5e5] bg-white p-5 shadow-[0_18px_36px_rgba(16,50,49,0.08)]"
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
                      <h2 className="mt-3 text-[1.2rem] font-semibold text-[#17333f]">
                        {rentalDisplayFolio(rental)}
                      </h2>
                      <p className="mt-1 text-sm text-[#607173]">
                        Enviada:{" "}
                        {formatDateEsMx(rental.createdAt, { style: "short" })}
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <strong className="text-[1.45rem] text-[#1f6a67]">
                        {formatCurrencyMx(rental.total, { fractionDigits: 0 })}
                      </strong>
                      <p className="text-sm text-[#607173]">Total estimado</p>
                    </div>
                  </div>

                  <div className="mt-4 border-y border-[#e4ecee] py-2">
                    {rental.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-col gap-2 border-b border-[#edf2f3] py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0">
                          <p className="font-semibold text-[#17333f]">
                            {item.quantity} × {item.product.nombre}
                          </p>
                          <p className="mt-1 flex items-center gap-2 text-sm text-[#607173]">
                            <CalendarDays className="size-4 shrink-0 text-[#1f6a67]" />
                            {formatDateOnlyEsMx(item.startDate, { style: "short" })}{" "}
                            – {formatDateOnlyEsMx(item.endDate, { style: "short" })}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          {item.prescription ? (
                            <span className="inline-flex items-center gap-1 font-semibold text-[#176c83]">
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

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-[#607173]">
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
                          className="inline-flex items-center gap-2 rounded-xl border border-[#d7b1aa] px-4 py-2.5 font-bold text-[#b42318] transition hover:bg-[#fff1f1]"
                        >
                          <XCircle className="size-4" /> Cancelar
                        </button>
                      ) : null}
                      <Link
                        href={"/mis-rentas/" + encodeURIComponent(rental.id)}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#1f6a67] px-4 py-2.5 font-bold text-white no-underline transition hover:bg-[#185856]"
                      >
                        <Eye className="size-4" /> Ver detalle
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
            {pagination.totalPages > 1 ? (
              <nav className="flex items-center justify-center gap-3" aria-label="Paginación de rentas">
                <button
                  type="button"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  className="rounded-xl border border-[#d4dfe2] bg-white px-4 py-2 text-sm font-bold text-[#405b65] disabled:opacity-50"
                >
                  Anterior
                </button>
                <span className="text-sm font-semibold text-[#607173]">
                  Página {pagination.page} de {pagination.totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= pagination.totalPages || loading}
                  onClick={() =>
                    setPage((current) =>
                      Math.min(pagination.totalPages, current + 1),
                    )
                  }
                  className="rounded-xl border border-[#d4dfe2] bg-white px-4 py-2 text-sm font-bold text-[#405b65] disabled:opacity-50"
                >
                  Siguiente
                </button>
              </nav>
            ) : null}
          </div>
        )}
      </main>

      <RentalCancellationDialog
        open={Boolean(cancellationTarget)}
        rental={cancellationTarget}
        submitting={canceling}
        onOpenChange={(open) => {
          if (!open) setCancellationTarget(null);
        }}
        onConfirm={handleCancelRental}
      />
    </div>
  );
}

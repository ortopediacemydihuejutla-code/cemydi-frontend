"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CalendarDays,
  FileText,
  PackageCheck,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";

import { AuthRouteLoading } from "@/components/auth/auth-route-loading";
import { useAuth } from "@/providers/AuthContext";
import {
  cancelMyRental,
  listMyRentals,
  type RentalRequest,
  type RentalStatus,
} from "@/services/rentals";
import { formatCurrencyMx, formatDateEsMx } from "@/lib/formatters";

function rentalStatusLabel(status: RentalStatus) {
  switch (status) {
    case "PENDING":
      return "Pendiente";
    case "APPROVED":
      return "Aprobada";
    case "REJECTED":
      return "Rechazada";
    case "CANCELLED":
      return "Cancelada";
    case "DELIVERED":
      return "Entregada";
    case "RETURNED":
      return "Devuelta";
    default:
      return status;
  }
}

function statusClassName(status: RentalStatus) {
  if (status === "PENDING") return "bg-[#fff7e8] text-[#845b12]";
  if (status === "APPROVED" || status === "DELIVERED") return "bg-[#e9f4ff] text-[#176c83]";
  if (status === "REJECTED") return "bg-[#fff1f1] text-[#b42318]";
  if (status === "RETURNED") return "bg-[#e4f6ee] text-[#1e7c55]";
  return "bg-[#eef2f3] text-[#405b65]";
}

function OperationalDate({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;

  return (
    <span>
      {label}: {formatDateEsMx(value, { style: "short" })}
    </span>
  );
}

function hasAnyPrescription(rental: RentalRequest) {
  return rental.items.some((item) => item.prescription);
}

export default function MisRentasPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [rentals, setRentals] = useState<RentalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelingRentalId, setCancelingRentalId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (user.rol !== "CLIENT") {
      router.replace("/perfil");
    }
  }, [authLoading, router, user]);

  useEffect(() => {
    if (authLoading || !user || user.rol !== "CLIENT") return;
    let cancelled = false;

    void (async () => {
      try {
        setLoading(true);
        const result = await listMyRentals();
        if (!cancelled) {
          setRentals(result.rentals);
        }
      } catch (err) {
        if (!cancelled) {
          toast.error(err instanceof Error ? err.message : "No se pudieron cargar tus rentas.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authLoading, user]);

  const pendingCount = useMemo(
    () => rentals.filter((rental) => rental.status === "PENDING").length,
    [rentals],
  );

  const handleCancelRental = async (id: string) => {
    try {
      setCancelingRentalId(id);
      const result = await cancelMyRental(id);
      setRentals((current) =>
        current.map((rental) => (rental.id === id ? result.rental : rental)),
      );
      toast.success(result.message);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo cancelar la solicitud.");
    } finally {
      setCancelingRentalId(null);
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

  if (!user || user.rol !== "CLIENT") {
    return null;
  }

  return (
    <div className="min-h-[calc(100vh-120px)] bg-[#f3f6f6] px-4 py-9">
      <main className="mx-auto max-w-[1080px]">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-[2rem] font-semibold leading-tight text-[#0f3231] sm:text-[2.35rem]">
              Mis rentas
            </h1>
            <p className="mt-2 max-w-2xl text-[1rem] leading-7 text-[#607173]">
              Consulta el estado de tus solicitudes, sus productos y las recetas adjuntas.
            </p>
          </div>
          <div className="flex gap-2 text-sm font-bold text-[#405b65]">
            <span className="rounded-full bg-white px-4 py-2 shadow-[0_10px_22px_rgba(16,50,49,0.07)]">
              {rentals.length} solicitud{rentals.length === 1 ? "" : "es"}
            </span>
            <span className="rounded-full bg-[#fff7e8] px-4 py-2 text-[#845b12]">
              {pendingCount} pendiente{pendingCount === 1 ? "" : "s"}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="rounded-[24px] border border-[#dae5e5] bg-white p-6 shadow-[0_18px_36px_rgba(16,50,49,0.08)]">
            <p className="rounded-xl bg-[#edf4f5] px-4 py-3 font-semibold text-[#3d5d66]">
              Cargando solicitudes...
            </p>
          </div>
        ) : rentals.length === 0 ? (
          <div className="rounded-[28px] border border-[#dae5e5] bg-white px-5 py-14 text-center shadow-[0_18px_36px_rgba(16,50,49,0.08)]">
            <PackageCheck className="mx-auto size-12 text-[#1f6a67]" />
            <h2 className="mt-4 text-[1.35rem] font-semibold text-[#17333f]">
              Aún no tienes solicitudes de renta
            </h2>
            <p className="mx-auto mt-2 max-w-[520px] text-[#607173]">
              Agrega productos de renta al carrito y envía tu solicitud para aprobación.
            </p>
            <Link
              href="/catalogo"
              className="mt-6 inline-flex rounded-full bg-[#1f6a67] px-6 py-3 font-bold text-white no-underline"
            >
              Ver catálogo
            </Link>
          </div>
        ) : (
          <div className="grid gap-5">
            {rentals.map((rental) => (
              <article
                key={rental.id}
                className="rounded-[24px] border border-[#dae5e5] bg-white p-5 shadow-[0_18px_36px_rgba(16,50,49,0.08)]"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClassName(rental.status)}`}>
                      {rentalStatusLabel(rental.status)}
                    </span>
                    <h2 className="mt-3 text-[1.2rem] font-semibold text-[#17333f]">
                      Solicitud {rental.id.slice(-8).toUpperCase()}
                    </h2>
                    <p className="mt-1 text-sm text-[#607173]">
                      Enviada el {formatDateEsMx(rental.createdAt, { style: "short" })}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <strong className="text-[1.45rem] text-[#1f6a67]">
                      {formatCurrencyMx(rental.total, { fractionDigits: 0 })}
                    </strong>
                    <p className="text-sm text-[#607173]">Total estimado</p>
                  </div>
                </div>

                {!hasAnyPrescription(rental) ? (
                  <div className="mt-4 flex items-start gap-3 rounded-xl border border-[#f4d8a8] bg-[#fff7e8] px-4 py-3 text-sm text-[#845b12]">
                    <AlertTriangle className="mt-0.5 size-4 shrink-0 text-[#c47b13]" />
                    No hay recetas adjuntas en los productos de esta solicitud.
                  </div>
                ) : null}

                <div className="mt-4 grid gap-3">
                  {rental.items.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-[#e4ecee] bg-[#fbfdfd] px-4 py-3"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <p className="font-semibold text-[#17333f]">
                            {item.quantity} x {item.product.nombre}
                          </p>
                          <p className="mt-1 flex items-center gap-2 text-sm text-[#607173]">
                            <CalendarDays className="size-4 text-[#1f6a67]" />
                            {formatDateEsMx(item.startDate, { style: "short" })} -{" "}
                            {formatDateEsMx(item.endDate, { style: "short" })} · {item.days} día(s)
                          </p>
                          {item.notes ? (
                            <p className="mt-1 text-sm text-[#607173]">Nota: {item.notes}</p>
                          ) : null}
                        </div>
                        <div className="text-left sm:text-right">
                          <strong className="text-[#17333f]">
                            {formatCurrencyMx(item.lineTotal, { fractionDigits: 0 })}
                          </strong>
                          <p className="text-sm text-[#607173]">
                            {formatCurrencyMx(item.dailyPrice, { fractionDigits: 0 })}/día
                          </p>
                        </div>
                      </div>

                      {item.prescription ? (
                        <div className="mt-3 flex items-center gap-2 rounded-lg border border-[#cfe0e3] bg-white px-3 py-2 text-sm text-[#176c83]">
                          <FileText className="size-4 shrink-0" />
                          <span className="min-w-0 truncate font-semibold">
                            {item.prescription.fileName}
                          </span>
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>

                {rental.rejectedReason ? (
                  <p className="mt-3 rounded-xl bg-[#fff4f2] px-4 py-3 text-sm text-[#b42318]">
                    Motivo: {rental.rejectedReason}
                  </p>
                ) : null}

                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-[#607173]">
                  <OperationalDate label="Aprobada" value={rental.approvedAt} />
                  <OperationalDate label="Rechazada" value={rental.rejectedAt} />
                  <OperationalDate label="Cancelada" value={rental.cancelledAt} />
                  <OperationalDate label="Entregada" value={rental.deliveredAt} />
                  <OperationalDate label="Devuelta" value={rental.returnedAt} />
                </div>

                {rental.status === "PENDING" ? (
                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => void handleCancelRental(rental.id)}
                      disabled={cancelingRentalId === rental.id}
                      className="inline-flex items-center gap-2 rounded-xl border border-[#d7b1aa] bg-white px-4 py-2.5 font-bold text-[#b42318] transition hover:bg-[#fff1f1] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <XCircle className="size-4" />
                      {cancelingRentalId === rental.id ? "Cancelando..." : "Cancelar solicitud"}
                    </button>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

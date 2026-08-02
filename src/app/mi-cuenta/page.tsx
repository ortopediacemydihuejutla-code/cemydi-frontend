"use client";

import {
  ArrowRight,
  CircleAlert,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Heart,
  MessageSquareText,
  Package,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { AccountPageHeader } from "@/components/account/AccountPageHeader";
import { CustomerAccountShell } from "@/components/account/CustomerAccountShell";
import { useFavorites } from "@/components/account/use-favorites";
import {
  getRentalStatusPresentation,
} from "@/components/rentals/rental-status";
import { formatDateEsMx } from "@/lib/formatters";
import { isProfileComplete } from "@/lib/profile-completion";
import { useAuth } from "@/providers/AuthContext";
import {
  listMyRentals,
  type MyRentalCounts,
  type RentalRequest,
} from "@/services/rentals";
import { getMyReviews, type MyReviewListItem } from "@/services/reviews";

const emptyCounts: MyRentalCounts = {
  all: 0,
  pending: 0,
  documentationPending: 0,
  scheduled: 0,
  active: 0,
  dueSoon: 0,
  finalized: 0,
  rejected: 0,
  cancelled: 0,
};

export default function MiCuentaPage() {
  const { user } = useAuth();
  const { products: favorites, loaded: favoritesLoaded } = useFavorites();
  const [rentals, setRentals] = useState<RentalRequest[]>([]);
  const [counts, setCounts] = useState<MyRentalCounts>(emptyCounts);
  const [reviews, setReviews] = useState<MyReviewListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    if (user.rol !== "CLIENT") return;
    let cancelled = false;

    void Promise.allSettled([
      listMyRentals({ page: 1, pageSize: 4 }),
      getMyReviews(),
    ]).then(([rentalsResult, reviewsResult]) => {
      if (cancelled) return;

      if (rentalsResult.status === "fulfilled") {
        setRentals(rentalsResult.value.rentals);
        setCounts(rentalsResult.value.counts);
      }
      if (reviewsResult.status === "fulfilled") {
        setReviews(reviewsResult.value.reviews);
      }
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [user]);

  const accountDataLoading = user?.rol === "CLIENT" ? loading : false;
  const profileComplete = isProfileComplete(user);

  const summary = [
    {
      label: "Rentas activas",
      value: counts.active,
      icon: ClipboardList,
      href: "/mis-rentas",
    },
    {
      label: "Favoritos",
      value: favoritesLoaded ? favorites.length : 0,
      icon: Heart,
      href: "/favoritos",
    },
    {
      label: "Reseñas",
      value: reviews.length,
      icon: MessageSquareText,
      href: "/mis-resenas",
    },
  ];

  return (
    <CustomerAccountShell>
      <div>
        <AccountPageHeader
          title="Resumen"
          description="Este es el panel de control de tu cuenta. Consulta aquí lo más importante sin salir del sitio."
          actions={
            <Link
              href={profileComplete ? "/catalogo" : "/perfil?completar=1"}
              className={
                profileComplete
                  ? "inline-flex items-center gap-2 rounded-[8px] border border-[#bdd5d4] px-4 py-2.5 text-sm font-semibold text-[#1f6a67] no-underline transition hover:border-[#1f6a67] hover:bg-[#f0f8f7]"
                  : "inline-flex items-center gap-2 rounded-[8px] border border-[#d97706] bg-[#fff7ed] px-4 py-2.5 text-sm font-semibold text-[#9a4f08] no-underline transition hover:bg-[#ffedd5]"
              }
            >
              {!profileComplete ? (
                <CircleAlert className="size-4" aria-hidden="true" />
              ) : null}
              {profileComplete ? "Ver catálogo" : "Completar perfil"}
              <ArrowRight className="size-4" />
            </Link>
          }
        />

        <section className="grid gap-4 py-8 sm:grid-cols-3">
          {summary.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#e2ecec] bg-[#f4f8f8] p-6 text-inherit no-underline transition-all hover:-translate-y-1 hover:border-[#1f6a67]/30 hover:bg-white hover:shadow-[0_12px_30px_rgba(31,106,103,0.08)]"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-xl bg-white p-2.5 shadow-sm ring-1 ring-black/5 transition-colors group-hover:bg-[#f0f8f7] group-hover:ring-[#1f6a67]/20">
                    <Icon
                      className="size-5 text-[#1f6a67]"
                      strokeWidth={1.8}
                    />
                  </span>
                </div>
                <div className="mt-6">
                  <strong className="block text-3xl font-bold text-[#0f3d3b]">
                    {accountDataLoading ? "—" : item.value}
                  </strong>
                  <span className="mt-1 block text-sm font-medium text-[#5e7472]">
                    {item.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </section>

        <section className="pb-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-[#0f3d3b]">
                Actividad reciente
              </h3>
              <p className="mt-1 text-sm text-[#5e7472]">
                Tus últimas solicitudes de renta.
              </p>
            </div>
            <Link
              href="/mis-rentas"
              className="text-sm font-semibold text-[#1f6a67] no-underline hover:text-[#154f4d]"
            >
              Ver todas
            </Link>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-[#e2ecec] bg-white">
            {accountDataLoading ? (
              <p className="py-8 text-center text-sm text-[#5e7472]">
                Cargando actividad...
              </p>
            ) : rentals.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-12 text-center">
                <span className="grid size-12 place-items-center rounded-full bg-[#f4f8f8] text-[#8b9c9b]">
                  <Package className="size-6" strokeWidth={1.7} />
                </span>
                <div>
                  <p className="font-semibold text-[#0f3d3b]">
                    Aún no tienes solicitudes
                  </p>
                  <p className="mt-1 text-sm text-[#5e7472]">
                    Cuando solicites una renta aparecerá en esta lista.
                  </p>
                </div>
                <Link
                  href="/catalogo?tipos=RENTA"
                  className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[#f4f8f8] px-4 py-2 text-sm font-semibold text-[#1f6a67] no-underline hover:bg-[#eef5f5]"
                >
                  Explorar equipos en renta
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-[#e2ecec]">
                {rentals.map((rental) => {
                  const presentation = getRentalStatusPresentation(rental);
                  const folio =
                    rental.folio ??
                    `Solicitud ${rental.id.slice(-8).toUpperCase()}`;
                  return (
                    <Link
                      key={rental.id}
                      href={`/mis-rentas/${encodeURIComponent(rental.id)}`}
                      className="group grid gap-3 p-4 text-inherit no-underline transition-colors hover:bg-[#f9fbfb] sm:grid-cols-[40px_minmax(0,1fr)_auto_auto] sm:items-center sm:p-5"
                    >
                      <span className="hidden size-10 shrink-0 place-items-center rounded-full bg-[#f4f8f8] text-[#5e7472] transition-colors group-hover:bg-white group-hover:text-[#1f6a67] sm:grid">
                        <CalendarDays className="size-5" strokeWidth={1.7} />
                      </span>
                      <span className="min-w-0">
                        <strong className="block truncate text-sm font-bold text-[#0f3d3b] transition-colors group-hover:text-[#1f6a67]">
                          {folio}
                        </strong>
                        <span className="mt-1 block truncate text-xs font-medium text-[#5e7472]">
                          {rental.items[0]?.productNameSnapshot ??
                            rental.items[0]?.product.nombre ??
                            "Equipo CEMYDI"}
                        </span>
                      </span>
                      <span
                        className={`w-fit rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${presentation.className}`}
                      >
                        {presentation.label}
                      </span>
                      <span className="text-xs font-medium text-[#8b9c9b]">
                        {formatDateEsMx(rental.createdAt)}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <footer className="flex items-start gap-3 border-t border-[#e2ecec] pt-6 text-sm text-[#5e7472]">
          <CheckCircle2
            className="mt-0.5 size-4.5 shrink-0 text-[#1f6a67]"
            strokeWidth={1.8}
          />
          <p>
            Tu información personal y las solicitudes de renta se administran
            desde esta cuenta.
          </p>
        </footer>
      </div>
    </CustomerAccountShell>
  );
}

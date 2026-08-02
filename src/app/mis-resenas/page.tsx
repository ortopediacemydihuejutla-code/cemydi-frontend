"use client";

import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  MessageSquareText,
  Search,
  Star,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  AccountPageHeader,
  accountInputClassName,
} from "@/components/account/AccountPageHeader";
import { CustomerAccountShell } from "@/components/account/CustomerAccountShell";
import { formatDateEsMx } from "@/lib/formatters";
import { useAuth } from "@/providers/AuthContext";
import { getMyReviews, type MyReviewListItem } from "@/services/reviews";

const reviewStatus = {
  PENDING: {
    label: "En revisión",
    icon: Clock3,
    className: "border-[#e2cfaa] bg-[#fff9ed] text-[#8a5f18]",
  },
  APPROVED: {
    label: "Publicada",
    icon: CheckCircle2,
    className: "border-[#abd0ce] bg-[#eef8f7] text-[#1f6a67]",
  },
  REJECTED: {
    label: "Requiere cambios",
    icon: AlertCircle,
    className: "border-[#efc4c4] bg-[#fff4f4] text-[#a33d3d]",
  },
} as const;

export default function MisResenasPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<MyReviewListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!user) return;
    if (user.rol !== "CLIENT") return;
    let cancelled = false;

    void getMyReviews()
      .then((result) => {
        if (!cancelled) setReviews(result.reviews);
      })
      .catch((error) => {
        if (!cancelled) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "No se pudieron cargar tus reseñas.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey, user]);

  const accountDataLoading = user?.rol === "CLIENT" ? loading : false;

  const filteredReviews = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("es-MX");
    if (!query) return reviews;
    return reviews.filter((review) =>
      [review.product.nombre, review.product.marca, review.comment].some(
        (value) => value.toLocaleLowerCase("es-MX").includes(query),
      ),
    );
  }, [reviews, search]);

  return (
    <CustomerAccountShell>
      <div>
        <AccountPageHeader
          title="Mis reseñas"
          description="Consulta las opiniones que has compartido y su estado de publicación."
          actions={
            reviews.length > 0 ? (
              <span className="text-sm text-[#607173]">
                {reviews.length} reseña{reviews.length === 1 ? "" : "s"}
              </span>
            ) : null
          }
        />

        {reviews.length > 4 ? (
          <label className="relative mt-6 block max-w-md">
            <span className="sr-only">Buscar en mis reseñas</span>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#718184]" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por producto o comentario"
              className={`${accountInputClassName} pl-10`}
            />
          </label>
        ) : null}

        {accountDataLoading ? (
          <p className="py-10 text-sm text-[#607173]">Cargando reseñas...</p>
        ) : loadError ? (
          <section className="py-12">
            <AlertCircle className="size-7 text-[#d9a0a5]" />
            <h3 className="mt-4 text-lg font-semibold text-[#17333f]">
              No pudimos cargar tus reseñas
            </h3>
            <p className="mt-2 text-sm text-[#607173]">{loadError}</p>
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                setLoadError(null);
                setReloadKey((value) => value + 1);
              }}
              className="mt-5 rounded-[8px] bg-[#1f6a67] px-4 py-2.5 text-sm font-semibold text-white"
            >
              Reintentar
            </button>
          </section>
        ) : reviews.length === 0 ? (
          <section className="py-12">
            <MessageSquareText
              className="size-7 text-[#829295]"
              strokeWidth={1.6}
            />
            <h3 className="mt-4 text-lg font-semibold text-[#17333f]">
              Aún no has escrito reseñas
            </h3>
            <p className="mt-2 max-w-lg text-sm leading-6 text-[#607173]">
              Visita un producto que conozcas y comparte tu experiencia con
              otros clientes.
            </p>
            <Link
              href="/catalogo"
              className="mt-5 inline-flex rounded-[8px] bg-[#1f6a67] px-4 py-2.5 text-sm font-semibold text-white no-underline hover:bg-[#154f4d]"
            >
              Explorar productos
            </Link>
          </section>
        ) : filteredReviews.length === 0 ? (
          <section className="py-12">
            <Search className="size-6 text-[#829295]" />
            <h3 className="mt-4 text-lg font-semibold text-[#17333f]">
              No encontramos coincidencias
            </h3>
          </section>
        ) : (
          <div className="mt-6 border-y border-[#deebeb]">
            {filteredReviews.map((review) => {
              const status = reviewStatus[review.status];
              const StatusIcon = status.icon;
              const productHref = `/producto/${encodeURIComponent(
                review.product.slug || String(review.product.id),
              )}`;

              return (
                <article
                  key={review.id}
                  className="border-b border-[#deebeb] py-5 last:border-b-0"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <Link
                        href={productHref}
                        className="font-semibold text-[#17333f] no-underline hover:text-[#1f6a67] hover:underline"
                      >
                        {review.product.nombre}
                      </Link>
                      <p className="mt-1 text-xs text-[#718184]">
                        {review.product.marca} · {review.product.modelo}
                      </p>
                    </div>
                    <span
                      className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${status.className}`}
                    >
                      <StatusIcon className="size-3.5" />
                      {status.label}
                    </span>
                  </div>

                  <div
                    className="mt-4 flex gap-1 text-[#c6a55f]"
                    aria-label={`${review.rating} de 5 estrellas`}
                  >
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        key={index}
                        className={`size-4 ${
                          index < review.rating ? "fill-current" : ""
                        }`}
                      />
                    ))}
                  </div>

                  <p className="mt-3 max-w-3xl text-sm leading-6 text-[#405b65]">
                    “{review.comment}”
                  </p>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-[#718184]">
                    <span>
                      Actualizada el{" "}
                      {formatDateEsMx(review.updatedAt, { style: "long" })}
                    </span>
                    <Link
                      href={`${productHref}#resenas`}
                      className="font-semibold text-[#1f6a67] no-underline hover:underline"
                    >
                      Ver en el producto
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </CustomerAccountShell>
  );
}

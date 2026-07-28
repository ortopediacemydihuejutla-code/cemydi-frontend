"use client";

import {
  ImageIcon,
  Layers3,
  PencilLine,
  Tags,
  Trash2,
} from "lucide-react";

import type { AdminPromotion } from "@/services/admin";

import { AdminTablePagination } from "@/features/admin/components/admin-table-pagination";
import { AdminCardListSkeleton } from "@/features/admin/components/admin-content-skeletons";
import { Badge } from "@/features/admin/components/ui/badge";
import { Button } from "@/features/admin/components/ui/button";
import { CardContent, CardFooter } from "@/features/admin/components/ui/card";
import { cn } from "@/features/admin/lib/utils";
import { formatCurrencyMx } from "@/lib/formatters";
import { calculateDiscountedPrice } from "@/lib/promotion-pricing";
import { formatDate } from "../utils/promotion-formatters";
import { promotionStatus, statusStyles, type StatusFilter } from "../utils/promotion-validators";
import { PromotionTimeline } from "./PromotionTimeline";

type PromotionsTableProps = {
  loading?: boolean;
  filteredPromotions: AdminPromotion[];
  paginatedPromotions: AdminPromotion[];
  search: string;
  statusFilter: StatusFilter;
  saving: boolean;
  page: number;
  totalPages: number;
  resultStart: number;
  resultEnd: number;
  onEdit: (item: AdminPromotion) => void;
  onDelete: (item: AdminPromotion) => void;
  onPrevPage: () => void;
  onNextPage: () => void;
};

export function PromotionsTable({
  loading = false,
  filteredPromotions,
  paginatedPromotions,
  search,
  statusFilter,
  saving,
  page,
  totalPages,
  resultStart,
  resultEnd,
  onEdit,
  onDelete,
  onPrevPage,
  onNextPage,
}: PromotionsTableProps) {
  return (
    <>
      <CardContent className="w-full min-w-0 max-w-full pb-2">
        {loading ? (
          <AdminCardListSkeleton count={6} className="py-2" />
        ) : filteredPromotions.length === 0 ? (
          <div className="flex min-h-[200px] flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border-soft)] bg-[var(--surface)] px-6 py-12 text-center">
            <p className="text-base font-medium text-[var(--text-main)]">Sin resultados</p>
            <p className="mt-2 max-w-sm text-sm text-[var(--text-muted)]">
              {search.trim() || statusFilter !== "ALL"
                ? "Prueba otro filtro o limpia la búsqueda."
                : "Crea tu primera campaña promocional."}
            </p>
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {paginatedPromotions.map((item) => {
              const { label } = promotionStatus(item);
              const st = statusStyles(label);
              const previewProducts = item.products.slice(0, 3);
              const categories = Array.from(
                new Set(item.products.map((product) => product.clasificacion)),
              );
              return (
                <li
                  key={item.id}
                  className={cn(
                    "flex min-h-[380px] flex-col overflow-hidden rounded-xl border border-[var(--border-soft)] bg-[var(--card)] shadow-sm ring-1 ring-transparent transition hover:-translate-y-0.5 hover:shadow-md",
                    st.ring,
                  )}
                >
                  <div
                    className={cn("relative h-32 shrink-0 bg-gradient-to-br", st.accent)}
                  >
                    {item.displayImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.displayImageUrl}
                        alt={`Imagen de ${item.descripcion}`}
                        className="size-full object-cover opacity-95"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center text-white/90">
                        <ImageIcon className="size-9 opacity-60" aria-hidden />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
                    <Badge
                      variant={st.badge}
                      className="absolute bottom-3 left-3 shadow-sm"
                    >
                      {label}
                    </Badge>
                    <span className="absolute bottom-3 right-3 rounded-md bg-black/55 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
                      {item.imageStrategy === "CUSTOM"
                        ? "Imagen personalizada"
                        : "Imagen automática"}
                    </span>
                    <span className="absolute right-3 top-3 rounded-lg bg-[#fff159] px-2.5 py-1 text-sm font-extrabold text-[#263238] shadow-sm">
                      -{item.discountPercent}%
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col gap-3 p-4">
                    <div className="min-w-0">
                      <h3 className="line-clamp-2 font-semibold leading-snug text-[var(--text-main)]">
                        {item.descripcion}
                      </h3>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-[var(--text-muted)]">
                        <span className="inline-flex items-center gap-1">
                          <Layers3 className="size-3.5" aria-hidden />
                          {item.productCount} producto{item.productCount === 1 ? "" : "s"}
                        </span>
                        <span className="inline-flex min-w-0 items-center gap-1">
                          <Tags className="size-3.5 shrink-0" aria-hidden />
                          <span className="truncate">
                            {categories.slice(0, 2).join(", ")}
                            {categories.length > 2 ? ` +${categories.length - 2}` : ""}
                          </span>
                        </span>
                      </div>
                    </div>

                    <div className="grid gap-1.5 rounded-lg bg-[var(--surface)] p-2">
                      {previewProducts.map((product) => (
                        <div
                          key={product.id}
                          className="flex min-w-0 items-center gap-2 rounded-md bg-[var(--card)] px-2 py-1.5"
                        >
                          {product.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={product.imageUrl}
                              alt=""
                              className="size-8 shrink-0 rounded-md object-cover"
                            />
                          ) : (
                            <span className="grid size-8 shrink-0 place-items-center rounded-md bg-[var(--surface)]">
                              <ImageIcon className="size-4 text-[var(--text-muted)]" aria-hidden />
                            </span>
                          )}
                          <span className="min-w-0 flex-1 truncate text-xs font-medium text-[var(--text-main)]">
                            {product.nombre}
                          </span>
                          <span className="shrink-0 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                            {formatCurrencyMx(
                              calculateDiscountedPrice(
                                product.precio,
                                item.discountPercent,
                              ),
                            )}
                          </span>
                        </div>
                      ))}
                      {item.productCount > previewProducts.length ? (
                        <p className="px-2 py-0.5 text-[11px] font-medium text-[var(--text-muted)]">
                          +{item.productCount - previewProducts.length} productos más
                        </p>
                      ) : null}
                    </div>

                    <p className="sr-only">
                      {item.descripcion}
                    </p>
                    <div className="mt-auto space-y-1.5">
                      <div className="flex justify-between text-[10px] font-medium text-[var(--text-muted)] uppercase">
                        <span>{formatDate(item.startAt)}</span>
                        <span>{formatDate(item.endAt)}</span>
                      </div>
                      <PromotionTimeline startAt={item.startAt} endAt={item.endAt} />
                    </div>
                    <div className="flex gap-2 border-t border-[var(--border-soft)] pt-3">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="flex-1 rounded-md"
                        disabled={saving}
                        onClick={() => onEdit(item)}
                      >
                        <PencilLine className="mr-1.5 size-3.5" aria-hidden />
                        Editar
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="rounded-md text-destructive hover:bg-destructive/10 hover:text-destructive"
                        disabled={saving}
                        onClick={() => onDelete(item)}
                      >
                        <Trash2 className="size-3.5" aria-hidden />
                      </Button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>

      {!loading && filteredPromotions.length > 0 ? (
        <CardFooter className="flex-col gap-4 border-t border-[var(--border-soft)] bg-[var(--card)] md:flex-row md:items-center md:justify-between">
          <AdminTablePagination
            resultStart={resultStart}
            resultEnd={resultEnd}
            totalCount={filteredPromotions.length}
            page={page}
            totalPages={totalPages}
            disableWhenEmpty={false}
            onPrev={onPrevPage}
            onNext={onNextPage}
          />
        </CardFooter>
      ) : null}
    </>
  );
}

"use client";

import { ImageIcon, PencilLine, Trash2 } from "lucide-react";

import type { AdminPromotion } from "@/services/admin";

import { AdminTablePagination } from "@/features/admin/components/admin-table-pagination";
import { Badge } from "@/features/admin/components/ui/badge";
import { Button } from "@/features/admin/components/ui/button";
import { CardContent, CardFooter } from "@/features/admin/components/ui/card";
import { cn } from "@/features/admin/lib/utils";
import { formatDate } from "../utils/promotion-formatters";
import { promotionStatus, statusStyles, type StatusFilter } from "../utils/promotion-validators";
import { PromotionTimeline } from "./PromotionTimeline";

type PromotionsTableProps = {
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
        {filteredPromotions.length === 0 ? (
          <div className="flex min-h-[200px] flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border-soft)] bg-[var(--surface)] px-6 py-12 text-center">
            <p className="text-base font-medium text-[var(--text-main)]">Sin resultados</p>
            <p className="mt-2 max-w-sm text-sm text-[var(--text-muted)]">
              {search.trim() || statusFilter !== "ALL"
                ? "Prueba otro filtro o limpia la búsqueda."
                : "Crea una promoción con el formulario de arriba."}
            </p>
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {paginatedPromotions.map((item) => {
              const { label } = promotionStatus(item);
              const st = statusStyles(label);
              return (
                <li
                  key={item.id}
                  className={cn(
                    "flex min-h-[260px] flex-col overflow-hidden rounded-xl border border-[var(--border-soft)] bg-[var(--card)] shadow-sm ring-1 ring-transparent transition hover:shadow-md",
                    st.ring,
                  )}
                >
                  <div
                    className={cn(
                      "relative h-28 shrink-0 bg-gradient-to-br",
                      st.accent,
                    )}
                  >
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.imageUrl}
                        alt=""
                        className="size-full object-cover opacity-95"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center text-white/90">
                        <ImageIcon className="size-9 opacity-60" aria-hidden />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
                    <div className="absolute bottom-2 left-3 right-3">
                      <Badge variant={st.badge} className="shadow-sm">
                        {label}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col gap-2 p-4">
                    <div>
                      <p className="line-clamp-2 font-semibold text-[var(--text-main)]">
                        {item.product.nombre}
                      </p>
                      <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                        {item.product.clasificacion}
                      </p>
                    </div>
                    <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-[var(--text-muted)]">
                      {item.descripcion}
                    </p>
                    <div className="space-y-1.5">
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

      {filteredPromotions.length > 0 ? (
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

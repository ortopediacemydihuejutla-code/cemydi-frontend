"use client";

import { useCallback, useMemo, useState } from "react";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  Expand,
  LoaderCircle,
  MessageSquareQuote,
  MoreHorizontal,
  Star,
  TableProperties,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";

import { ConfirmDialog } from "@/components/feedback";
import {
  approveReview,
  deleteReview,
  listAdminReviews,
  setReviewHomeVisibility,
  type AdminReview,
  type ReviewStatus,
} from "@/services/admin";

import { formatNumberEsMx, getPaginationWindow } from "@/features/admin/lib/admin-list-utils";
import { useAdminDataBootstrap } from "@/features/admin/hooks/use-admin-data-bootstrap";
import { useClampPage, useResetPageOnChange } from "@/features/admin/hooks/use-admin-pagination";
import { AdminFilterTabs } from "@/features/admin/components/admin-filter-tabs";
import { AdminPageLoading } from "@/features/admin/components/admin-page-loading";
import { AdminMetricCard } from "@/features/admin/components/admin-metric-card";
import { AdminSearchField } from "@/features/admin/components/admin-search-field";
import { AdminTablePagination } from "@/features/admin/components/admin-table-pagination";
import { PageHeader } from "@/features/admin/components/page-header";
import { Badge } from "@/features/admin/components/ui/badge";
import { Button } from "@/features/admin/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/features/admin/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/features/admin/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/features/admin/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/features/admin/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/features/admin/components/ui/tooltip";
import { cn } from "@/features/admin/lib/utils";
import { formatDate } from "@/features/admin/lib/product-shared";

const PAGE_SIZE = 8;
const HOME_TESTIMONIALS_MIN = 3;
const HOME_TESTIMONIALS_MAX = 8;

type StatusFilter = ReviewStatus | "ALL";
type ReviewColumnId =
  | "date"
  | "user"
  | "product"
  | "rating"
  | "comment"
  | "status"
  | "home"
  | "moderatedBy";

const STATUS_TABS: { id: StatusFilter; label: string }[] = [
  { id: "ALL", label: "Todas" },
  { id: "PENDING", label: "Pendientes" },
  { id: "APPROVED", label: "Aprobadas" },
  { id: "REJECTED", label: "Rechazadas" },
];

const REVIEW_COLUMN_ORDER: ReviewColumnId[] = [
  "date",
  "user",
  "product",
  "rating",
  "comment",
  "status",
  "home",
  "moderatedBy",
];

const REVIEW_COLUMN_LABELS: Record<ReviewColumnId, string> = {
  date: "Fecha",
  user: "Usuario",
  product: "Producto",
  rating: "Calificación",
  comment: "Comentario",
  status: "Estado",
  home: "Visible en inicio",
  moderatedBy: "Moderado por",
};

const DEFAULT_VISIBLE_COLUMNS: Record<ReviewColumnId, boolean> = {
  date: true,
  user: true,
  product: true,
  rating: true,
  comment: true,
  status: true,
  home: false,
  moderatedBy: false,
};

const REVIEW_COLUMN_WIDTHS: Record<ReviewColumnId, number> = {
  date: 112,
  user: 190,
  product: 210,
  rating: 130,
  comment: 250,
  status: 112,
  home: 120,
  moderatedBy: 150,
};

function formatReviewStatus(status: ReviewStatus) {
  if (status === "PENDING") return "Pendiente";
  if (status === "APPROVED") return "Aprobada";
  return "Rechazada";
}

function statusBadgeVariant(status: ReviewStatus) {
  if (status === "PENDING") return "amber" as const;
  if (status === "APPROVED") return "emerald" as const;
  return "slate" as const;
}

function RatingStars({ rating }: { rating: number }) {
  const safe = Math.max(0, Math.min(5, Math.round(rating)));
  return (
    <div className="flex items-center gap-0.5" aria-label={`${safe} de 5 estrellas`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn(
            "size-3.5 shrink-0",
            i < safe
              ? "fill-amber-400 text-amber-400"
              : "fill-transparent text-[color-mix(in_srgb,var(--border-soft)_90%,transparent)]",
          )}
          aria-hidden
        />
      ))}
    </div>
  );
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [actionId, setActionId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminReview | null>(null);
  const [fullCommentReview, setFullCommentReview] = useState<AdminReview | null>(null);
  const [visibleColumns, setVisibleColumns] =
    useState<Record<ReviewColumnId, boolean>>(DEFAULT_VISIBLE_COLUMNS);

  const load = useCallback(async () => {
    const reviewsResult = await listAdminReviews({ status: "ALL" });
    setReviews(reviewsResult.reviews);
  }, []);

  const { blockingFullPage } = useAdminDataBootstrap({
    load,
    loadErrorFallback: "No se pudieron cargar las reseñas.",
  });

  const counts = useMemo(() => {
    let pending = 0;
    let approved = 0;
    let rejected = 0;
    let featured = 0;
    for (const r of reviews) {
      if (r.status === "PENDING") pending += 1;
      else if (r.status === "APPROVED") approved += 1;
      else rejected += 1;
      if (r.showOnHome) featured += 1;
    }
    return { total: reviews.length, pending, approved, rejected, featured };
  }, [reviews]);

  const tabCounts = useMemo(() => {
    return {
      ALL: reviews.length,
      PENDING: counts.pending,
      APPROVED: counts.approved,
      REJECTED: counts.rejected,
    } as Record<StatusFilter, number>;
  }, [reviews.length, counts.pending, counts.approved, counts.rejected]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return reviews.filter((item) => {
      if (statusFilter !== "ALL" && item.status !== statusFilter) return false;
      if (!q) return true;
      const haystack = [
        item.comment,
        item.product.nombre,
        item.user.nombre,
        item.user.correo,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [reviews, statusFilter, search]);

  const sorted = useMemo(
    () =>
      [...filtered].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [filtered],
  );

  const { totalPages, resultStart, resultEnd } = getPaginationWindow(
    page,
    PAGE_SIZE,
    sorted.length,
  );

  const pageRows = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return sorted.slice(start, start + PAGE_SIZE);
  }, [sorted, page]);

  const visibleColumnCount = useMemo(
    () => REVIEW_COLUMN_ORDER.filter((columnId) => visibleColumns[columnId]).length,
    [visibleColumns],
  );

  const tableMinWidth = useMemo(
    () =>
      Math.max(
        720,
        REVIEW_COLUMN_ORDER.reduce(
          (total, columnId) =>
            total + (visibleColumns[columnId] ? REVIEW_COLUMN_WIDTHS[columnId] : 0),
          0,
        ) + 72,
      ),
    [visibleColumns],
  );

  useClampPage(page, setPage, totalPages);
  useResetPageOnChange(setPage, [statusFilter, search]);

  const approvePending = async (id: number) => {
    try {
      setActionId(id);
      const result = await approveReview(id);
      setReviews((prev) => prev.map((item) => (item.id === id ? result.review : item)));
      toast.success(result.message);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo aprobar la reseña.");
    } finally {
      setActionId(null);
    }
  };

  const toggleHomeVisibility = async (review: AdminReview) => {
    if (review.status !== "APPROVED") {
      toast.error("Solo puedes mostrar en inicio reseñas aprobadas.");
      return;
    }

    if (!review.showOnHome && counts.featured >= HOME_TESTIMONIALS_MAX) {
      toast.error(`Solo puedes mostrar hasta ${HOME_TESTIMONIALS_MAX} reseñas en inicio.`);
      return;
    }

    try {
      setActionId(review.id);
      const result = await setReviewHomeVisibility(review.id, !review.showOnHome);
      setReviews((prev) => prev.map((item) => (item.id === review.id ? result.review : item)));
      toast.success(result.message);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo actualizar la visibilidad en inicio.",
      );
    } finally {
      setActionId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    try {
      setActionId(id);
      await deleteReview(id);
      setReviews((prev) => prev.filter((item) => item.id !== id));
      toast.success("Reseña eliminada.");
      setDeleteTarget(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo eliminar la reseña.");
    } finally {
      setActionId(null);
    }
  };

  const toggleColumnVisibility = (columnId: ReviewColumnId, checked: boolean) => {
    if (!checked && visibleColumnCount === 1 && visibleColumns[columnId]) {
      toast.error("Debes mantener al menos una columna visible.");
      return;
    }

    setVisibleColumns((current) => ({
      ...current,
      [columnId]: checked,
    }));
  };

  const resetVisibleColumns = () => {
    setVisibleColumns(DEFAULT_VISIBLE_COLUMNS);
  };

  if (blockingFullPage) {
    return <AdminPageLoading layout="viewport" />;
  }

  return (
    <>
      <div className="flex flex-col gap-8">
        <PageHeader
          title="Reseñas"
          subtitle="Revisa opiniones de clientes sobre productos: filtra por estado, aprueba las pendientes o elimina entradas que no deban mostrarse en la tienda."
        />

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <AdminMetricCard
            context="reviews-total"
            label={"Rese\u00f1as registradas"}
            value={formatNumberEsMx(counts.total)}
          />

          <AdminMetricCard
            context="reviews-pending"
            label="Pendientes de moderar"
            value={formatNumberEsMx(counts.pending)}
          />

          <AdminMetricCard
            context="reviews-approved"
            label="Aprobadas"
            value={formatNumberEsMx(counts.approved)}
          />

          <AdminMetricCard
            context="reviews-featured"
            label="En inicio"
            value={`${formatNumberEsMx(counts.featured)}/${HOME_TESTIMONIALS_MAX}`}
            helper={`Mínimo ${HOME_TESTIMONIALS_MIN} para publicar el slider.`}
          />
        </section>

        <Card className="w-full min-w-0 max-w-full rounded-xl border-[var(--border-soft)] shadow-sm">
          <CardHeader className="min-w-0 gap-5 border-b border-[var(--border-soft)] bg-[var(--card)]">
            <div className="min-w-0">
              <CardTitle>Moderación de reseñas</CardTitle>
              <p className="mt-2 text-sm text-[var(--text-muted)]">
                Listado completo con fecha, autor, producto valorado y estado. Las pendientes pueden
                aprobarse; selecciona de {HOME_TESTIMONIALS_MIN} a {HOME_TESTIMONIALS_MAX} reseñas
                aprobadas para mostrarlas en el slider de inicio.
              </p>
            </div>

            <AdminFilterTabs
              tabs={STATUS_TABS.map((tab) => ({
                id: tab.id,
                label: tab.label,
                count: tabCounts[tab.id],
              }))}
              activeId={statusFilter}
              onChange={setStatusFilter}
              formatCount={formatNumberEsMx}
            />

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <AdminSearchField
                value={search}
                onChange={setSearch}
                placeholder="Buscar por comentario, producto, nombre o correo…"
                wrapperClassName="w-full sm:max-w-md"
              />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 shrink-0 rounded-md border-[var(--border-soft)] bg-[var(--card)] px-4 text-[var(--brand-800)] shadow-none hover:bg-[var(--surface)]"
                  >
                    <TableProperties className="size-4" aria-hidden />
                    Columnas
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-60 rounded-lg border-[var(--border-soft)] bg-[var(--card)] p-1.5 shadow-[var(--shadow-md)]"
                >
                  <DropdownMenuLabel>Mostrar columnas</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {REVIEW_COLUMN_ORDER.map((columnId) => (
                    <DropdownMenuCheckboxItem
                      key={columnId}
                      checked={visibleColumns[columnId]}
                      onCheckedChange={(checked) =>
                        toggleColumnVisibility(columnId, checked === true)
                      }
                    >
                      {REVIEW_COLUMN_LABELS[columnId]}
                    </DropdownMenuCheckboxItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={resetVisibleColumns}>
                    <EyeOff className="size-4" aria-hidden />
                    Restaurar columnas
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
              <MessageSquareQuote className="size-4 opacity-70" aria-hidden />
              {sorted.length} resultado{sorted.length === 1 ? "" : "s"}
              {search.trim() ? ` para "${search.trim()}"` : ""}
            </div>
          </CardHeader>

          <CardContent className="w-full min-w-0 max-w-full pb-2">
            {sorted.length === 0 ? (
              <div className="grid min-h-72 place-items-center px-6 py-10 text-center">
                <div className="max-w-md">
                  <h2 className="text-xl font-semibold text-[var(--brand-900)]">
                    No hay reseñas que mostrar
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
                    {reviews.length === 0
                      ? "Aún no hay opiniones registradas en el sistema."
                      : "Prueba otro estado en las pestañas o ajusta la búsqueda."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="w-full min-w-0 overflow-x-auto">
                <Table
                  className="min-w-0"
                  style={{
                    width: "100%",
                    minWidth: `${tableMinWidth}px`,
                  }}
                >
                  <TableHeader>
                    <TableRow className="border-b border-[color-mix(in_srgb,var(--brand-700)_24%,var(--border-soft))] bg-[color-mix(in_srgb,var(--brand-700)_18%,var(--surface))] hover:bg-[color-mix(in_srgb,var(--brand-700)_18%,var(--surface))]">
                      {visibleColumns.date ? (
                        <TableHead className="whitespace-nowrap text-[var(--brand-900)]">
                          Fecha
                        </TableHead>
                      ) : null}
                      {visibleColumns.user ? (
                        <TableHead className="min-w-[140px] text-[var(--brand-900)]">
                          Usuario
                        </TableHead>
                      ) : null}
                      {visibleColumns.product ? (
                        <TableHead className="min-w-[160px] text-[var(--brand-900)]">
                          Producto
                        </TableHead>
                      ) : null}
                      {visibleColumns.rating ? (
                        <TableHead className="whitespace-nowrap text-[var(--brand-900)]">
                          Calificación
                        </TableHead>
                      ) : null}
                      {visibleColumns.comment ? (
                        <TableHead className="w-[14rem] max-w-[14rem] text-[var(--brand-900)] sm:w-[18rem] sm:max-w-[18rem]">
                          Comentario
                        </TableHead>
                      ) : null}
                      {visibleColumns.status ? (
                        <TableHead className="whitespace-nowrap text-[var(--brand-900)]">
                          Estado
                        </TableHead>
                      ) : null}
                      {visibleColumns.home ? (
                        <TableHead className="whitespace-nowrap text-[var(--brand-900)]">
                          Visible en inicio
                        </TableHead>
                      ) : null}
                      {visibleColumns.moderatedBy ? (
                        <TableHead className="min-w-[120px] text-[var(--brand-900)]">
                          Moderado por
                        </TableHead>
                      ) : null}
                      <TableHead className="w-[72px] whitespace-nowrap text-right text-[var(--brand-900)]">
                        Acciones
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pageRows.map((item) => {
                      const busy = actionId === item.id;
                      const homeLimitReached =
                        !item.showOnHome && counts.featured >= HOME_TESTIMONIALS_MAX;
                      return (
                        <TableRow key={item.id}>
                          {visibleColumns.date ? (
                            <TableCell className="whitespace-nowrap text-sm text-[var(--text-muted)]">
                              {formatDate(item.createdAt)}
                            </TableCell>
                          ) : null}
                          {visibleColumns.user ? (
                            <TableCell>
                              <div className="flex flex-col gap-0.5">
                                <span className="font-medium text-[var(--text-main)]">
                                  {item.user.nombre}
                                </span>
                                <span className="text-xs text-[var(--text-muted)]">
                                  {item.user.correo}
                                </span>
                              </div>
                            </TableCell>
                          ) : null}
                          {visibleColumns.product ? (
                            <TableCell className="font-medium text-[var(--text-main)]">
                              {item.product.nombre}
                            </TableCell>
                          ) : null}
                          {visibleColumns.rating ? (
                            <TableCell>
                              <RatingStars rating={item.rating} />
                            </TableCell>
                          ) : null}
                          {visibleColumns.comment ? (
                            <TableCell className="max-w-[14rem] sm:max-w-[18rem]">
                              {item.comment.trim() ? (
                                <button
                                  type="button"
                                  className="group flex w-full min-w-0 max-w-full items-center gap-2 overflow-hidden rounded-md py-0.5 pr-1 pl-0.5 text-left transition hover:bg-[color-mix(in_srgb,var(--brand-600)_8%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-600)] focus-visible:ring-offset-2"
                                  onClick={() => setFullCommentReview(item)}
                                  aria-label="Ampliar opinión del cliente"
                                >
                                  <span className="min-w-0 flex-1 overflow-hidden text-sm leading-snug wrap-break-word text-[var(--text-main)] line-clamp-3">
                                    {item.comment}
                                  </span>
                                  <Expand
                                    className="size-4 shrink-0 self-center text-[var(--brand-600)] opacity-60 transition group-hover:opacity-100"
                                    aria-hidden
                                  />
                                </button>
                              ) : (
                                <span className="text-sm text-[var(--text-muted)]">—</span>
                              )}
                            </TableCell>
                          ) : null}
                          {visibleColumns.status ? (
                            <TableCell>
                              <Badge variant={statusBadgeVariant(item.status)}>
                                {formatReviewStatus(item.status)}
                              </Badge>
                            </TableCell>
                          ) : null}
                          {visibleColumns.home ? (
                            <TableCell>
                              {item.showOnHome ? (
                                <Badge variant="emerald">Visible</Badge>
                              ) : (
                                <Badge variant="slate">Oculta</Badge>
                              )}
                            </TableCell>
                          ) : null}
                          {visibleColumns.moderatedBy ? (
                            <TableCell className="text-sm text-[var(--text-muted)]">
                              {item.approvedBy ? (
                                <span className="text-[var(--text-main)]">
                                  {item.approvedBy.nombre}
                                </span>
                              ) : (
                                "—"
                              )}
                            </TableCell>
                          ) : null}
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon-sm"
                                      className="rounded-md text-[var(--text-muted)] hover:bg-[var(--surface)] hover:text-[var(--brand-800)]"
                                      disabled={busy}
                                      aria-label={`Acciones para la reseña de ${item.user.nombre}`}
                                    >
                                      {busy ? (
                                        <LoaderCircle
                                          className="size-4 animate-spin"
                                          aria-hidden
                                        />
                                      ) : (
                                        <MoreHorizontal className="size-4" aria-hidden />
                                      )}
                                    </Button>
                                  </DropdownMenuTrigger>
                                </TooltipTrigger>
                                <TooltipContent sideOffset={6}>Acciones</TooltipContent>
                              </Tooltip>

                              <DropdownMenuContent
                                align="end"
                                className="w-56 rounded-lg border-[var(--border-soft)] bg-[var(--card)] p-1.5 shadow-[var(--shadow-md)]"
                              >
                                <DropdownMenuLabel>Gestionar reseña</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {item.status === "PENDING" ? (
                                  <DropdownMenuItem
                                    onSelect={() => void approvePending(item.id)}
                                  >
                                    <CheckCircle2 className="size-4" aria-hidden />
                                    Aprobar reseña
                                  </DropdownMenuItem>
                                ) : null}
                                <DropdownMenuItem
                                  disabled={item.status !== "APPROVED" || homeLimitReached}
                                  onSelect={() => void toggleHomeVisibility(item)}
                                  title={
                                    item.status === "APPROVED"
                                      ? item.showOnHome
                                        ? "Quitar de testimonios de inicio"
                                        : homeLimitReached
                                          ? `Máximo ${HOME_TESTIMONIALS_MAX} reseñas en inicio`
                                          : "Mostrar en testimonios de inicio"
                                      : "Aprueba la reseña antes de mostrarla en inicio"
                                  }
                                >
                                  {item.showOnHome ? (
                                    <EyeOff className="size-4" aria-hidden />
                                  ) : (
                                    <Eye className="size-4" aria-hidden />
                                  )}
                                  {item.showOnHome ? "Quitar de inicio" : "Mostrar en inicio"}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  variant="destructive"
                                  onSelect={() => setDeleteTarget(item)}
                                >
                                  <Trash2 className="size-4" aria-hidden />
                                  Eliminar reseña
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex-col gap-4 border-t border-[var(--border-soft)] bg-[var(--card)] md:flex-row md:items-center md:justify-between">
            <AdminTablePagination
              resultStart={resultStart}
              resultEnd={resultEnd}
              totalCount={sorted.length}
              page={page}
              totalPages={totalPages}
              onPrev={() => setPage((current) => Math.max(1, current - 1))}
              onNext={() => setPage((current) => Math.min(totalPages, current + 1))}
            />
          </CardFooter>
        </Card>
      </div>

      <Dialog
        open={fullCommentReview !== null}
        onOpenChange={(open) => {
          if (!open) setFullCommentReview(null);
        }}
      >
        <DialogContent className="flex max-h-[min(90vh,640px)] w-[min(560px,calc(100vw-1.5rem))] flex-col gap-0 p-0 sm:max-w-lg">
          <DialogHeader className="shrink-0 border-b border-[var(--border-soft)] px-6 py-4 text-left">
            <DialogTitle className="sr-only">
              Opinión del cliente: {fullCommentReview?.product.nombre ?? ""}
            </DialogTitle>
            {fullCommentReview ? (
              <div className="flex flex-col gap-2 text-sm text-[var(--text-muted)]">
                <p>
                  <span className="font-medium text-[var(--text-main)]">
                    {fullCommentReview.user.nombre}
                  </span>
                  <span className="text-[var(--text-muted)]"> · </span>
                  <span className="font-medium text-[var(--text-main)]">
                    {fullCommentReview.product.nombre}
                  </span>
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <RatingStars rating={fullCommentReview.rating} />
                  <span>{formatDate(fullCommentReview.createdAt)}</span>
                  <Badge variant={statusBadgeVariant(fullCommentReview.status)}>
                    {formatReviewStatus(fullCommentReview.status)}
                  </Badge>
                </div>
              </div>
            ) : null}
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
            {fullCommentReview ? (
              <p className="whitespace-pre-wrap wrap-break-word text-base leading-relaxed text-[var(--text-main)]">
                {fullCommentReview.comment}
              </p>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Eliminar reseña"
        description={
          deleteTarget
            ? `Se eliminará la reseña de «${deleteTarget.user.nombre}» sobre «${deleteTarget.product.nombre}».`
            : undefined
        }
        tone="danger"
        busy={deleteTarget !== null && actionId === deleteTarget.id}
        confirmLabel="Eliminar reseña"
        onConfirm={() => void confirmDelete()}
        onCancel={() => {
          if (deleteTarget && actionId === deleteTarget.id) return;
          setDeleteTarget(null);
        }}
      />
    </>
  );
}

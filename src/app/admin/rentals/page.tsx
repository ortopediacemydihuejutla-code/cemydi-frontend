"use client";

import { useCallback, useState } from "react";
import {
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Eye,
  LoaderCircle,
  PackageCheck,
  RotateCcw,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  approveRental,
  deliverRental,
  downloadRentalPrescriptionItem,
  listAdminRentals,
  rejectRental,
  returnRental,
  type AdminRentalRequest,
  type RentalCounts,
  type RentalStatus,
} from "@/services/admin";
import { formatCurrencyMx, formatDateEsMx } from "@/lib/formatters";
import { AdminFilterTabs } from "@/features/admin/components/admin-filter-tabs";
import { AdminMetricCard } from "@/features/admin/components/admin-metric-card";
import { AdminPageLoading } from "@/features/admin/components/admin-page-loading";
import { AdminSearchField } from "@/features/admin/components/admin-search-field";
import { AdminTablePaginationNumbered } from "@/features/admin/components/admin-table-pagination-numbered";
import { PageHeader } from "@/features/admin/components/page-header";
import { useAdminDataBootstrap } from "@/features/admin/hooks/use-admin-data-bootstrap";
import { formatNumberEsMx } from "@/features/admin/lib/admin-list-utils";
import { Badge } from "@/features/admin/components/ui/badge";
import { Button } from "@/features/admin/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/features/admin/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/features/admin/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/features/admin/components/ui/table";

type StatusFilter = RentalStatus | "ALL";

const RENTALS_PAGE_SIZE = 20;

const STATUS_TABS: { id: StatusFilter; label: string }[] = [
  { id: "ALL", label: "Todas" },
  { id: "PENDING", label: "Pendientes" },
  { id: "APPROVED", label: "Aprobadas" },
  { id: "DELIVERED", label: "Entregadas" },
  { id: "RETURNED", label: "Devueltas" },
  { id: "REJECTED", label: "Rechazadas" },
  { id: "CANCELLED", label: "Canceladas" },
];

function statusLabel(status: RentalStatus) {
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

function statusVariant(status: RentalStatus) {
  if (status === "PENDING") return "amber" as const;
  if (status === "APPROVED" || status === "DELIVERED") return "blue" as const;
  if (status === "RETURNED") return "emerald" as const;
  if (status === "REJECTED") return "red" as const;
  return "slate" as const;
}

function createEmptyCounts(): RentalCounts {
  return {
    total: 0,
    PENDING: 0,
    APPROVED: 0,
    REJECTED: 0,
    CANCELLED: 0,
    DELIVERED: 0,
    RETURNED: 0,
  };
}

export default function AdminRentalsPage() {
  const [rentals, setRentals] = useState<AdminRentalRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [counts, setCounts] = useState<RentalCounts>(() => createEmptyCounts());
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: RENTALS_PAGE_SIZE,
    total: 0,
    totalPages: 1,
    hasPrevious: false,
    hasNext: false,
  });
  const [selectedRental, setSelectedRental] = useState<AdminRentalRequest | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const load = useCallback(async () => {
    const result = await listAdminRentals({
      status: statusFilter,
      search,
      page,
      pageSize: RENTALS_PAGE_SIZE,
    });
    setRentals(result.rentals);
    setCounts(result.counts);
    setPagination(result.pagination);
  }, [page, search, statusFilter]);

  const { blockingFullPage } = useAdminDataBootstrap({
    load,
    loadErrorFallback: "No se pudieron cargar las solicitudes de renta.",
  });

  const upsertRental = (rental: AdminRentalRequest) => {
    setRentals((current) => current.map((item) => (item.id === rental.id ? rental : item)));
    setSelectedRental((current) => (current?.id === rental.id ? rental : current));
  };

  const runAction = async (
    rental: AdminRentalRequest,
    action: () => Promise<{ rental: AdminRentalRequest; message: string }>,
    confirmMessage: string,
  ) => {
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setActionId(rental.id);
      const result = await action();
      upsertRental(result.rental);
      await load();
      toast.success(result.message);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo actualizar la renta.");
    } finally {
      setActionId(null);
    }
  };

  const openPrescription = async (item: AdminRentalRequest["items"][number]) => {
    if (!item.prescription) return;

    try {
      const result = await downloadRentalPrescriptionItem(item.id, item.prescription.fileName);
      const url = URL.createObjectURL(result.blob);
      window.open(url, "_blank", "noopener,noreferrer");
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo abrir la receta.");
    }
  };

  if (blockingFullPage) {
    return <AdminPageLoading layout="viewport" />;
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Rentas"
        subtitle="Revisa solicitudes de renta, valida disponibilidad y mueve cada solicitud por su flujo operativo."
      />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminMetricCard context="rentals-total" label="Solicitudes" value={formatNumberEsMx(counts.total)} />
        <AdminMetricCard context="rentals-pending" label="Pendientes" value={formatNumberEsMx(counts.PENDING)} />
        <AdminMetricCard context="rentals-approved" label="Aprobadas" value={formatNumberEsMx(counts.APPROVED)} />
        <AdminMetricCard context="rentals-delivered" label="En entrega" value={formatNumberEsMx(counts.DELIVERED)} />
      </section>

      <Card className="rounded-xl border-[var(--border-soft)] shadow-sm">
        <CardHeader className="gap-5 border-b border-[var(--border-soft)]">
          <div>
            <CardTitle>Solicitudes de renta</CardTitle>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              La aprobación descuenta stock. La devolución lo reintegra automáticamente.
            </p>
          </div>
          <AdminFilterTabs
            tabs={STATUS_TABS.map((tab) => ({
              id: tab.id,
              label: tab.label,
              count: tab.id === "ALL" ? counts.total : counts[tab.id],
            }))}
            activeId={statusFilter}
            onChange={(nextStatus) => {
              setStatusFilter(nextStatus);
              setPage(1);
            }}
            formatCount={formatNumberEsMx}
          />
          <AdminSearchField
            value={search}
            onChange={(nextSearch) => {
              setSearch(nextSearch);
              setPage(1);
            }}
            placeholder="Buscar por cliente, correo, producto o folio..."
            wrapperClassName="w-full max-w-md"
          />
          <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
            <ClipboardCheck className="size-4 opacity-70" aria-hidden />
            {pagination.total} resultado{pagination.total === 1 ? "" : "s"}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table style={{ minWidth: "980px" }}>
              <TableHeader>
                <TableRow>
                  <TableHead>Folio</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Productos</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rentals.map((rental) => {
                  const busy = actionId === rental.id;
                  return (
                    <TableRow key={rental.id}>
                      <TableCell className="font-mono text-xs">
                        {rental.id.slice(-8).toUpperCase()}
                      </TableCell>
                      <TableCell>
                        <div className="grid gap-0.5">
                          <span className="font-medium">{rental.user.nombre}</span>
                          <span className="text-xs text-[var(--text-muted)]">{rental.user.correo}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {rental.items.length} producto{rental.items.length === 1 ? "" : "s"}
                      </TableCell>
                      <TableCell>{formatDateEsMx(rental.createdAt, { style: "short" })}</TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrencyMx(rental.total, { fractionDigits: 0 })}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(rental.status)}>
                          {statusLabel(rental.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-wrap justify-end gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedRental(rental);
                              setRejectReason("");
                            }}
                          >
                            <Eye className="size-4" />
                            Ver
                          </Button>
                          {rental.status === "PENDING" ? (
                            <Button
                              type="button"
                              size="sm"
                              disabled={busy}
                              onClick={() =>
                                void runAction(
                                  rental,
                                  () => approveRental(rental.id),
                                  "¿Aprobar esta solicitud y descontar stock?",
                                )
                              }
                            >
                              {busy ? <LoaderCircle className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
                              Aprobar
                            </Button>
                          ) : null}
                          {rental.status === "APPROVED" ? (
                            <Button
                              type="button"
                              size="sm"
                              disabled={busy}
                              onClick={() =>
                                void runAction(
                                  rental,
                                  () => deliverRental(rental.id),
                                  "¿Marcar esta renta como entregada?",
                                )
                              }
                            >
                              <PackageCheck className="size-4" />
                              Entregar
                            </Button>
                          ) : null}
                          {rental.status === "DELIVERED" ? (
                            <Button
                              type="button"
                              size="sm"
                              disabled={busy}
                              onClick={() =>
                                void runAction(
                                  rental,
                                  () => returnRental(rental.id),
                                  "¿Marcar esta renta como devuelta y reintegrar stock?",
                                )
                              }
                            >
                              <RotateCcw className="size-4" />
                              Devolver
                            </Button>
                          ) : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          {rentals.length === 0 ? (
            <div className="grid min-h-64 place-items-center px-6 py-10 text-center">
              <div>
                <h2 className="text-xl font-semibold text-[var(--brand-900)]">
                  No hay rentas que mostrar
                </h2>
                <p className="mt-2 text-sm text-[var(--text-muted)]">
                  Ajusta el filtro o espera nuevas solicitudes desde el carrito.
                </p>
              </div>
            </div>
          ) : null}
        </CardContent>
        <CardFooter className="flex-col gap-4 border-t border-[var(--border-soft)] bg-[var(--card)] md:items-stretch lg:flex-row lg:items-center lg:justify-between">
          <AdminTablePaginationNumbered
            resultStart={
              pagination.total === 0
                ? 0
                : (pagination.page - 1) * pagination.pageSize + 1
            }
            resultEnd={Math.min(
              pagination.page * pagination.pageSize,
              pagination.total,
            )}
            totalCount={pagination.total}
            page={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={setPage}
            onPrev={() => setPage((current) => Math.max(1, current - 1))}
            onNext={() =>
              setPage((current) => Math.min(pagination.totalPages, current + 1))
            }
          />
        </CardFooter>
      </Card>

      <Dialog
        open={selectedRental !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedRental(null);
        }}
      >
        <DialogContent className="max-h-[90vh] w-[min(760px,calc(100vw-1.5rem))] overflow-y-auto sm:max-w-3xl">
          {selectedRental ? (
            <>
              <DialogHeader>
                <DialogTitle>
                  Renta {selectedRental.id.slice(-8).toUpperCase()}
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-5">
                <div className="grid gap-3 rounded-xl border border-border p-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Cliente</p>
                    <strong>{selectedRental.user.nombre}</strong>
                    <p className="text-sm text-muted-foreground">{selectedRental.user.correo}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedRental.user.telefono || "Sin teléfono"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Dirección</p>
                    <p className="text-sm">{selectedRental.user.direccion || "Sin dirección registrada"}</p>
                  </div>
                </div>

                <div className="grid gap-3">
                  {selectedRental.items.map((item) => (
                    <div key={item.id} className="rounded-xl border border-border p-4">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <strong>{item.quantity} x {item.product.nombre}</strong>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {formatDateEsMx(item.startDate, { style: "short" })} -{" "}
                            {formatDateEsMx(item.endDate, { style: "short" })} · {item.days} día(s)
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Stock actual: {item.product.stock}
                          </p>
                          {selectedRental.status === "PENDING" &&
                          item.product.stock < item.quantity ? (
                            <p className="mt-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
                              Stock insuficiente para aprobar esta línea.
                            </p>
                          ) : null}
                        </div>
                        <div className="text-left sm:text-right">
                          <strong>{formatCurrencyMx(item.lineTotal, { fractionDigits: 0 })}</strong>
                          <p className="text-sm text-muted-foreground">
                            {formatCurrencyMx(item.dailyPrice, { fractionDigits: 0 })}/día
                          </p>
                        </div>
                      </div>
                      {item.notes ? (
                        <p className="mt-3 rounded-lg bg-muted px-3 py-2 text-sm">
                          Nota: {item.notes}
                        </p>
                      ) : null}
                      {item.prescription ? (
                        <div className="mt-3 flex flex-col gap-3 rounded-lg border border-border bg-muted/40 px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex min-w-0 items-center gap-2">
                            <FileText className="size-4 shrink-0 text-[var(--brand-700)]" />
                            <span className="truncate text-sm font-medium">
                              {item.prescription.fileName}
                            </span>
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => void openPrescription(item)}
                          >
                            <Eye className="size-4" />
                            Abrir receta
                          </Button>
                        </div>
                      ) : item.product.requiereReceta ? (
                        <p className="mt-3 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
                          Este producto requiere receta y no tiene archivo adjunto.
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>

                <div className="grid gap-2 rounded-xl border border-border p-4">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal renta</span>
                    <strong>{formatCurrencyMx(selectedRental.subtotal, { fractionDigits: 0 })}</strong>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Depósitos</span>
                    <strong>{formatCurrencyMx(selectedRental.depositTotal, { fractionDigits: 0 })}</strong>
                  </div>
                  <div className="flex justify-between border-t border-border pt-2 text-base">
                    <span>Total estimado</span>
                    <strong>{formatCurrencyMx(selectedRental.total, { fractionDigits: 0 })}</strong>
                  </div>
                </div>

                <div className="grid gap-2 rounded-xl border border-border p-4 text-sm text-muted-foreground sm:grid-cols-2">
                  <span>Estado actualizado: {formatDateEsMx(selectedRental.statusUpdatedAt, { style: "short" })}</span>
                  {selectedRental.statusUpdatedBy ? (
                    <span>Por: {selectedRental.statusUpdatedBy.nombre}</span>
                  ) : null}
                  {selectedRental.approvedAt ? (
                    <span>Aprobada: {formatDateEsMx(selectedRental.approvedAt, { style: "short" })}</span>
                  ) : null}
                  {selectedRental.rejectedAt ? (
                    <span>Rechazada: {formatDateEsMx(selectedRental.rejectedAt, { style: "short" })}</span>
                  ) : null}
                  {selectedRental.cancelledAt ? (
                    <span>Cancelada: {formatDateEsMx(selectedRental.cancelledAt, { style: "short" })}</span>
                  ) : null}
                  {selectedRental.deliveredAt ? (
                    <span>Entregada: {formatDateEsMx(selectedRental.deliveredAt, { style: "short" })}</span>
                  ) : null}
                  {selectedRental.returnedAt ? (
                    <span>Devuelta: {formatDateEsMx(selectedRental.returnedAt, { style: "short" })}</span>
                  ) : null}
                </div>

                {selectedRental.status === "PENDING" ? (
                  <div className="grid gap-3 rounded-xl border border-border p-4">
                    <label className="grid gap-2 text-sm font-medium">
                      Motivo de rechazo
                      <textarea
                        value={rejectReason}
                        onChange={(event) => setRejectReason(event.target.value)}
                        className="min-h-24 rounded-md border border-input bg-transparent px-3 py-2 outline-none"
                        maxLength={500}
                        placeholder="Opcional"
                      />
                    </label>
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={actionId === selectedRental.id}
                        onClick={() =>
                          void runAction(selectedRental, () =>
                            rejectRental(selectedRental.id, rejectReason),
                            "¿Rechazar esta solicitud de renta?",
                          )
                        }
                      >
                        <XCircle className="size-4" />
                        Rechazar
                      </Button>
                      <Button
                        type="button"
                        disabled={actionId === selectedRental.id}
                        onClick={() =>
                          void runAction(selectedRental, () =>
                            approveRental(selectedRental.id),
                            "¿Aprobar esta solicitud y descontar stock?",
                          )
                        }
                      >
                        <CheckCircle2 className="size-4" />
                        Aprobar solicitud
                      </Button>
                    </div>
                  </div>
                ) : null}
                {selectedRental.status === "APPROVED" ? (
                  <div className="flex justify-end rounded-xl border border-border p-4">
                    <Button
                      type="button"
                      disabled={actionId === selectedRental.id}
                      onClick={() =>
                        void runAction(
                          selectedRental,
                          () => deliverRental(selectedRental.id),
                          "¿Marcar esta renta como entregada?",
                        )
                      }
                    >
                      <PackageCheck className="size-4" />
                      Marcar entregada
                    </Button>
                  </div>
                ) : null}
                {selectedRental.status === "DELIVERED" ? (
                  <div className="flex justify-end rounded-xl border border-border p-4">
                    <Button
                      type="button"
                      disabled={actionId === selectedRental.id}
                      onClick={() =>
                        void runAction(
                          selectedRental,
                          () => returnRental(selectedRental.id),
                          "¿Marcar esta renta como devuelta y reintegrar stock?",
                        )
                      }
                    >
                      <RotateCcw className="size-4" />
                      Marcar devuelta
                    </Button>
                  </div>
                ) : null}
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

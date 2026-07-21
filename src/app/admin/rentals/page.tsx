"use client";

import { useCallback, useState } from "react";
import {
  CheckCircle2,
  Ban,
  ClipboardCheck,
  FileText,
  Eye,
  LoaderCircle,
  PackageCheck,
  RotateCcw,
  ShieldCheck,
  ShieldX,
  WalletCards,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";

import { ConfirmDialog } from "@/components/feedback";
import {
  approveRental,
  cancelApprovedRental,
  deliverRental,
  downloadRentalDocument,
  listAdminRentals,
  rejectRental,
  reviewRentalDocument,
  returnRental,
  updateRentalDeposit,
  type AdminRentalRequest,
  type RentalCounts,
  type RentalStatus,
} from "@/services/admin";
import {
  formatCurrencyMx,
  formatDateEsMx,
  formatDateOnlyEsMx,
} from "@/lib/formatters";
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
type RentalActionKind =
  "approve" | "reject" | "deliver" | "return" | "cancelApproved";

type PendingRentalAction = {
  rental: AdminRentalRequest;
  kind: RentalActionKind;
};

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
      return "Entregada / activa";
    case "RETURNED":
      return "Devuelta";
    default:
      return status;
  }
}

function documentStatusLabel(
  status: NonNullable<
    AdminRentalRequest["items"][number]["prescription"]
  >["status"],
) {
  if (status === "APROBADO") return "Aprobada";
  if (status === "RECHAZADO") return "Rechazada";
  if (status === "EN_REVISION") return "En revisión";
  return "Pendiente";
}

function depositStatusLabel(status: AdminRentalRequest["depositStatus"]) {
  if (status === "RETURNED") return "Devuelto";
  if (status === "RETAINED") return "Retenido";
  if (status === "PARTIALLY_RETAINED") return "Retención parcial";
  return "Pendiente de resolución";
}

function canApproveRental(rental: AdminRentalRequest) {
  return rental.items.every(
    (item) =>
      !item.product.requiereReceta || item.prescription?.status === "APROBADO",
  );
}

function statusVariant(status: RentalStatus) {
  if (status === "PENDING") return "amber" as const;
  if (status === "APPROVED") return "emerald" as const;
  if (status === "DELIVERED") return "blue" as const;
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
  const [selectedRental, setSelectedRental] =
    useState<AdminRentalRequest | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [pendingAction, setPendingAction] =
    useState<PendingRentalAction | null>(null);
  const [documentRejectReasons, setDocumentRejectReasons] = useState<
    Record<string, string>
  >({});
  const [documentActionId, setDocumentActionId] = useState<string | null>(null);
  const [depositStatus, setDepositStatus] = useState<
    "RETURNED" | "RETAINED" | "PARTIALLY_RETAINED"
  >("RETURNED");
  const [depositReturnedAmount, setDepositReturnedAmount] = useState(0);
  const [depositRetainedAmount, setDepositRetainedAmount] = useState(0);
  const [depositNotes, setDepositNotes] = useState("");
  const [depositBusy, setDepositBusy] = useState(false);

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
    setRentals((current) =>
      current.map((item) => (item.id === rental.id ? rental : item)),
    );
    setSelectedRental((current) =>
      current?.id === rental.id ? rental : current,
    );
  };

  const openRental = (rental: AdminRentalRequest) => {
    setSelectedRental(rental);
    setRejectReason("");
    setDepositStatus(
      rental.depositStatus === "PENDING" ? "RETURNED" : rental.depositStatus,
    );
    setDepositReturnedAmount(
      rental.depositStatus === "PENDING"
        ? rental.depositTotal
        : rental.depositReturnedAmount,
    );
    setDepositRetainedAmount(rental.depositRetainedAmount);
    setDepositNotes(rental.depositNotes ?? "");
  };

  const confirmPendingAction = async () => {
    if (!pendingAction) return;

    const { rental, kind } = pendingAction;
    try {
      setActionId(rental.id);
      const result =
        kind === "approve"
          ? await approveRental(rental.id)
          : kind === "reject"
            ? await rejectRental(rental.id, rejectReason)
            : kind === "deliver"
              ? await deliverRental(rental.id)
              : kind === "return"
                ? await returnRental(rental.id)
                : await cancelApprovedRental(rental.id);
      upsertRental(result.rental);
      await load();
      toast.success(result.message);
      setPendingAction(null);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "No se pudo actualizar la renta.",
      );
    } finally {
      setActionId(null);
    }
  };

  const pendingActionCopy = pendingAction
    ? pendingAction.kind === "approve"
      ? {
          title: "Aprobar solicitud",
          description:
            "Se descontará el stock disponible y la solicitud quedará aprobada.",
          confirmLabel: "Sí, aprobar solicitud",
          tone: "success" as const,
        }
      : pendingAction.kind === "reject"
        ? {
            title: "Rechazar solicitud",
            description: rejectReason.trim()
              ? `La solicitud quedará rechazada con el motivo: «${rejectReason.trim()}».`
              : "La solicitud quedará rechazada sin un motivo registrado.",
            confirmLabel: "Sí, rechazar solicitud",
            tone: "danger" as const,
          }
        : pendingAction.kind === "deliver"
          ? {
              title: "Marcar como entregada",
              description: "La solicitud avanzará al estado Entregada.",
              confirmLabel: "Sí, marcar entregada",
              tone: "default" as const,
            }
          : {
              title:
                pendingAction.kind === "return"
                  ? "Marcar como devuelta"
                  : "Cancelar solicitud aprobada",
              description:
                pendingAction.kind === "return"
                  ? "La renta quedará devuelta y el stock se reintegrará automáticamente una sola vez."
                  : "La solicitud quedará cancelada y la reserva de stock se restaurará una sola vez.",
              confirmLabel:
                pendingAction.kind === "return"
                  ? "Sí, marcar devuelta"
                  : "Sí, cancelar y restaurar",
              tone:
                pendingAction.kind === "return"
                  ? ("default" as const)
                  : ("danger" as const),
            }
    : null;

  const openPrescription = async (
    item: AdminRentalRequest["items"][number],
  ) => {
    if (!item.prescription) return;

    try {
      const result = await downloadRentalDocument(
        item.prescription.id,
        item.prescription.fileName,
      );
      const url = URL.createObjectURL(result.blob);
      window.open(url, "_blank", "noopener,noreferrer");
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "No se pudo abrir la receta.",
      );
    }
  };

  const handleDocumentReview = async (
    item: AdminRentalRequest["items"][number],
    status: "APROBADO" | "RECHAZADO",
  ) => {
    if (!item.prescription || !selectedRental) return;
    const reason = documentRejectReasons[item.prescription.id]?.trim();
    if (status === "RECHAZADO" && !reason) {
      toast.error("Escribe el motivo del rechazo de la receta.");
      return;
    }
    try {
      setDocumentActionId(item.prescription.id);
      const result = await reviewRentalDocument(
        item.prescription.id,
        status,
        reason,
      );
      const nextRental = {
        ...selectedRental,
        items: selectedRental.items.map((current) =>
          current.id === item.id
            ? { ...current, prescription: result.document }
            : current,
        ),
      };
      upsertRental(nextRental);
      toast.success(result.message);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo revisar la receta.",
      );
    } finally {
      setDocumentActionId(null);
    }
  };

  const handleDeposit = async () => {
    if (!selectedRental) return;
    try {
      setDepositBusy(true);
      const result = await updateRentalDeposit(selectedRental.id, {
        status: depositStatus,
        returnedAmount: depositReturnedAmount,
        retainedAmount: depositRetainedAmount,
        notes: depositNotes,
      });
      upsertRental(result.rental);
      toast.success(result.message);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el depósito.",
      );
    } finally {
      setDepositBusy(false);
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
        <AdminMetricCard
          context="rentals-total"
          label="Solicitudes"
          value={formatNumberEsMx(counts.total)}
        />
        <AdminMetricCard
          context="rentals-pending"
          label="Pendientes"
          value={formatNumberEsMx(counts.PENDING)}
        />
        <AdminMetricCard
          context="rentals-approved"
          label="Aprobadas"
          value={formatNumberEsMx(counts.APPROVED)}
        />
        <AdminMetricCard
          context="rentals-delivered"
          label="Entregadas"
          value={formatNumberEsMx(counts.DELIVERED)}
        />
      </section>

      <Card className="rounded-xl border-[var(--border-soft)] shadow-sm">
        <CardHeader className="gap-5 border-b border-[var(--border-soft)]">
          <div>
            <CardTitle>Solicitudes de renta</CardTitle>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              La aprobación descuenta stock. La devolución lo reintegra
              automáticamente.
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
                        {rental.folio ?? rental.id.slice(-8).toUpperCase()}
                      </TableCell>
                      <TableCell>
                        <div className="grid gap-0.5">
                          <span className="font-medium">
                            {rental.user.nombre}
                          </span>
                          <span className="text-xs text-[var(--text-muted)]">
                            {rental.user.correo}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {rental.items.length} producto
                        {rental.items.length === 1 ? "" : "s"}
                      </TableCell>
                      <TableCell>
                        {formatDateEsMx(rental.createdAt, { style: "short" })}
                      </TableCell>
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
                            onClick={() => openRental(rental)}
                          >
                            <Eye className="size-4" />
                            Ver detalles
                          </Button>
                          {rental.status === "PENDING" ? (
                            <Button
                              type="button"
                              size="sm"
                              variant="success"
                              disabled={busy || !canApproveRental(rental)}
                              onClick={() =>
                                setPendingAction({ rental, kind: "approve" })
                              }
                            >
                              {busy ? (
                                <LoaderCircle className="size-4 animate-spin" />
                              ) : (
                                <CheckCircle2 className="size-4" />
                              )}
                              Aprobar solicitud
                            </Button>
                          ) : null}
                          {rental.status === "APPROVED" ? (
                            <>
                              <Button
                                type="button"
                                size="sm"
                                variant="update"
                                disabled={busy}
                                onClick={() =>
                                  setPendingAction({ rental, kind: "deliver" })
                                }
                              >
                                <PackageCheck className="size-4" />
                                Marcar entregada
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="destructive"
                                disabled={busy}
                                onClick={() =>
                                  setPendingAction({
                                    rental,
                                    kind: "cancelApproved",
                                  })
                                }
                              >
                                <Ban className="size-4" />
                                Cancelar
                              </Button>
                            </>
                          ) : null}
                          {rental.status === "DELIVERED" ? (
                            <Button
                              type="button"
                              size="sm"
                              variant="update"
                              disabled={busy}
                              onClick={() =>
                                setPendingAction({ rental, kind: "return" })
                              }
                            >
                              <RotateCcw className="size-4" />
                              Marcar devuelta
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
                  Solicitud de renta{" "}
                  {selectedRental.folio ??
                    selectedRental.id.slice(-8).toUpperCase()}
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-5">
                <section className="grid gap-4 border-t border-border pt-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Solicitante</p>
                    <strong>
                      {selectedRental.applicantName ??
                        selectedRental.user.nombre}
                    </strong>
                    <p className="text-sm text-muted-foreground">
                      {selectedRental.applicantEmail ??
                        selectedRental.user.correo}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedRental.applicantPhone ??
                        selectedRental.user.telefono ??
                        "Sin teléfono"}
                    </p>
                    {selectedRental.isForAnotherPerson ? (
                      <p className="mt-2 text-sm text-muted-foreground">
                        Paciente:{" "}
                        {selectedRental.patientName ?? "No especificado"}
                        {selectedRental.patientRelationship
                          ? ` · ${selectedRental.patientRelationship}`
                          : ""}
                      </p>
                    ) : null}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Entrega</p>
                    <strong>
                      {selectedRental.deliveryMethod === "HOME_DELIVERY"
                        ? "Entrega a domicilio"
                        : "Recolección en sucursal"}
                    </strong>
                    {selectedRental.deliveryMethod === "HOME_DELIVERY" ? (
                      <p className="text-sm text-muted-foreground">
                        {[
                          selectedRental.deliveryAddress,
                          selectedRental.deliveryNeighborhood,
                          selectedRental.deliveryPostalCode,
                          selectedRental.deliveryMunicipality,
                        ]
                          .filter(Boolean)
                          .join(", ") || "Sin dirección registrada"}
                      </p>
                    ) : null}
                    {selectedRental.preferredSchedule ? (
                      <p className="text-sm text-muted-foreground">
                        Horario: {selectedRental.preferredSchedule}
                      </p>
                    ) : null}
                  </div>
                </section>

                <section className="border-t border-border pt-2">
                  {selectedRental.items.map((item) => (
                    <div
                      key={item.id}
                      className="border-b border-border py-4 last:border-b-0"
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <strong>
                            {item.quantity} x {item.product.nombre}
                          </strong>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {formatDateOnlyEsMx(item.startDate, { style: "short" })}{" "}
                            - {formatDateOnlyEsMx(item.endDate, { style: "short" })}{" "}
                            · {item.days} día(s)
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
                          <strong>
                            {formatCurrencyMx(item.lineTotal, {
                              fractionDigits: 0,
                            })}
                          </strong>
                          <p className="text-sm text-muted-foreground">
                            {formatCurrencyMx(item.dailyPrice, {
                              fractionDigits: 0,
                            })}
                            /día
                          </p>
                        </div>
                      </div>
                      {item.notes ? (
                        <p className="mt-3 rounded-lg bg-muted px-3 py-2 text-sm">
                          Nota: {item.notes}
                        </p>
                      ) : null}
                      {item.prescription ? (
                        <div className="mt-4 grid gap-3 border-t border-border pt-3">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex min-w-0 items-center gap-2">
                              <FileText className="size-4 shrink-0 text-[var(--brand-700)]" />
                              <span className="truncate text-sm font-medium">
                                {item.prescription.fileName}
                              </span>
                              <Badge
                                variant={
                                  item.prescription.status === "APROBADO"
                                    ? "emerald"
                                    : item.prescription.status === "RECHAZADO"
                                      ? "red"
                                      : "amber"
                                }
                              >
                                {documentStatusLabel(item.prescription.status)}
                              </Badge>
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
                          {item.prescription.rejectionReason ? (
                            <p className="text-sm text-red-700">
                              Motivo: {item.prescription.rejectionReason}
                            </p>
                          ) : null}
                          {selectedRental.status === "PENDING" ? (
                            <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                              <label className="grid gap-1 text-sm font-medium">
                                Motivo si se rechaza
                                <input
                                  value={
                                    documentRejectReasons[
                                      item.prescription.id
                                    ] ?? ""
                                  }
                                  onChange={(event) =>
                                    setDocumentRejectReasons((current) => ({
                                      ...current,
                                      [item.prescription!.id]:
                                        event.target.value,
                                    }))
                                  }
                                  maxLength={500}
                                  className="h-9 rounded-md border border-input bg-transparent px-3 text-sm outline-none"
                                  placeholder="Documento ilegible, datos incompletos..."
                                />
                              </label>
                              <div className="flex flex-wrap gap-2">
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="destructive"
                                  disabled={
                                    documentActionId === item.prescription.id
                                  }
                                  onClick={() =>
                                    void handleDocumentReview(item, "RECHAZADO")
                                  }
                                >
                                  <ShieldX className="size-4" /> Rechazar receta
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="success"
                                  disabled={
                                    documentActionId === item.prescription.id
                                  }
                                  onClick={() =>
                                    void handleDocumentReview(item, "APROBADO")
                                  }
                                >
                                  <ShieldCheck className="size-4" /> Aprobar
                                  receta
                                </Button>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      ) : item.product.requiereReceta ? (
                        <p className="mt-3 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
                          Este producto requiere receta y no tiene archivo
                          adjunto.
                        </p>
                      ) : null}
                    </div>
                  ))}
                </section>

                <section className="grid gap-2 border-t border-border pt-4">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal renta</span>
                    <strong>
                      {formatCurrencyMx(selectedRental.subtotal, {
                        fractionDigits: 0,
                      })}
                    </strong>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Depósitos</span>
                    <strong>
                      {formatCurrencyMx(selectedRental.depositTotal, {
                        fractionDigits: 0,
                      })}
                    </strong>
                  </div>
                  <div className="flex justify-between border-t border-border pt-2 text-base">
                    <span>Total estimado</span>
                    <strong>
                      {formatCurrencyMx(selectedRental.total, {
                        fractionDigits: 0,
                      })}
                    </strong>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 text-sm">
                    <span className="flex items-center gap-2">
                      <WalletCards className="size-4" /> Estado del depósito
                    </span>
                    <Badge
                      variant={
                        selectedRental.depositStatus === "PENDING"
                          ? "amber"
                          : selectedRental.depositRetainedAmount > 0
                            ? "red"
                            : "emerald"
                      }
                    >
                      {depositStatusLabel(selectedRental.depositStatus)}
                    </Badge>
                  </div>
                  {selectedRental.depositResolvedAt ? (
                    <p className="text-sm text-muted-foreground">
                      Devuelto:{" "}
                      {formatCurrencyMx(selectedRental.depositReturnedAmount)} ·
                      Retenido:{" "}
                      {formatCurrencyMx(selectedRental.depositRetainedAmount)}
                    </p>
                  ) : null}
                </section>

                <section className="grid gap-2 border-t border-border pt-4 text-sm text-muted-foreground sm:grid-cols-2">
                  <span>
                    Estado actualizado:{" "}
                    {formatDateEsMx(selectedRental.statusUpdatedAt, {
                      style: "short",
                    })}
                  </span>
                  {selectedRental.statusUpdatedBy ? (
                    <span>Por: {selectedRental.statusUpdatedBy.nombre}</span>
                  ) : null}
                  {selectedRental.approvedAt ? (
                    <span>
                      Aprobada:{" "}
                      {formatDateEsMx(selectedRental.approvedAt, {
                        style: "short",
                      })}
                    </span>
                  ) : null}
                  {selectedRental.rejectedAt ? (
                    <span>
                      Rechazada:{" "}
                      {formatDateEsMx(selectedRental.rejectedAt, {
                        style: "short",
                      })}
                    </span>
                  ) : null}
                  {selectedRental.cancelledAt ? (
                    <span>
                      Cancelada:{" "}
                      {formatDateEsMx(selectedRental.cancelledAt, {
                        style: "short",
                      })}
                    </span>
                  ) : null}
                  {selectedRental.deliveredAt ? (
                    <span>
                      Entregada:{" "}
                      {formatDateEsMx(selectedRental.deliveredAt, {
                        style: "short",
                      })}
                    </span>
                  ) : null}
                  {selectedRental.returnedAt ? (
                    <span>
                      Devuelta:{" "}
                      {formatDateEsMx(selectedRental.returnedAt, {
                        style: "short",
                      })}
                    </span>
                  ) : null}
                </section>

                <section className="border-t border-border pt-4">
                  <h3 className="font-semibold">Historial de estados</h3>
                  {selectedRental.statusHistory.length > 0 ? (
                    <ol className="mt-3 grid gap-3">
                      {selectedRental.statusHistory.map((entry) => (
                        <li
                          key={entry.id}
                          className="grid gap-0.5 border-l-2 border-[var(--brand-600)] pl-3 text-sm"
                        >
                          <strong>
                            {entry.fromStatus
                              ? `${statusLabel(entry.fromStatus)} → `
                              : ""}
                            {statusLabel(entry.toStatus)}
                          </strong>
                          <span className="text-muted-foreground">
                            {formatDateEsMx(entry.createdAt, {
                              style: "short",
                            })}
                            {entry.actor ? ` · ${entry.actor.nombre}` : ""}
                          </span>
                          {entry.note ? (
                            <span className="text-muted-foreground">
                              {entry.note}
                            </span>
                          ) : null}
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="mt-2 text-sm text-muted-foreground">
                      Sin eventos históricos previos. El historial comienza con
                      las transiciones de Fase 4.
                    </p>
                  )}
                </section>

                {selectedRental.status === "PENDING" ? (
                  <section className="grid gap-3 border-t border-border pt-4">
                    <label className="grid gap-2 text-sm font-medium">
                      Motivo de rechazo{" "}
                      <span className="font-normal text-muted-foreground">
                        (opcional)
                      </span>
                      <textarea
                        value={rejectReason}
                        onChange={(event) =>
                          setRejectReason(event.target.value)
                        }
                        className="min-h-24 rounded-md border border-input bg-transparent px-3 py-2 outline-none"
                        maxLength={500}
                        placeholder="Escribe el motivo del rechazo"
                      />
                    </label>
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button
                        type="button"
                        variant="destructive"
                        disabled={actionId === selectedRental.id}
                        onClick={() =>
                          setPendingAction({
                            rental: selectedRental,
                            kind: "reject",
                          })
                        }
                      >
                        <XCircle className="size-4" />
                        Rechazar
                      </Button>
                      <Button
                        type="button"
                        variant="success"
                        disabled={
                          actionId === selectedRental.id ||
                          !canApproveRental(selectedRental)
                        }
                        onClick={() =>
                          setPendingAction({
                            rental: selectedRental,
                            kind: "approve",
                          })
                        }
                      >
                        <CheckCircle2 className="size-4" />
                        Aprobar solicitud
                      </Button>
                    </div>
                    {!canApproveRental(selectedRental) ? (
                      <p className="text-sm font-medium text-amber-700">
                        Aprueba todas las recetas obligatorias antes de aprobar
                        la solicitud.
                      </p>
                    ) : null}
                  </section>
                ) : null}
                {selectedRental.status === "APPROVED" ? (
                  <section className="flex flex-wrap justify-end gap-2 border-t border-border pt-4">
                    <Button
                      type="button"
                      variant="destructive"
                      disabled={actionId === selectedRental.id}
                      onClick={() =>
                        setPendingAction({
                          rental: selectedRental,
                          kind: "cancelApproved",
                        })
                      }
                    >
                      <Ban className="size-4" />
                      Cancelar y restaurar stock
                    </Button>
                    <Button
                      type="button"
                      variant="update"
                      disabled={actionId === selectedRental.id}
                      onClick={() =>
                        setPendingAction({
                          rental: selectedRental,
                          kind: "deliver",
                        })
                      }
                    >
                      <PackageCheck className="size-4" />
                      Marcar entregada
                    </Button>
                  </section>
                ) : null}
                {selectedRental.status === "DELIVERED" ? (
                  <section className="flex justify-end border-t border-border pt-4">
                    <Button
                      type="button"
                      variant="update"
                      disabled={actionId === selectedRental.id}
                      onClick={() =>
                        setPendingAction({
                          rental: selectedRental,
                          kind: "return",
                        })
                      }
                    >
                      <RotateCcw className="size-4" />
                      Marcar devuelta
                    </Button>
                  </section>
                ) : null}
                {selectedRental.status === "RETURNED" ? (
                  <section className="grid gap-3 border-t border-border pt-4">
                    <div>
                      <h3 className="font-semibold">Resolución del depósito</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Registra la devolución o retención administrativa. Este
                        paso no procesa pagos.
                      </p>
                    </div>
                    <label className="grid gap-1 text-sm font-medium">
                      Resultado
                      <select
                        value={depositStatus}
                        onChange={(event) => {
                          const next = event.target
                            .value as typeof depositStatus;
                          setDepositStatus(next);
                          if (next === "RETURNED") {
                            setDepositReturnedAmount(
                              selectedRental.depositTotal,
                            );
                            setDepositRetainedAmount(0);
                          } else if (next === "RETAINED") {
                            setDepositReturnedAmount(0);
                            setDepositRetainedAmount(
                              selectedRental.depositTotal,
                            );
                          }
                        }}
                        className="h-9 rounded-md border border-input bg-transparent px-3 text-sm outline-none"
                      >
                        <option value="RETURNED">Devuelto completo</option>
                        <option value="RETAINED">Retenido completo</option>
                        <option value="PARTIALLY_RETAINED">
                          Retención parcial
                        </option>
                      </select>
                    </label>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="grid gap-1 text-sm font-medium">
                        Monto devuelto
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          value={depositReturnedAmount}
                          onChange={(event) =>
                            setDepositReturnedAmount(Number(event.target.value))
                          }
                          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm outline-none"
                        />
                      </label>
                      <label className="grid gap-1 text-sm font-medium">
                        Monto retenido
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          value={depositRetainedAmount}
                          onChange={(event) =>
                            setDepositRetainedAmount(Number(event.target.value))
                          }
                          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm outline-none"
                        />
                      </label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Los montos deben sumar{" "}
                      {formatCurrencyMx(selectedRental.depositTotal)}.
                    </p>
                    <label className="grid gap-1 text-sm font-medium">
                      Notas administrativas
                      <textarea
                        value={depositNotes}
                        onChange={(event) =>
                          setDepositNotes(event.target.value)
                        }
                        maxLength={500}
                        className="min-h-20 rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none"
                        placeholder="Condición del equipo o motivo de retención"
                      />
                    </label>
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="update"
                        disabled={depositBusy}
                        onClick={() => void handleDeposit()}
                      >
                        {depositBusy ? (
                          <LoaderCircle className="size-4 animate-spin" />
                        ) : (
                          <WalletCards className="size-4" />
                        )}
                        Guardar resolución
                      </Button>
                    </div>
                  </section>
                ) : null}
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={pendingAction !== null}
        title={pendingActionCopy?.title ?? "Confirmar acción"}
        description={pendingActionCopy?.description}
        confirmLabel={pendingActionCopy?.confirmLabel}
        tone={pendingActionCopy?.tone}
        busy={pendingAction !== null && actionId === pendingAction.rental.id}
        onConfirm={() => void confirmPendingAction()}
        onCancel={() => setPendingAction(null)}
      />
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  ExternalLink,
  FileText,
  Mail,
  MapPin,
  PackageCheck,
  Phone,
  Upload,
  UserRound,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";

import { AuthRouteLoading } from "@/components/auth/auth-route-loading";
import RentalCancellationDialog from "@/components/rentals/RentalCancellationDialog";
import {
  getRentalDueDate,
  getRentalStatusPresentation,
  rentalStatusLabel,
} from "@/components/rentals/rental-status";
import {
  formatCurrencyMx,
  formatDateEsMx,
  formatDateOnlyEsMx,
} from "@/lib/formatters";
import { useAuth } from "@/providers/AuthContext";
import { isOptimizableImageUrl } from "@/lib/cloudinary-image";
import {
  cancelMyRental,
  getMyRental,
  getRentalDocumentContent,
  uploadRentalItemPrescription,
  type RentalRequest,
} from "@/services/rentals";
import {
  PRESCRIPTION_ACCEPT,
  validatePrescriptionFile,
} from "@/lib/rental-prescription";

type Prescription = NonNullable<RentalRequest["items"][number]["prescription"]>;

function formatFileSize(bytes: number | null) {
  if (!bytes) return "Tamaño no disponible";
  if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  return Math.max(1, Math.round(bytes / 1024)) + " KB";
}

function documentStatusLabel(status: Prescription["status"]) {
  if (status === "EN_REVISION") return "En revisión";
  if (status === "APROBADO") return "Aprobada";
  if (status === "RECHAZADO") return "Rechazada";
  return "Pendiente";
}

function getNextAction(rental: RentalRequest) {
  if (
    rental.status === "PENDING" &&
    rental.items.some(
      (item) =>
        item.product.requiereReceta &&
        (!item.prescription || item.prescription.status === "RECHAZADO"),
    )
  ) {
    return "Adjunta o reemplaza la receta pendiente para continuar la revisión.";
  }
  if (rental.status === "PENDING") {
    return "CEMYDI revisará disponibilidad y documentos.";
  }
  if (rental.status === "APPROVED") {
    return "Espera la coordinación de entrega o recolección.";
  }
  if (rental.status === "DELIVERED") {
    return "Conserva el equipo y prepáralo para la fecha de devolución.";
  }
  if (rental.status === "RETURNED") return "La renta está finalizada.";
  if (rental.status === "REJECTED") {
    return "Consulta el motivo y contacta a CEMYDI si necesitas orientación.";
  }
  return "La solicitud fue cancelada; puedes iniciar una nueva renta.";
}

function Timeline({ rental }: { rental: RentalRequest }) {
  const legacyEntries = [
    {
      label: "Solicitud enviada",
      date: rental.createdAt,
      complete: true,
      note: null,
    },
    rental.approvedAt
      ? {
          label: "Solicitud aprobada",
          date: rental.approvedAt,
          complete: true,
          note: null,
        }
      : null,
    rental.rejectedAt
      ? {
          label: "Solicitud rechazada",
          date: rental.rejectedAt,
          complete: true,
          note: rental.rejectedReason,
        }
      : null,
    rental.cancelledAt
      ? {
          label: "Solicitud cancelada",
          date: rental.cancelledAt,
          complete: true,
          note: null,
        }
      : null,
    rental.deliveredAt
      ? {
          label: "Equipo entregado",
          date: rental.deliveredAt,
          complete: true,
          note: null,
        }
      : null,
    rental.returnedAt
      ? {
          label: "Equipo devuelto",
          date: rental.returnedAt,
          complete: true,
          note: null,
        }
      : null,
  ].filter((entry): entry is NonNullable<typeof entry> => entry !== null);
  const entries =
    rental.statusHistory.length > 0
      ? rental.statusHistory.map((entry) => ({
          label: rentalStatusLabel(entry.toStatus),
          date: entry.createdAt,
          complete: true,
          note: entry.note,
        }))
      : legacyEntries;

  return (
    <ol className="mt-4">
      {entries.map((entry, index) => (
        <li
          key={`${entry.label}-${index}`}
          className="relative flex gap-3 pb-5 last:pb-0"
        >
          {index < entries.length - 1 ? (
            <span className="absolute left-[9px] top-5 h-full w-px bg-[#dbe5e7]" />
          ) : null}
          <span
            className={
              "relative z-10 mt-0.5 grid size-5 shrink-0 place-items-center rounded-full " +
              (entry.complete
                ? "bg-[#1f6a67] text-white"
                : "border border-[#cddbdd] bg-white text-[#829399]")
            }
          >
            {entry.complete ? (
              <CheckCircle2 className="size-3" />
            ) : (
              <Clock3 className="size-3" />
            )}
          </span>
          <div>
            <p
              className={
                "text-sm font-semibold " +
                (entry.complete ? "text-[#17333f]" : "text-[#71858c]")
              }
            >
              {entry.label}
            </p>
            <p className="mt-0.5 text-xs text-[#71858c]">
              {entry.date
                ? formatDateEsMx(entry.date, { style: "short" })
                : "Pendiente"}
            </p>
            {entry.note ? (
              <p className="mt-1 text-xs leading-5 text-[#607173]">
                {entry.note}
              </p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}

export default function RentalDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const rentalId = typeof params.id === "string" ? params.id : "";
  const [rental, setRental] = useState<RentalRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [documentAction, setDocumentAction] = useState<string | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [uploadingItemId, setUploadingItemId] = useState<number | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.rol !== "CLIENT") router.replace("/perfil");
  }, [authLoading, router, user]);

  useEffect(() => {
    if (authLoading || !user || user.rol !== "CLIENT" || !rentalId) return;
    let cancelled = false;

    void (async () => {
      try {
        const result = await getMyRental(rentalId);
        if (!cancelled) setRental(result.rental);
      } catch (error) {
        if (!cancelled) {
          setNotFound(true);
          toast.error(
            error instanceof Error
              ? error.message
              : "No se pudo cargar la solicitud.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authLoading, rentalId, user]);

  const handleDocument = async (
    prescription: Prescription,
    disposition: "inline" | "attachment",
  ) => {
    const actionId = prescription.id + ":" + disposition;
    const previewWindow =
      disposition === "inline" ? window.open("about:blank", "_blank") : null;
    if (disposition === "inline" && !previewWindow) {
      toast.error("Permite ventanas emergentes para visualizar la receta.");
      return;
    }
    if (previewWindow) previewWindow.opener = null;
    try {
      setDocumentAction(actionId);
      const blob = await getRentalDocumentContent(prescription.id, disposition);
      const objectUrl = URL.createObjectURL(blob);
      if (disposition === "inline") {
        previewWindow?.location.replace(objectUrl);
      } else {
        const anchor = document.createElement("a");
        anchor.href = objectUrl;
        anchor.download = prescription.fileName;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
      }
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
    } catch (error) {
      previewWindow?.close();
      toast.error(
        error instanceof Error ? error.message : "No se pudo abrir la receta.",
      );
    } finally {
      setDocumentAction(null);
    }
  };

  const handleCancel = async () => {
    if (!rental) return;
    try {
      setCanceling(true);
      const result = await cancelMyRental(rental.id);
      setRental(result.rental);
      setCancelDialogOpen(false);
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

  const handlePrescriptionReplacement = async (
    itemId: number,
    files: FileList | null,
  ) => {
    const file = files?.[0];
    if (!file) return;
    const validationError = validatePrescriptionFile(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      setUploadingItemId(itemId);
      setUploadProgress(0);
      const result = await uploadRentalItemPrescription(
        itemId,
        file,
        setUploadProgress,
      );
      const refreshed = await getMyRental(rentalId);
      setRental(refreshed.rental);
      toast.success(result.message);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo reemplazar la receta.",
      );
    } finally {
      setUploadingItemId(null);
      setUploadProgress(0);
    }
  };

  if (authLoading || loading) {
    return (
      <AuthRouteLoading
        title="Cargando detalle"
        description="Consultando tu solicitud de renta..."
      />
    );
  }
  if (!user || user.rol !== "CLIENT") return null;

  if (notFound || !rental) {
    return (
      <div className="min-h-[calc(100vh-120px)] bg-[#f3f6f6] px-4 py-12">
        <div className="mx-auto max-w-[680px] rounded-[26px] border border-[#dae5e5] bg-white px-6 py-12 text-center shadow-[0_18px_36px_rgba(16,50,49,0.08)]">
          <PackageCheck className="mx-auto size-11 text-[#71858c]" />
          <h1 className="mt-4 text-2xl font-semibold text-[#17333f]">
            Solicitud no disponible
          </h1>
          <p className="mt-2 text-[#607173]">
            No existe o no pertenece a tu cuenta.
          </p>
          <Link
            href="/mis-rentas"
            className="mt-6 inline-flex rounded-full bg-[#1f6a67] px-5 py-3 font-bold text-white no-underline"
          >
            Volver a mis rentas
          </Link>
        </div>
      </div>
    );
  }

  const presentation = getRentalStatusPresentation(rental);
  const dueDate = getRentalDueDate(rental);
  const displayFolio =
    rental.folio ?? "Solicitud " + rental.id.slice(-8).toUpperCase();
  const nextAction = getNextAction(rental);

  return (
    <div className="min-h-[calc(100vh-120px)] bg-[#f3f6f6] px-4 py-9">
      <main className="mx-auto max-w-[1080px]">
        <Link
          href="/mis-rentas"
          className="inline-flex items-center gap-2 text-sm font-bold text-[#1f6a67] no-underline"
        >
          <ArrowLeft className="size-4" /> Volver a mis rentas
        </Link>

        <header className="mt-5 flex flex-col gap-4 border-b border-[#dbe5e7] pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <span
              className={
                "rounded-full px-3 py-1 text-xs font-bold " +
                presentation.className
              }
            >
              {presentation.label}
            </span>
            <h1 className="mt-3 text-[2rem] font-semibold leading-tight text-[#0f3231] sm:text-[2.35rem]">
              {displayFolio}
            </h1>
            <p className="mt-2 text-[#607173]">
              Enviada el {formatDateEsMx(rental.createdAt, { style: "short" })}{" "}
              · Estado operativo: {rentalStatusLabel(rental.status)}
            </p>
            <p className="mt-1 text-sm text-[#71858c]">
              Última actualización: {formatDateEsMx(rental.updatedAt, { style: "datetime" })}
            </p>
          </div>
          <div className="text-left sm:text-right">
            <strong className="text-[1.8rem] text-[#1f6a67]">
              {formatCurrencyMx(rental.total)}
            </strong>
            <p className="text-sm text-[#607173]">Total inicial estimado</p>
          </div>
        </header>

        <div className="mt-5 flex items-start gap-3 rounded-xl border border-[#cfe0e3] bg-[#f8fbfb] px-4 py-3 text-sm leading-6 text-[#405b65]">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-[#1f6a67]" />
          <p>
            <strong>Próxima acción:</strong> {nextAction}
          </p>
        </div>

        {presentation.calculated ? (
          <div className="mt-5 flex items-start gap-3 rounded-xl border border-[#f4d8a8] bg-[#fff7e8] px-4 py-3 text-sm leading-6 text-[#845b12]">
            <Clock3 className="mt-0.5 size-5 shrink-0" />
            La renta continúa activa. La fecha prevista de devolución está a
            tres días o menos.
          </div>
        ) : null}

        {rental.rejectedReason ? (
          <div className="mt-5 flex items-start gap-3 rounded-xl border border-[#f3c7c2] bg-[#fff4f2] px-4 py-3 text-sm leading-6 text-[#b42318]">
            <XCircle className="mt-0.5 size-5 shrink-0" />
            <p>
              <strong>Motivo del rechazo:</strong> {rental.rejectedReason}
            </p>
          </div>
        ) : null}

        <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="grid content-start gap-5">
            <section className="rounded-[24px] border border-[#dae5e5] bg-white p-5 shadow-[0_18px_36px_rgba(16,50,49,0.07)]">
              <h2 className="text-lg font-semibold text-[#17333f]">
                Productos y documentos
              </h2>
              <div className="mt-3">
                {rental.items.map((item) => (
                  <div
                    key={item.id}
                    className="border-b border-[#e4ecee] py-5 first:pt-2 last:border-b-0 last:pb-1"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex min-w-0 gap-3">
                        <div className="relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-[#eef4f4] text-xs font-bold text-[#1f6a67]">
                          {isOptimizableImageUrl(item.product.imageUrl) ? (
                            <Image
                              src={item.product.imageUrl!}
                              alt={item.product.nombre}
                              fill
                              sizes="64px"
                              className="object-contain p-1"
                            />
                          ) : (
                            item.product.nombre.slice(0, 2).toUpperCase()
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-[#17333f]">
                            {item.quantity} × {item.product.nombre}
                          </h3>
                          <p className="mt-1 text-sm text-[#607173]">
                            {item.product.marca} · {item.product.modelo}
                          </p>
                          <p className="mt-1 text-xs text-[#71858c]">
                            SKU {item.product.sku ?? `CEMYDI-${item.productId}`} ·{" "}
                            {item.product.clasificacion}
                          </p>
                        <p className="mt-2 flex items-center gap-2 text-sm text-[#405b65]">
                          <CalendarDays className="size-4 text-[#1f6a67]" />
                          {formatDateOnlyEsMx(item.startDate, {
                            style: "short",
                          })}{" "}
                          – {formatDateOnlyEsMx(item.endDate, { style: "short" })} ·{" "}
                          {item.days} día{item.days === 1 ? "" : "s"}
                        </p>
                        {item.notes ? (
                          <p className="mt-2 text-sm leading-6 text-[#607173]">
                            Nota: {item.notes}
                          </p>
                        ) : null}
                        </div>
                      </div>
                      <div className="text-left sm:text-right">
                        <strong className="text-[#17333f]">
                          {formatCurrencyMx(item.lineTotal)}
                        </strong>
                        <p className="text-sm text-[#607173]">
                          {formatCurrencyMx(item.dailyPrice)}/día
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 grid gap-1 border-t border-[#edf2f3] pt-3 text-sm text-[#607173]">
                      <div className="flex justify-between gap-3">
                        <span>Renta</span>
                        <strong className="text-[#405b65]">
                          {formatCurrencyMx(item.lineSubtotal)}
                        </strong>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span>Depósito</span>
                        <strong className="text-[#405b65]">
                          {formatCurrencyMx(item.lineDeposit)}
                        </strong>
                      </div>
                    </div>

                    {item.prescription ? (
                      <div className="mt-4 flex flex-col gap-3 border-t border-[#edf2f3] pt-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 items-start gap-3">
                          <FileText className="mt-0.5 size-5 shrink-0 text-[#176c83]" />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-[#17333f]">
                              {item.prescription.fileName}
                            </p>
                            <p className="mt-0.5 text-xs text-[#71858c]">
                              {formatFileSize(item.prescription.sizeBytes)} ·{" "}
                              {documentStatusLabel(item.prescription.status)}
                            </p>
                            {item.prescription.rejectionReason ? (
                              <p className="mt-1 text-xs font-semibold text-[#b42318]">
                                Motivo: {item.prescription.rejectionReason}
                              </p>
                            ) : null}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              void handleDocument(item.prescription!, "inline")
                            }
                            disabled={
                              documentAction ===
                              item.prescription.id + ":inline"
                            }
                            className="inline-flex items-center gap-2 rounded-xl border border-[#9abdc0] px-3 py-2 text-xs font-bold text-[#176c83] hover:bg-[#edf9fb] disabled:opacity-60"
                          >
                            <ExternalLink className="size-4" /> Ver
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              void handleDocument(
                                item.prescription!,
                                "attachment",
                              )
                            }
                            disabled={
                              documentAction ===
                              item.prescription.id + ":attachment"
                            }
                            className="inline-flex items-center gap-2 rounded-xl border border-[#d6e2e4] px-3 py-2 text-xs font-bold text-[#405b65] hover:bg-[#f4f8f8] disabled:opacity-60"
                          >
                            <Download className="size-4" /> Descargar
                          </button>
                          {rental.status === "PENDING" &&
                          item.prescription.status === "RECHAZADO" ? (
                            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#1f6a67] px-3 py-2 text-xs font-bold text-white hover:bg-[#185856]">
                              <Upload className="size-4" />
                              {uploadingItemId === item.id
                                ? `Cargando ${uploadProgress}%`
                                : "Reemplazar receta"}
                              <input
                                type="file"
                                accept={PRESCRIPTION_ACCEPT}
                                className="sr-only"
                                disabled={uploadingItemId !== null}
                                onChange={(event) => {
                                  void handlePrescriptionReplacement(
                                    item.id,
                                    event.target.files,
                                  );
                                  event.currentTarget.value = "";
                                }}
                              />
                            </label>
                          ) : null}
                        </div>
                      </div>
                    ) : item.product.requiereReceta ? (
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#edf2f3] pt-3">
                        <p className="text-sm font-semibold text-[#b42318]">
                          Esta solicitud no tiene receta asociada.
                        </p>
                        {rental.status === "PENDING" ? (
                          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#1f6a67] px-3 py-2 text-xs font-bold text-white hover:bg-[#185856]">
                            <Upload className="size-4" />
                            {uploadingItemId === item.id
                              ? `Cargando ${uploadProgress}%`
                              : "Adjuntar receta"}
                            <input
                              type="file"
                              accept={PRESCRIPTION_ACCEPT}
                              className="sr-only"
                              disabled={uploadingItemId !== null}
                              onChange={(event) => {
                                void handlePrescriptionReplacement(
                                  item.id,
                                  event.target.files,
                                );
                                event.currentTarget.value = "";
                              }}
                            />
                          </label>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[24px] border border-[#dae5e5] bg-white p-5 shadow-[0_18px_36px_rgba(16,50,49,0.07)]">
              <h2 className="text-lg font-semibold text-[#17333f]">
                Solicitante y entrega
              </h2>
              <div className="mt-4 grid gap-4 text-sm text-[#607173] sm:grid-cols-2">
                <div className="flex gap-3">
                  <UserRound className="mt-0.5 size-5 shrink-0 text-[#1f6a67]" />
                  <div>
                    <strong className="text-[#17333f]">
                      {rental.applicantName ?? rental.user.nombre}
                    </strong>
                    {rental.isForAnotherPerson ? (
                      <p className="mt-1">
                        Paciente: {rental.patientName ?? "No especificado"}
                        {rental.patientRelationship
                          ? " · " + rental.patientRelationship
                          : ""}
                      </p>
                    ) : (
                      <p className="mt-1">Renta para la persona solicitante</p>
                    )}
                  </div>
                </div>
                <div className="grid gap-2">
                  <p className="flex items-center gap-2">
                    <Mail className="size-4 text-[#1f6a67]" />
                    {rental.applicantEmail ?? rental.user.correo}
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="size-4 text-[#1f6a67]" />
                    {rental.applicantPhone ??
                      rental.user.telefono ??
                      "Sin teléfono"}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex gap-3 border-t border-[#edf2f3] pt-4 text-sm leading-6 text-[#607173]">
                <MapPin className="mt-0.5 size-5 shrink-0 text-[#1f6a67]" />
                <div>
                  <strong className="text-[#17333f]">
                    {rental.deliveryMethod === "HOME_DELIVERY"
                      ? "Entrega a domicilio"
                      : rental.deliveryMethod === "PICKUP"
                        ? "Recolección en sucursal"
                        : "Forma de entrega no registrada"}
                  </strong>
                  {rental.deliveryMethod === "HOME_DELIVERY" ? (
                    <>
                      <p className="mt-1">
                        {[
                          rental.deliveryAddress,
                          rental.deliveryNeighborhood,
                          rental.deliveryPostalCode
                            ? "C.P. " + rental.deliveryPostalCode
                            : null,
                          rental.deliveryMunicipality,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                      {rental.deliveryReferences ? (
                        <p>Referencias: {rental.deliveryReferences}</p>
                      ) : null}
                    </>
                  ) : null}
                  {rental.preferredSchedule ? (
                    <p>Horario preferido: {rental.preferredSchedule}</p>
                  ) : null}
                </div>
              </div>
              {rental.notes ? (
                <p className="mt-4 border-t border-[#edf2f3] pt-4 text-sm leading-6 text-[#607173]">
                  <strong className="text-[#17333f]">Notas generales:</strong>{" "}
                  {rental.notes}
                </p>
              ) : null}
            </section>
          </div>

          <aside className="grid h-fit gap-5">
            <section className="rounded-[24px] border border-[#dae5e5] bg-white p-5 shadow-[0_18px_36px_rgba(16,50,49,0.07)]">
              <h2 className="text-lg font-semibold text-[#17333f]">
                Seguimiento
              </h2>
              <Timeline rental={rental} />
              {dueDate ? (
                <p className="mt-4 border-t border-[#edf2f3] pt-4 text-sm text-[#607173]">
                  Devolución prevista:{" "}
                  <strong className="text-[#17333f]">
                    {formatDateOnlyEsMx(dueDate.toISOString(), { style: "short" })}
                  </strong>
                </p>
              ) : null}
            </section>

            <section className="rounded-[24px] border border-[#dae5e5] bg-white p-5 shadow-[0_18px_36px_rgba(16,50,49,0.07)]">
              <h2 className="text-lg font-semibold text-[#17333f]">Resumen</h2>
              <div className="mt-4 grid gap-3 text-sm text-[#607173]">
                <div className="flex justify-between gap-3">
                  <span>Renta</span>
                  <strong className="text-[#17333f]">
                    {formatCurrencyMx(rental.subtotal)}
                  </strong>
                </div>
                <div className="flex justify-between gap-3">
                  <span>Depósitos</span>
                  <strong className="text-[#17333f]">
                    {formatCurrencyMx(rental.depositTotal)}
                  </strong>
                </div>
                <div className="grid gap-1 border-t border-[#edf2f3] pt-3">
                  <div className="flex justify-between gap-3">
                    <span>Estado del depósito</span>
                    <strong className="text-[#17333f]">
                      {rental.depositStatus === "RETURNED"
                        ? "Devuelto"
                        : rental.depositStatus === "RETAINED"
                          ? "Retenido"
                          : rental.depositStatus === "PARTIALLY_RETAINED"
                            ? "Retención parcial"
                            : "Pendiente"}
                    </strong>
                  </div>
                  {rental.depositResolvedAt ? (
                    <>
                      <div className="flex justify-between gap-3">
                        <span>Monto devuelto</span>
                        <strong className="text-[#17333f]">
                          {formatCurrencyMx(rental.depositReturnedAmount)}
                        </strong>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span>Monto retenido</span>
                        <strong className="text-[#17333f]">
                          {formatCurrencyMx(rental.depositRetainedAmount)}
                        </strong>
                      </div>
                    </>
                  ) : null}
                  {rental.depositNotes ? (
                    <p className="mt-1 text-xs leading-5">
                      {rental.depositNotes}
                    </p>
                  ) : null}
                </div>
                <div className="flex justify-between gap-3 border-t border-[#edf2f3] pt-3 text-base">
                  <span>Total inicial</span>
                  <strong className="text-[#1f6a67]">
                    {formatCurrencyMx(rental.total)}
                  </strong>
                </div>
              </div>
              {rental.status === "PENDING" ? (
                <button
                  type="button"
                  onClick={() => setCancelDialogOpen(true)}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#d7b1aa] px-4 py-3 font-bold text-[#b42318] transition hover:bg-[#fff1f1]"
                >
                  <XCircle className="size-4" /> Cancelar solicitud
                </button>
              ) : null}
            </section>
          </aside>
        </div>
      </main>

      <RentalCancellationDialog
        open={cancelDialogOpen}
        rental={rental}
        submitting={canceling}
        onOpenChange={setCancelDialogOpen}
        onConfirm={handleCancel}
      />
    </div>
  );
}

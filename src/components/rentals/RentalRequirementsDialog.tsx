"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Upload, X } from "lucide-react";
import type { AuthUserProfile } from "@/providers/AuthContext";
import type { ShoppingCartItem } from "@/services/cart";
import type { RentalRequirementsInput } from "@/services/rentals";
import { formatCurrencyMx, formatDateOnlyEsMx } from "@/lib/formatters";
import { PRESCRIPTION_ACCEPT } from "@/lib/rental-prescription";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/features/admin/components/ui/dialog";

type FormState = RentalRequirementsInput;
type FieldErrors = Partial<Record<keyof FormState, string>>;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AuthUserProfile;
  items: ShoppingCartItem[];
  submitting: boolean;
  prescriptionPendingItemId: number | null;
  prescriptionProgress: Record<number, number>;
  onUploadPrescription: (
    itemId: number,
    files: FileList | null,
  ) => Promise<void>;
  onDeletePrescription: (itemId: number) => Promise<void>;
  onSubmit: (input: RentalRequirementsInput) => Promise<void>;
};

function initialForm(user: AuthUserProfile): FormState {
  return {
    applicantName: user.nombre ?? "",
    applicantEmail: user.correo ?? "",
    applicantPhone: user.telefono ?? "",
    isForAnotherPerson: false,
    patientName: "",
    patientRelationship: "",
    patientRelationshipOther: "",
    deliveryMethod: "PICKUP",
    deliveryAddress: user.direccion ?? "",
    deliveryNeighborhood: "",
    deliveryPostalCode: "",
    deliveryMunicipality: "",
    deliveryReferences: "",
    preferredSchedule: "",
    generalNotes: "",
    acceptRentalTerms: false,
    acceptPrivacy: false,
  };
}

function FieldError({ message }: { message?: string }) {
  return message ? (
    <span className="text-xs font-semibold normal-case tracking-normal text-[#b42318]">
      {message}
    </span>
  ) : null;
}

export default function RentalRequirementsDialog({
  open,
  onOpenChange,
  user,
  items,
  submitting,
  prescriptionPendingItemId,
  prescriptionProgress,
  onUploadPrescription,
  onDeletePrescription,
  onSubmit,
}: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState<FormState>(() => initialForm(user));
  const [errors, setErrors] = useState<FieldErrors>({});

  const blockers = useMemo(
    () =>
      items.flatMap((item) => {
        const messages: string[] = [];
        if (item.configurationStatus === "PENDING") {
          messages.push(`${item.product.nombre}: faltan fechas válidas.`);
        }
        if (!item.availability.isAvailable) {
          messages.push(
            `${item.product.nombre}: ${item.availability.reason ?? "sin disponibilidad"}.`,
          );
        }
        if (item.product.requiereReceta && !item.document) {
          messages.push(`${item.product.nombre}: falta la receta requerida.`);
        }
        return messages;
      }),
    [items],
  );

  const totals = useMemo(
    () => ({
      rental: items.reduce(
        (sum, item) => sum + (item.rentalSummary?.subtotal ?? 0),
        0,
      ),
      deposit: items.reduce(
        (sum, item) => sum + (item.rentalSummary?.depositTotal ?? 0),
        0,
      ),
    }),
    [items],
  );

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const validateGeneral = () => {
    const next: FieldErrors = {};
    if (form.applicantName.trim().length < 2)
      next.applicantName = "Captura el nombre completo.";
    if (!/^\S+@\S+\.\S+$/.test(form.applicantEmail.trim())) {
      next.applicantEmail = "Captura un correo válido.";
    }
    if (!/^[0-9+()\-\s]{7,20}$/.test(form.applicantPhone.trim())) {
      next.applicantPhone = "Captura un teléfono válido.";
    }
    if (form.isForAnotherPerson && (form.patientName?.trim().length ?? 0) < 2) {
      next.patientName = "Captura el nombre del paciente.";
    }
    if (
      form.isForAnotherPerson &&
      (form.patientRelationship?.trim().length ?? 0) < 2
    ) {
      next.patientRelationship = "Selecciona la relación con el paciente.";
    }
    if (
      form.isForAnotherPerson &&
      form.patientRelationship === "Otro" &&
      (form.patientRelationshipOther?.trim().length ?? 0) < 2
    ) {
      next.patientRelationshipOther = "Indica la relación con el paciente.";
    }
    if (form.deliveryMethod === "HOME_DELIVERY") {
      if ((form.deliveryAddress?.trim().length ?? 0) < 5) {
        next.deliveryAddress = "Captura la dirección de entrega.";
      }
      if ((form.deliveryNeighborhood?.trim().length ?? 0) < 2) {
        next.deliveryNeighborhood = "Captura la colonia.";
      }
      if (!/^\d{5}$/.test(form.deliveryPostalCode?.trim() ?? "")) {
        next.deliveryPostalCode = "El código postal debe tener 5 dígitos.";
      }
      if ((form.deliveryMunicipality?.trim().length ?? 0) < 2) {
        next.deliveryMunicipality = "Captura el municipio.";
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const goToReview = () => {
    if (validateGeneral()) setStep(2);
  };

  const canSubmit =
    blockers.length === 0 &&
    form.acceptRentalTerms &&
    form.acceptPrivacy &&
    prescriptionPendingItemId === null &&
    !submitting;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && prescriptionPendingItemId !== null) return;
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="w-[min(760px,calc(100vw-2rem))] border-[#dbe5e7] bg-white text-[#17333f]">
        <DialogHeader className="border-b border-[#edf2f3] pb-4">
          <DialogTitle className="text-[#132633]">
            {step === 1 ? "Completar requisitos de renta" : "Revisión final"}
          </DialogTitle>
          <DialogDescription className="text-[#60727a]">
            {step === 1
              ? "Completa los datos generales y la forma de entrega."
              : "Revisa productos, documentos y condiciones antes de enviar."}
          </DialogDescription>
          <div className="flex gap-2 pt-2 text-xs font-bold">
            <span className="rounded-full bg-[#1f6a67] px-3 py-1 text-white">
              1. Requisitos
            </span>
            <span
              className={`rounded-full px-3 py-1 ${
                step === 2
                  ? "bg-[#1f6a67] text-white"
                  : "bg-[#edf3f3] text-[#60727a]"
              }`}
            >
              2. Revisión
            </span>
          </div>
        </DialogHeader>

        {step === 1 ? (
          <div className="grid gap-5">
            <section className="grid gap-3">
              <h3 className="text-sm font-bold uppercase tracking-[0.08em] text-[#405b65]">
                Datos del solicitante
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1 text-xs font-bold uppercase tracking-[0.06em] text-[#60727a] sm:col-span-2">
                  Nombre completo
                  <input
                    value={form.applicantName}
                    onChange={(event) =>
                      update("applicantName", event.target.value)
                    }
                    maxLength={160}
                    className="h-11 rounded-xl border border-[#d4dfe2] px-3 text-sm font-medium normal-case tracking-normal text-[#193844] outline-none focus:border-[#1f6a67]"
                  />
                  <FieldError message={errors.applicantName} />
                </label>
                <label className="grid gap-1 text-xs font-bold uppercase tracking-[0.06em] text-[#60727a]">
                  Correo
                  <input
                    type="email"
                    value={form.applicantEmail}
                    onChange={(event) =>
                      update("applicantEmail", event.target.value)
                    }
                    className="h-11 rounded-xl border border-[#d4dfe2] px-3 text-sm font-medium normal-case tracking-normal text-[#193844] outline-none focus:border-[#1f6a67]"
                  />
                  <FieldError message={errors.applicantEmail} />
                </label>
                <label className="grid gap-1 text-xs font-bold uppercase tracking-[0.06em] text-[#60727a]">
                  Teléfono
                  <input
                    type="tel"
                    value={form.applicantPhone}
                    onChange={(event) =>
                      update("applicantPhone", event.target.value)
                    }
                    className="h-11 rounded-xl border border-[#d4dfe2] px-3 text-sm font-medium normal-case tracking-normal text-[#193844] outline-none focus:border-[#1f6a67]"
                  />
                  <FieldError message={errors.applicantPhone} />
                </label>
              </div>
              <label className="flex items-start gap-3 text-sm text-[#405b65]">
                <input
                  type="checkbox"
                  checked={form.isForAnotherPerson}
                  onChange={(event) =>
                    update("isForAnotherPerson", event.target.checked)
                  }
                  className="mt-1 size-4 accent-[#1f6a67]"
                />
                La renta es para otra persona
              </label>
              {form.isForAnotherPerson ? (
                <div className="grid gap-3 border-l-2 border-[#cfe0e3] pl-4 sm:grid-cols-2">
                  <label className="grid gap-1 text-xs font-bold uppercase tracking-[0.06em] text-[#60727a]">
                    Nombre del paciente
                    <input
                      value={form.patientName ?? ""}
                      onChange={(event) =>
                        update("patientName", event.target.value)
                      }
                      className="h-11 rounded-xl border border-[#d4dfe2] px-3 text-sm font-medium normal-case tracking-normal text-[#193844] outline-none focus:border-[#1f6a67]"
                    />
                    <FieldError message={errors.patientName} />
                  </label>
                  <label className="grid gap-1 text-xs font-bold uppercase tracking-[0.06em] text-[#60727a]">
                    Relación con el paciente
                    <select
                      value={form.patientRelationship ?? ""}
                      onChange={(event) =>
                        update("patientRelationship", event.target.value)
                      }
                      className="h-11 rounded-xl border border-[#d4dfe2] px-3 text-sm font-medium normal-case tracking-normal text-[#193844] outline-none focus:border-[#1f6a67]"
                    >
                      <option value="">Selecciona una opción</option>
                      <option value="Madre/Padre">Madre o padre</option>
                      <option value="Hija/Hijo">Hija o hijo</option>
                      <option value="Pareja">Pareja</option>
                      <option value="Familiar">Otro familiar</option>
                      <option value="Cuidador">Persona cuidadora</option>
                      <option value="Otro">Otro</option>
                    </select>
                    <FieldError message={errors.patientRelationship} />
                  </label>
                  {form.patientRelationship === "Otro" ? (
                    <label className="grid gap-1 text-xs font-bold uppercase tracking-[0.06em] text-[#60727a] sm:col-span-2">
                      Especifica la relación
                      <input
                        value={form.patientRelationshipOther ?? ""}
                        onChange={(event) =>
                          update("patientRelationshipOther", event.target.value)
                        }
                        maxLength={120}
                        className="h-11 rounded-xl border border-[#d4dfe2] px-3 text-sm font-medium normal-case tracking-normal text-[#193844] outline-none focus:border-[#1f6a67]"
                      />
                      <FieldError message={errors.patientRelationshipOther} />
                    </label>
                  ) : null}
                </div>
              ) : null}
            </section>

            <section className="grid gap-3 border-t border-[#e8eff1] pt-4">
              <h3 className="text-sm font-bold uppercase tracking-[0.08em] text-[#405b65]">
                Entrega
              </h3>
              <div className="grid gap-2 sm:grid-cols-2">
                {(
                  [
                    ["PICKUP", "Recoger en sucursal"],
                    ["HOME_DELIVERY", "Entrega a domicilio"],
                  ] as const
                ).map(([value, label]) => (
                  <label
                    key={value}
                    className="flex items-center gap-3 border-b border-[#edf2f3] py-3 text-sm font-semibold text-[#405b65]"
                  >
                    <input
                      type="radio"
                      name="deliveryMethod"
                      checked={form.deliveryMethod === value}
                      onChange={() => update("deliveryMethod", value)}
                      className="size-4 accent-[#1f6a67]"
                    />
                    {label}
                  </label>
                ))}
              </div>
              {form.deliveryMethod === "HOME_DELIVERY" ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="grid gap-1 text-xs font-bold uppercase tracking-[0.06em] text-[#60727a] sm:col-span-2">
                    Dirección
                    <input
                      value={form.deliveryAddress ?? ""}
                      onChange={(event) =>
                        update("deliveryAddress", event.target.value)
                      }
                      className="h-11 rounded-xl border border-[#d4dfe2] px-3 text-sm font-medium normal-case tracking-normal text-[#193844] outline-none focus:border-[#1f6a67]"
                    />
                    <FieldError message={errors.deliveryAddress} />
                  </label>
                  <label className="grid gap-1 text-xs font-bold uppercase tracking-[0.06em] text-[#60727a]">
                    Colonia
                    <input
                      value={form.deliveryNeighborhood ?? ""}
                      onChange={(event) =>
                        update("deliveryNeighborhood", event.target.value)
                      }
                      className="h-11 rounded-xl border border-[#d4dfe2] px-3 text-sm font-medium normal-case tracking-normal text-[#193844] outline-none focus:border-[#1f6a67]"
                    />
                    <FieldError message={errors.deliveryNeighborhood} />
                  </label>
                  <label className="grid gap-1 text-xs font-bold uppercase tracking-[0.06em] text-[#60727a]">
                    Código postal
                    <input
                      inputMode="numeric"
                      maxLength={5}
                      value={form.deliveryPostalCode ?? ""}
                      onChange={(event) =>
                        update(
                          "deliveryPostalCode",
                          event.target.value.replace(/\D/g, ""),
                        )
                      }
                      className="h-11 rounded-xl border border-[#d4dfe2] px-3 text-sm font-medium normal-case tracking-normal text-[#193844] outline-none focus:border-[#1f6a67]"
                    />
                    <FieldError message={errors.deliveryPostalCode} />
                  </label>
                  <label className="grid gap-1 text-xs font-bold uppercase tracking-[0.06em] text-[#60727a]">
                    Municipio
                    <input
                      value={form.deliveryMunicipality ?? ""}
                      onChange={(event) =>
                        update("deliveryMunicipality", event.target.value)
                      }
                      className="h-11 rounded-xl border border-[#d4dfe2] px-3 text-sm font-medium normal-case tracking-normal text-[#193844] outline-none focus:border-[#1f6a67]"
                    />
                    <FieldError message={errors.deliveryMunicipality} />
                  </label>
                  <label className="grid gap-1 text-xs font-bold uppercase tracking-[0.06em] text-[#60727a]">
                    Horario preferido
                    <input
                      value={form.preferredSchedule ?? ""}
                      onChange={(event) =>
                        update("preferredSchedule", event.target.value)
                      }
                      className="h-11 rounded-xl border border-[#d4dfe2] px-3 text-sm font-medium normal-case tracking-normal text-[#193844] outline-none focus:border-[#1f6a67]"
                    />
                  </label>
                  <label className="grid gap-1 text-xs font-bold uppercase tracking-[0.06em] text-[#60727a] sm:col-span-2">
                    Referencias
                    <textarea
                      rows={2}
                      value={form.deliveryReferences ?? ""}
                      onChange={(event) =>
                        update("deliveryReferences", event.target.value)
                      }
                      className="rounded-xl border border-[#d4dfe2] px-3 py-2 text-sm font-medium normal-case tracking-normal text-[#193844] outline-none focus:border-[#1f6a67]"
                    />
                  </label>
                </div>
              ) : null}
              <label className="grid gap-1 text-xs font-bold uppercase tracking-[0.06em] text-[#60727a]">
                Notas generales, opcional
                <textarea
                  rows={3}
                  maxLength={1000}
                  value={form.generalNotes ?? ""}
                  onChange={(event) =>
                    update("generalNotes", event.target.value)
                  }
                  className="rounded-xl border border-[#d4dfe2] px-3 py-2 text-sm font-medium normal-case tracking-normal text-[#193844] outline-none focus:border-[#1f6a67]"
                />
              </label>
            </section>
          </div>
        ) : (
          <div className="grid gap-5">
            <section className="grid gap-2 text-sm text-[#405b65]">
              <h3 className="text-sm font-bold uppercase tracking-[0.08em]">
                Solicitante y entrega
              </h3>
              <p>
                <strong>{form.applicantName}</strong> · {form.applicantEmail} ·{" "}
                {form.applicantPhone}
              </p>
              {form.isForAnotherPerson ? (
                <p>
                  Paciente: <strong>{form.patientName}</strong>
                  {form.patientRelationship
                    ? ` · ${form.patientRelationship === "Otro" ? form.patientRelationshipOther : form.patientRelationship}`
                    : ""}
                </p>
              ) : null}
              <p>
                {form.deliveryMethod === "PICKUP"
                  ? "Recolección en sucursal"
                  : `Entrega: ${form.deliveryAddress}, ${form.deliveryNeighborhood}, C.P. ${form.deliveryPostalCode}, ${form.deliveryMunicipality}`}
              </p>
              {form.deliveryMethod === "HOME_DELIVERY" &&
              (form.deliveryReferences || form.preferredSchedule) ? (
                <p>
                  {form.deliveryReferences
                    ? `Referencias: ${form.deliveryReferences}`
                    : ""}
                  {form.deliveryReferences && form.preferredSchedule ? " · " : ""}
                  {form.preferredSchedule
                    ? `Horario: ${form.preferredSchedule}`
                    : ""}
                </p>
              ) : null}
              {form.generalNotes ? <p>Notas generales: {form.generalNotes}</p> : null}
            </section>

            <section className="grid gap-3 border-t border-[#e8eff1] pt-4">
              <h3 className="text-sm font-bold uppercase tracking-[0.08em] text-[#405b65]">
                Productos y documentos
              </h3>
              {items.map((item) => (
                <div
                  key={item.id}
                  className="grid gap-2 border-b border-[#edf2f3] pb-4 last:border-b-0"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <strong className="text-sm text-[#17333f]">
                        {item.product.nombre}
                      </strong>
                      <p className="mt-1 text-xs text-[#60727a]">
                        Cantidad {item.quantity} ·{" "}
                        {item.rentalStartDate
                          ? formatDateOnlyEsMx(item.rentalStartDate, {
                              style: "short",
                            })
                          : "Fechas pendientes"}{" "}
                        –{" "}
                        {item.rentalEndDate
                          ? formatDateOnlyEsMx(item.rentalEndDate, {
                              style: "short",
                            })
                        : "pendiente"}
                        {item.rentalDays ? ` · ${item.rentalDays} día(s)` : ""}
                      </p>
                      {item.rentalNotes ? (
                        <p className="mt-1 text-xs text-[#60727a]">
                          Nota del producto: {item.rentalNotes}
                        </p>
                      ) : null}
                    </div>
                    <strong className="text-sm text-[#17333f]">
                      {item.lineTotal === null
                        ? "Total pendiente"
                        : formatCurrencyMx(item.lineTotal)}
                    </strong>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs font-bold">
                    <span
                      className={`rounded-full px-3 py-1 ${item.configurationStatus === "COMPLETE" ? "bg-[#e4f6ee] text-[#1e7c55]" : "bg-[#fff7e8] text-[#845b12]"}`}
                    >
                      {item.configurationStatus === "COMPLETE"
                        ? "Configuración completa"
                        : "Fechas pendientes"}
                    </span>
                    {item.product.requiereReceta ? (
                      <span
                        className={`rounded-full px-3 py-1 ${item.document ? "bg-[#edf9fb] text-[#176c83]" : "bg-[#fff1f1] text-[#9b2c25]"}`}
                      >
                        {item.document
                          ? `Receta: ${item.document.originalFilename}`
                          : "Receta pendiente"}
                      </span>
                    ) : null}
                  </div>
                  {item.product.requiereReceta ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-dashed border-[#9abdc0] px-3 py-2 text-xs font-bold text-[#176c83]">
                        <Upload className="size-4" />
                        {item.document
                          ? "Reemplazar receta"
                          : "Adjuntar receta"}
                        <input
                          type="file"
                          accept={PRESCRIPTION_ACCEPT}
                          className="sr-only"
                          disabled={prescriptionPendingItemId === item.id}
                          onChange={(event) => {
                            void onUploadPrescription(
                              item.id,
                              event.target.files,
                            );
                            event.currentTarget.value = "";
                          }}
                        />
                      </label>
                      {item.document ? (
                        <button
                          type="button"
                          disabled={prescriptionPendingItemId === item.id}
                          onClick={() => void onDeletePrescription(item.id)}
                          className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-xs font-bold text-[#b42318] hover:bg-[#fff1f1]"
                        >
                          <X className="size-4" /> Quitar
                        </button>
                      ) : null}
                      {prescriptionPendingItemId === item.id ? (
                        <span className="text-xs font-semibold text-[#60727a]">
                          Cargando… {prescriptionProgress[item.id] ?? 0}%
                        </span>
                      ) : item.document ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-[#1e7c55]">
                          <CheckCircle2 className="size-4" /> Adjuntado
                        </span>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              ))}
            </section>

            <section className="grid gap-2 border-t border-[#e8eff1] pt-4 text-sm text-[#405b65]">
              <div className="flex justify-between">
                <span>Renta estimada</span>
                <strong>{formatCurrencyMx(totals.rental)}</strong>
              </div>
              <div className="flex justify-between">
                <span>Depósito estimado</span>
                <strong>{formatCurrencyMx(totals.deposit)}</strong>
              </div>
              <div className="flex justify-between border-t border-[#edf2f3] pt-2 text-[#17333f]">
                <span>Total inicial estimado</span>
                <strong>
                  {formatCurrencyMx(totals.rental + totals.deposit)}
                </strong>
              </div>
            </section>

            {blockers.length > 0 ? (
              <div className="flex items-start gap-3 rounded-xl border border-[#f4d8a8] bg-[#fff7e8] px-4 py-3 text-sm text-[#845b12]">
                <AlertTriangle className="mt-0.5 size-5 shrink-0" />
                <div>
                  <strong>Falta completar:</strong>
                  <ul className="mt-1 list-disc pl-5">
                    {blockers.map((message) => (
                      <li key={message}>{message}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}

            <section className="grid gap-3 border-t border-[#e8eff1] pt-4 text-sm text-[#405b65]">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={form.acceptRentalTerms}
                  onChange={(event) =>
                    update("acceptRentalTerms", event.target.checked)
                  }
                  className="mt-1 size-4 accent-[#1f6a67]"
                />
                <span>
                  Acepto las{" "}
                  <Link
                    href="/terminos-y-condiciones"
                    target="_blank"
                    className="font-bold text-[#1f6a67]"
                  >
                    condiciones de renta
                  </Link>
                  .
                </span>
              </label>
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={form.acceptPrivacy}
                  onChange={(event) =>
                    update("acceptPrivacy", event.target.checked)
                  }
                  className="mt-1 size-4 accent-[#1f6a67]"
                />
                <span>
                  Acepto el tratamiento de datos y documentos conforme a las{" "}
                  <Link
                    href="/politicas-de-privacidad"
                    target="_blank"
                    className="font-bold text-[#1f6a67]"
                  >
                    políticas de privacidad
                  </Link>
                  .
                </span>
              </label>
            </section>
          </div>
        )}

        <DialogFooter className="border-t border-[#edf2f3] pt-4">
          {step === 2 ? (
            <button
              type="button"
              onClick={() => setStep(1)}
              disabled={submitting}
              className="rounded-xl border border-[#d6e2e4] bg-white px-5 py-3 text-sm font-bold text-[#405b65] hover:bg-[#f4f8f8] disabled:opacity-60"
            >
              Volver
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-xl border border-[#d6e2e4] bg-white px-5 py-3 text-sm font-bold text-[#405b65] hover:bg-[#f4f8f8]"
            >
              Cancelar
            </button>
          )}
          {step === 1 ? (
            <button
              type="button"
              onClick={goToReview}
              className="rounded-xl bg-[#1f6a67] px-5 py-3 text-sm font-bold text-white hover:bg-[#185856]"
            >
              Revisar solicitud
            </button>
          ) : (
            <button
              type="button"
              disabled={!canSubmit}
              onClick={() => void onSubmit(form)}
              className="rounded-xl bg-[#1f6a67] px-5 py-3 text-sm font-bold text-white hover:bg-[#185856] disabled:cursor-not-allowed disabled:bg-[#9ab8b6]"
            >
              {submitting ? "Enviando…" : "Enviar solicitud de renta"}
            </button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

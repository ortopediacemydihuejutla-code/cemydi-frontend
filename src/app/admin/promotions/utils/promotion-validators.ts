import type { AdminPromotion, CreatePromotionPayload } from "@/services/admin";

import type { PromotionFormState } from "./promotion-mappers";

export type StatusLabel =
  | "Activa"
  | "Programada"
  | "Finalizada"
  | "Producto sin disponibilidad";

export type StatusFilter = "ALL" | StatusLabel;

export const STATUS_FILTERS: { id: StatusFilter; label: string }[] = [
  { id: "ALL", label: "Todas" },
  { id: "Activa", label: "Activas" },
  { id: "Programada", label: "Programadas" },
  { id: "Finalizada", label: "Finalizadas" },
  { id: "Producto sin disponibilidad", label: "Sin stock" },
];

export const defaultPromotionForm: PromotionFormState = {
  mode: "PRODUCT" as CreatePromotionPayload["mode"],
  productId: "",
  clasificacion: "",
  startAt: "",
  endAt: "",
  descripcion: "",
};

export function localISODate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function validatePromotionForm(form: PromotionFormState, todayStr: string) {
  if (form.mode === "PRODUCT") {
    const productId = Number(form.productId);
    if (!Number.isInteger(productId) || productId <= 0) {
      return "Selecciona un producto para la promoción.";
    }
  }

  if (form.mode === "CATEGORY" && !form.clasificacion.trim()) {
    return "Selecciona una clasificación para aplicar promociones.";
  }

  if (!form.startAt || !form.endAt) {
    return "Selecciona fecha de inicio y fecha final.";
  }

  if (form.startAt < todayStr) {
    return "La fecha de inicio no puede ser anterior a hoy.";
  }

  if (form.endAt < todayStr) {
    return "La fecha de fin no puede ser anterior a hoy.";
  }

  const descripcion = form.descripcion.trim();
  if (descripcion.length < 5 || descripcion.length > 240) {
    return "Descripción inválida. Entre 5 y 240 caracteres.";
  }

  const startMs = new Date(`${form.startAt}T00:00:00`).getTime();
  const endMs = new Date(`${form.endAt}T23:59:59`).getTime();
  if (Number.isNaN(startMs) || Number.isNaN(endMs)) {
    return "Fechas de promoción inválidas.";
  }

  if (startMs >= endMs) {
    return "La fecha final debe ser posterior a la fecha de inicio (puede ser el mismo día).";
  }

  return null;
}

export function promotionStatus(item: AdminPromotion): { label: StatusLabel } {
  const now = Date.now();
  const starts = new Date(item.startAt).getTime();
  const ends = new Date(item.endAt).getTime();
  const label: StatusLabel =
    !item.product.activo || item.product.stock <= 0
      ? "Producto sin disponibilidad"
      : now < starts
        ? "Programada"
        : now > ends
          ? "Finalizada"
          : "Activa";

  return { label };
}

export function statusStyles(label: StatusLabel) {
  switch (label) {
    case "Activa":
      return {
        badge: "emerald" as const,
        ring: "ring-emerald-500/25",
        accent: "from-emerald-500/80 to-teal-600/60",
      };
    case "Programada":
      return {
        badge: "amber" as const,
        ring: "ring-amber-500/25",
        accent: "from-amber-500/75 to-orange-600/50",
      };
    case "Finalizada":
      return {
        badge: "slate" as const,
        ring: "ring-slate-400/20",
        accent: "from-slate-500/50 to-slate-600/40",
      };
    default:
      return {
        badge: "red" as const,
        ring: "ring-red-500/20",
        accent: "from-red-500/60 to-rose-600/45",
      };
  }
}

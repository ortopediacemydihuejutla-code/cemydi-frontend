import type { AdminPromotion, CreatePromotionPayload } from "@/services/admin";

export type PromotionFormState = {
  mode: CreatePromotionPayload["mode"];
  productId: string;
  clasificacion: string;
  startAt: string;
  endAt: string;
  descripcion: string;
};

export function mapPromotionToForm(
  item: AdminPromotion,
  todayStr: string,
): PromotionFormState {
  let start = item.startAt.slice(0, 10);
  let end = item.endAt.slice(0, 10);
  if (start < todayStr) start = todayStr;
  if (end < start) end = start;

  return {
    mode: "PRODUCT",
    productId: String(item.productId),
    clasificacion: "",
    startAt: start,
    endAt: end,
    descripcion: item.descripcion,
  };
}

export function mapFormToIsoDates(form: PromotionFormState) {
  return {
    startIso: new Date(`${form.startAt}T00:00:00`).toISOString(),
    endIso: new Date(`${form.endAt}T23:59:59`).toISOString(),
    descripcion: form.descripcion.trim(),
    productId: Number(form.productId),
  };
}

export function mapFormToCreatePayload(
  form: PromotionFormState,
  startIso: string,
  endIso: string,
  descripcion: string,
  productId: number,
): CreatePromotionPayload {
  return {
    mode: form.mode,
    startAt: startIso,
    endAt: endIso,
    descripcion,
    ...(form.mode === "PRODUCT"
      ? { productId }
      : { clasificacion: form.clasificacion.trim() }),
  };
}

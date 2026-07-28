import type {
  AdminPromotion,
  CreatePromotionPayload,
  PromotionImageStrategy,
} from "@/services/admin";

export type PromotionFormState = {
  productIds: number[];
  discountPercent: string;
  imageStrategy: PromotionImageStrategy;
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
    productIds: item.products.map((product) => product.id),
    discountPercent: String(item.discountPercent),
    imageStrategy: item.imageStrategy,
    startAt: start,
    endAt: end,
    descripcion: item.descripcion,
  };
}

export function mapPromotionFormToPayload(
  form: PromotionFormState,
): CreatePromotionPayload {
  return {
    productIds: form.productIds,
    discountPercent: Number(form.discountPercent),
    imageStrategy: form.imageStrategy,
    startAt: new Date(`${form.startAt}T00:00:00`).toISOString(),
    endAt: new Date(`${form.endAt}T23:59:59`).toISOString(),
    descripcion: form.descripcion.trim(),
  };
}

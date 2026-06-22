import { adminRequest } from "./request";
import type {
  AdminPromotion,
  CreatePromotionPayload,
  UpdatePromotionPayload,
} from "./types";

export function listPromotions() {
  return adminRequest<{ promotions: AdminPromotion[] }>(
    "/promotions?includeExpired=true",
    { method: "GET" },
  );
}

export function createPromotion(payload: CreatePromotionPayload) {
  return adminRequest<{ promotions: AdminPromotion[]; message: string }>(
    "/promotions",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export function deletePromotion(id: number) {
  return adminRequest<{ message: string }>(`/promotions/${id}`, {
    method: "DELETE",
  });
}

export function updatePromotion(id: number, payload: UpdatePromotionPayload) {
  return adminRequest<{ promotion: AdminPromotion; message: string }>(
    `/promotions/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

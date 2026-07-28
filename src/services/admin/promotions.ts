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

export function createPromotion(
  payload: CreatePromotionPayload,
  imageFile?: File | null,
) {
  return adminRequest<{ promotion: AdminPromotion; message: string }>(
    "/promotions",
    {
      method: "POST",
      body: buildPromotionFormData(payload, imageFile),
    },
  );
}

export function deletePromotion(id: number) {
  return adminRequest<{ message: string }>(`/promotions/${id}`, {
    method: "DELETE",
  });
}

export function updatePromotion(
  id: number,
  payload: UpdatePromotionPayload,
  imageFile?: File | null,
) {
  return adminRequest<{ promotion: AdminPromotion; message: string }>(
    `/promotions/${id}`,
    {
      method: "PATCH",
      body: buildPromotionFormData(payload, imageFile),
    },
  );
}

function buildPromotionFormData(
  payload: CreatePromotionPayload | UpdatePromotionPayload,
  imageFile?: File | null,
) {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (key === "productIds") {
      formData.append(key, JSON.stringify(value));
      return;
    }
    formData.append(key, String(value));
  });

  if (imageFile) {
    formData.append("image", imageFile);
  }

  return formData;
}

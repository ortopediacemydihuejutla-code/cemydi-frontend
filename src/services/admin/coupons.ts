import { adminRequest } from "./request";
import type {
  AdminCoupon,
  CreateCouponPayload,
  UpdateCouponPayload,
} from "./types";

export function listCoupons() {
  return adminRequest<{ coupons: AdminCoupon[] }>("/coupons", {
    method: "GET",
  });
}

export function createCoupon(payload: CreateCouponPayload) {
  return adminRequest<{ coupon: AdminCoupon; message: string }>("/coupons", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateCoupon(id: number, payload: UpdateCouponPayload) {
  return adminRequest<{ coupon: AdminCoupon; message: string }>(
    `/coupons/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

export function deleteCoupon(id: number) {
  return adminRequest<{ message: string }>(`/coupons/${id}`, {
    method: "DELETE",
  });
}

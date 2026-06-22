import { adminRequest } from "./request";
import type { AdminReview, ReviewStatus } from "./types";

export function listAdminReviews(params?: {
  status?: ReviewStatus | "ALL";
  userId?: number;
}) {
  const search = new URLSearchParams();

  if (params?.status && params.status !== "ALL") {
    search.set("status", params.status);
  }

  if (params?.userId) {
    search.set("userId", String(params.userId));
  }

  const query = search.toString();

  return adminRequest<{ reviews: AdminReview[] }>(
    `/reviews/admin${query ? `?${query}` : ""}`,
    { method: "GET" },
  );
}

export function approveReview(id: number) {
  return adminRequest<{ review: AdminReview; message: string }>(
    `/reviews/${id}/approve`,
    { method: "PATCH" },
  );
}

export function setReviewHomeVisibility(id: number, showOnHome: boolean) {
  return adminRequest<{ review: AdminReview; message: string }>(
    `/reviews/${id}/home-visibility`,
    {
      method: "PATCH",
      body: JSON.stringify({ showOnHome }),
    },
  );
}

export function deleteReview(id: number) {
  return adminRequest<{ message: string }>(`/reviews/${id}`, {
    method: "DELETE",
  });
}

import { apiFetch } from "@/lib/api-fetch";
import { parseApiResponse } from "@/lib/api-error";
import { resolveApiUrl } from "@/lib/api-config";

export type ProductReview = {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    id: number;
    nombre: string;
  };
};

export type ProductReviewSummary = {
  count: number;
  averageRating: number;
};

export type HomeTestimonial = {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  product: {
    id: number;
    nombre: string;
    clasificacion: string;
  };
  user: {
    id: number;
    nombre: string;
  };
};

export type HomeTestimonialsResponse = {
  testimonials: HomeTestimonial[];
  meta?: {
    min: number;
    max: number;
    selectedCount: number;
  };
};

export type MyProductReview = {
  id: number;
  rating: number;
  comment: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  updatedAt: string;
};

export async function getApprovedProductReviews(productId: number) {
  const res = await fetch(resolveApiUrl(`/reviews/product/${productId}`), {
    cache: "no-store",
  });

  return parseApiResponse<{
    reviews: ProductReview[];
    summary: ProductReviewSummary;
  }>(res, "No se pudieron cargar las reseñas");
}

export async function getHomeTestimonials() {
  const res = await fetch(resolveApiUrl("/reviews/testimonials"), {
    cache: "no-store",
  });

  return parseApiResponse<HomeTestimonialsResponse>(
    res,
    "No se pudieron cargar los testimonios",
  );
}

export async function createProductReview(payload: {
  productId: number;
  rating: number;
  comment: string;
}) {
  const res = await apiFetch("/reviews", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  return parseApiResponse<{ message: string; review: MyProductReview }>(
    res,
    "No se pudo enviar la reseña",
  );
}

export async function getMyProductReview(productId: number) {
  const res = await apiFetch(`/reviews/product/${productId}/mine`, {
    method: "GET",
    cache: "no-store",
  });

  return parseApiResponse<{ review: MyProductReview | null }>(
    res,
    "No se pudo cargar tu reseña",
  );
}

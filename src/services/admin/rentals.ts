import { adminRequest } from "./request";
import { downloadBinaryResponse } from "./request";
import type { AdminRentalRequest, PaginationMeta, RentalStatus } from "./types";

export type RentalCounts = Record<RentalStatus, number> & { total: number };

export function listAdminRentals(params?: {
  status?: RentalStatus | "ALL";
  search?: string;
  page?: number;
  pageSize?: number;
}) {
  const search = new URLSearchParams();

  if (params?.status && params.status !== "ALL") {
    search.set("status", params.status);
  }

  if (params?.search?.trim()) {
    search.set("search", params.search.trim());
  }

  search.set("page", String(params?.page ?? 1));
  search.set("pageSize", String(params?.pageSize ?? 20));

  const query = search.toString();
  return adminRequest<{
    rentals: AdminRentalRequest[];
    counts: RentalCounts;
    pagination: PaginationMeta;
  }>(`/rentals/admin${query ? `?${query}` : ""}`, { method: "GET" });
}

export function approveRental(id: string) {
  return adminRequest<{ rental: AdminRentalRequest; message: string }>(
    `/rentals/${id}/approve`,
    { method: "PATCH" },
  );
}

export function rejectRental(id: string, reason?: string) {
  return adminRequest<{ rental: AdminRentalRequest; message: string }>(
    `/rentals/${id}/reject`,
    {
      method: "PATCH",
      body: JSON.stringify({ reason }),
    },
  );
}

export function deliverRental(id: string) {
  return adminRequest<{ rental: AdminRentalRequest; message: string }>(
    `/rentals/${id}/deliver`,
    { method: "PATCH" },
  );
}

export function returnRental(id: string) {
  return adminRequest<{ rental: AdminRentalRequest; message: string }>(
    `/rentals/${id}/return`,
    { method: "PATCH" },
  );
}

export function cancelApprovedRental(id: string) {
  return adminRequest<{ rental: AdminRentalRequest; message: string }>(
    `/rentals/${id}/cancel-approved`,
    { method: "PATCH" },
  );
}

export function reviewRentalDocument(
  documentId: string,
  status: "APROBADO" | "RECHAZADO",
  rejectionReason?: string,
) {
  return adminRequest<{
    document: NonNullable<AdminRentalRequest["items"][number]["prescription"]>;
    message: string;
  }>(`/rentals/documents/${encodeURIComponent(documentId)}/review`, {
    method: "PATCH",
    body: JSON.stringify({ status, rejectionReason }),
  });
}

export function updateRentalDeposit(
  id: string,
  data: {
    status: "RETURNED" | "RETAINED" | "PARTIALLY_RETAINED";
    returnedAmount: number;
    retainedAmount: number;
    notes?: string;
  },
) {
  return adminRequest<{ rental: AdminRentalRequest; message: string }>(
    `/rentals/${id}/deposit`,
    { method: "PATCH", body: JSON.stringify(data) },
  );
}

export function downloadRentalDocument(
  documentId: string,
  fallbackName = "receta",
) {
  return downloadBinaryResponse(
    `/rentals/documents/${encodeURIComponent(documentId)}/content?disposition=inline`,
    fallbackName,
    "No se pudo descargar la receta",
  );
}

export function downloadRentalPrescriptionItem(
  itemId: number,
  fallbackName = "receta",
) {
  return downloadBinaryResponse(
    `/rentals/items/${itemId}/prescription`,
    fallbackName,
    "No se pudo descargar la receta",
  );
}

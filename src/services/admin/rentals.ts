import { adminRequest } from "./request";
import { downloadBinaryResponse } from "./request";
import type { AdminRentalRequest, RentalStatus } from "./types";

export function listAdminRentals(params?: {
  status?: RentalStatus | "ALL";
  search?: string;
}) {
  const search = new URLSearchParams();

  if (params?.status && params.status !== "ALL") {
    search.set("status", params.status);
  }

  if (params?.search?.trim()) {
    search.set("search", params.search.trim());
  }

  const query = search.toString();
  return adminRequest<{ rentals: AdminRentalRequest[] }>(
    `/rentals/admin${query ? `?${query}` : ""}`,
    { method: "GET" },
  );
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

export function downloadRentalPrescriptionItem(itemId: number, fallbackName = "receta") {
  return downloadBinaryResponse(
    `/rentals/items/${itemId}/prescription`,
    fallbackName,
    "No se pudo descargar la receta",
  );
}

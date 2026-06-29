import { apiFetch } from "@/lib/api-fetch";
import { parseApiResponse } from "@/lib/api-error";

export type RentalStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED"
  | "DELIVERED"
  | "RETURNED";

export type RentalRequest = {
  id: string;
  status: RentalStatus;
  subtotal: number;
  depositTotal: number;
  total: number;
  notes: string | null;
  rejectedReason: string | null;
  approvedAt: string | null;
  rejectedAt: string | null;
  cancelledAt: string | null;
  deliveredAt: string | null;
  returnedAt: string | null;
  statusUpdatedAt: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    nombre: string;
    correo: string;
    telefono: string | null;
    direccion: string | null;
  };
  approvedBy: {
    id: number;
    nombre: string;
    correo: string;
  } | null;
  statusUpdatedBy: {
    id: number;
    nombre: string;
    correo: string;
  } | null;
  items: Array<{
    id: number;
    productId: number;
    quantity: number;
    startDate: string;
    endDate: string;
    days: number;
    dailyPrice: number;
    deposit: number;
    lineSubtotal: number;
    lineDeposit: number;
    lineTotal: number;
    notes: string | null;
    prescription: {
      fileName: string;
      mimeType: string | null;
      sizeBytes: number | null;
    } | null;
    product: {
      id: number;
      nombre: string;
      marca: string;
      modelo: string;
      clasificacion: string;
      stock: number;
      tipoAdquisicion: "VENTA" | "RENTA" | "MIXTO";
      requiereReceta: boolean;
      imageUrl: string | null;
    };
  }>;
};

export async function listMyRentals() {
  const res = await apiFetch("/rentals/mine", { method: "GET" });
  return parseApiResponse<{ rentals: RentalRequest[] }>(
    res,
    "No se pudieron cargar tus solicitudes de renta",
  );
}

export async function createRentalFromCart(data?: {
  prescriptions?: Record<number, File | null | undefined>;
}) {
  const body = new FormData();

  if (data?.prescriptions) {
    Object.entries(data.prescriptions).forEach(([itemId, file]) => {
      if (file) {
        body.set(`prescription:${itemId}`, file);
      }
    });
  }

  const res = await apiFetch("/rentals/from-cart", {
    method: "POST",
    body,
  });
  return parseApiResponse<{ rental: RentalRequest; message: string }>(
    res,
    "No se pudo enviar la solicitud de renta",
  );
}

export async function cancelMyRental(id: string) {
  const res = await apiFetch(`/rentals/${id}/cancel`, { method: "PATCH" });
  return parseApiResponse<{ rental: RentalRequest; message: string }>(
    res,
    "No se pudo cancelar la solicitud",
  );
}

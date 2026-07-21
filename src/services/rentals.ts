import {
  apiFetch,
  ensureCsrfCookie,
  readCsrfTokenFromDocument,
  refreshSession,
} from "@/lib/api-fetch";
import {
  ApiError,
  parseApiResponse,
  parseJsonSafe,
  resolveErrorMessage,
} from "@/lib/api-error";
import { resolveApiUrl } from "@/lib/api-config";

export type RentalStatus =
  "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED" | "DELIVERED" | "RETURNED";

export type MyRentalFilter =
  | "ALL"
  | "PENDING"
  | "DOCUMENTATION_PENDING"
  | "APPROVED"
  | "DELIVERED"
  | "DUE_SOON"
  | "RETURNED"
  | "REJECTED"
  | "CANCELLED";

export type MyRentalCounts = {
  all: number;
  pending: number;
  documentationPending: number;
  scheduled: number;
  active: number;
  dueSoon: number;
  finalized: number;
  rejected: number;
  cancelled: number;
};

export type RentalRequest = {
  id: string;
  folio: string | null;
  status: RentalStatus;
  subtotal: number;
  depositTotal: number;
  depositStatus: "PENDING" | "RETURNED" | "RETAINED" | "PARTIALLY_RETAINED";
  depositReturnedAmount: number;
  depositRetainedAmount: number;
  depositNotes: string | null;
  depositResolvedAt: string | null;
  total: number;
  notes: string | null;
  applicantName: string | null;
  applicantEmail: string | null;
  applicantPhone: string | null;
  isForAnotherPerson: boolean;
  patientName: string | null;
  patientRelationship: string | null;
  deliveryMethod: "PICKUP" | "HOME_DELIVERY" | null;
  deliveryAddress: string | null;
  deliveryNeighborhood: string | null;
  deliveryPostalCode: string | null;
  deliveryMunicipality: string | null;
  deliveryReferences: string | null;
  preferredSchedule: string | null;
  rentalTermsAcceptedAt: string | null;
  privacyAcceptedAt: string | null;
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
  depositResolvedBy: {
    id: number;
    nombre: string;
    correo: string;
  } | null;
  statusHistory: Array<{
    id: number;
    fromStatus: RentalStatus | null;
    toStatus: RentalStatus;
    note: string | null;
    createdAt: string;
    actor: {
      id: number;
      nombre: string;
      correo: string;
    } | null;
  }>;
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
    productNameSnapshot: string | null;
    productBrandSnapshot?: string | null;
    productModelSnapshot: string | null;
    productSkuSnapshot?: string | null;
    productImageSnapshot?: string | null;
    productClassSnapshot?: string | null;
    prescriptionRequiredSnapshot?: boolean | null;
    prescription: {
      id: string;
      fileName: string;
      mimeType: string | null;
      sizeBytes: number | null;
      status: "PENDIENTE" | "EN_REVISION" | "APROBADO" | "RECHAZADO";
      uploadedAt: string;
      associatedAt: string | null;
      reviewedAt: string | null;
      rejectionReason: string | null;
      reviewedBy: {
        id: number;
        nombre: string;
        correo: string;
      } | null;
    } | null;
    product: {
      id: number;
      nombre: string;
      marca: string;
      modelo: string;
      sku?: string;
      clasificacion: string;
      stock: number;
      tipoAdquisicion: "VENTA" | "RENTA" | "MIXTO";
      requiereReceta: boolean;
      imageUrl: string | null;
    };
  }>;
};

export type RentalRequirementsInput = {
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  isForAnotherPerson: boolean;
  patientName?: string;
  patientRelationship?: string;
  patientRelationshipOther?: string;
  deliveryMethod: "PICKUP" | "HOME_DELIVERY";
  deliveryAddress?: string;
  deliveryNeighborhood?: string;
  deliveryPostalCode?: string;
  deliveryMunicipality?: string;
  deliveryReferences?: string;
  preferredSchedule?: string;
  generalNotes?: string;
  acceptRentalTerms: boolean;
  acceptPrivacy: boolean;
};

export type RentalDocumentSummary = {
  id: string;
  originalFilename: string;
  mimeType: string;
  bytes: number;
  status: "PENDIENTE" | "EN_REVISION" | "APROBADO" | "RECHAZADO";
  uploadedAt: string;
  associatedAt: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
};

function uploadPrescriptionRequest(
  path: string,
  itemId: number,
  file: File,
  onProgress?: (percent: number) => void,
) {
  return new Promise<{ message: string; document: RentalDocumentSummary }>(
    (resolve, reject) => {
      const request = new XMLHttpRequest();
      request.open(
        "POST",
        resolveApiUrl(`/rentals/${path}/${itemId}/prescription`),
      );
      request.withCredentials = true;
      const csrf = readCsrfTokenFromDocument();
      if (csrf) request.setRequestHeader("X-CSRF-Token", csrf);
      request.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          onProgress?.(Math.round((event.loaded / event.total) * 100));
        }
      };
      request.onerror = () =>
        reject(new ApiError("No se pudo subir la receta", 0));
      request.onload = () => {
        let body: unknown = null;
        try {
          body = JSON.parse(request.responseText || "null");
        } catch {
          body = null;
        }
        if (request.status < 200 || request.status >= 300) {
          reject(
            new ApiError(
              resolveErrorMessage(body, "No se pudo subir la receta"),
              request.status,
              body,
            ),
          );
          return;
        }
        onProgress?.(100);
        resolve(body as { message: string; document: RentalDocumentSummary });
      };
      const body = new FormData();
      body.set("file", file);
      request.send(body);
    },
  );
}

export async function uploadCartItemPrescription(
  itemId: number,
  file: File,
  onProgress?: (percent: number) => void,
) {
  await ensureCsrfCookie();
  try {
    return await uploadPrescriptionRequest("cart-items", itemId, file, onProgress);
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) throw error;
    if (!(await refreshSession())) throw error;
    await ensureCsrfCookie();
    return uploadPrescriptionRequest("cart-items", itemId, file, onProgress);
  }
}

export async function uploadRentalItemPrescription(
  itemId: number,
  file: File,
  onProgress?: (percent: number) => void,
) {
  await ensureCsrfCookie();
  try {
    return await uploadPrescriptionRequest("items", itemId, file, onProgress);
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) throw error;
    if (!(await refreshSession())) throw error;
    await ensureCsrfCookie();
    return uploadPrescriptionRequest("items", itemId, file, onProgress);
  }
}

export async function deleteCartItemPrescription(itemId: number) {
  const res = await apiFetch(`/rentals/cart-items/${itemId}/prescription`, {
    method: "DELETE",
  });
  return parseApiResponse<{ message: string }>(
    res,
    "No se pudo eliminar la receta",
  );
}

export async function listMyRentals(options: {
  status?: MyRentalFilter;
  search?: string;
  page?: number;
  pageSize?: number;
} = {}) {
  const params = new URLSearchParams();
  if (options.status && options.status !== "ALL") {
    params.set("status", options.status);
  }
  if (options.search?.trim()) params.set("search", options.search.trim());
  if (options.page) params.set("page", String(options.page));
  if (options.pageSize) params.set("pageSize", String(options.pageSize));
  const query = params.size > 0 ? `?${params.toString()}` : "";
  const res = await apiFetch(`/rentals/mine${query}`, { method: "GET" });
  return parseApiResponse<{
    rentals: RentalRequest[];
    pagination: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
    counts: MyRentalCounts;
  }>(
    res,
    "No se pudieron cargar tus solicitudes de renta",
  );
}

export async function getMyRental(id: string) {
  const res = await apiFetch(`/rentals/mine/${encodeURIComponent(id)}`, {
    method: "GET",
  });
  return parseApiResponse<{ rental: RentalRequest }>(
    res,
    "No se pudo cargar la solicitud de renta",
  );
}

export async function getRentalDocumentContent(
  documentId: string,
  disposition: "inline" | "attachment" = "inline",
) {
  const res = await apiFetch(
    `/rentals/documents/${encodeURIComponent(documentId)}/content?disposition=${disposition}`,
    { method: "GET" },
  );
  if (!res.ok) {
    const body = await parseJsonSafe(res);
    throw new ApiError(
      resolveErrorMessage(body, "No se pudo abrir la receta"),
      res.status,
      body,
    );
  }
  return res.blob();
}

export async function createRentalFromCart(data: RentalRequirementsInput) {
  const res = await apiFetch("/rentals/from-cart", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
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

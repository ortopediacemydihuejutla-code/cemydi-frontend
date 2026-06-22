import { adminRequest } from "./request";
import type {
  CreateSupplierPayload,
  SupplierOption,
  UpdateSupplierPayload,
} from "./types";

export function listSuppliers() {
  return adminRequest<{ suppliers: SupplierOption[] }>("/suppliers", {
    method: "GET",
  });
}

export function createSupplier(payload: CreateSupplierPayload) {
  return adminRequest<{ supplier: SupplierOption; message: string }>(
    "/suppliers",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export function updateSupplier(id: number, payload: UpdateSupplierPayload) {
  return adminRequest<{ supplier: SupplierOption; message: string }>(
    `/suppliers/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

export function deleteSupplier(id: number) {
  return adminRequest<{ message: string }>(`/suppliers/${id}`, {
    method: "DELETE",
  });
}

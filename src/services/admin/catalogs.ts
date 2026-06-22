import { adminRequest } from "./request";
import type {
  BrandOption,
  ClassificationOption,
  CreateCatalogOptionPayload,
} from "./types";

export function listCatalogs() {
  return adminRequest<{
    brands: BrandOption[];
    classifications: ClassificationOption[];
  }>("/catalogs", { method: "GET" });
}

export function createBrand(payload: CreateCatalogOptionPayload) {
  return adminRequest<{ brand: BrandOption; message: string }>(
    "/catalogs/brands",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export function updateBrand(id: number, payload: CreateCatalogOptionPayload) {
  return adminRequest<{ brand: BrandOption; message: string }>(
    `/catalogs/brands/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

export function deleteBrand(id: number) {
  return adminRequest<{ message: string }>(`/catalogs/brands/${id}`, {
    method: "DELETE",
  });
}

export function createClassification(payload: CreateCatalogOptionPayload) {
  return adminRequest<{ classification: ClassificationOption; message: string }>(
    "/catalogs/classifications",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export function updateClassification(
  id: number,
  payload: CreateCatalogOptionPayload,
) {
  return adminRequest<{ classification: ClassificationOption; message: string }>(
    `/catalogs/classifications/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

export function deleteClassification(id: number) {
  return adminRequest<{ message: string }>(
    `/catalogs/classifications/${id}`,
    {
      method: "DELETE",
    },
  );
}

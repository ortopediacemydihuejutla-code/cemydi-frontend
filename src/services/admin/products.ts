import { adminRequest } from "./request";
import type {
  AdminProduct,
  CreateProductPayload,
  UpdateProductPayload,
} from "./types";

type ProductMutationOptions = {
  files?: File[];
  imageUrls?: string[];
  keepImageIds?: number[];
};

function appendProductPayloadToFormData(
  formData: FormData,
  payload: CreateProductPayload | UpdateProductPayload,
) {
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    formData.append(key, String(value));
  });
}

function buildProductFormData(
  payload: CreateProductPayload | UpdateProductPayload,
  options?: ProductMutationOptions,
) {
  const formData = new FormData();

  appendProductPayloadToFormData(formData, payload);

  options?.imageUrls?.forEach((imageUrl) => {
    if (imageUrl.trim()) {
      formData.append("imageUrls", imageUrl.trim());
    }
  });

  options?.keepImageIds?.forEach((imageId) => {
    formData.append("keepImageIds", String(imageId));
  });

  options?.files?.forEach((file) => {
    formData.append("images", file);
  });

  return formData;
}

export function listProducts() {
  return adminRequest<{ products: AdminProduct[] }>(
    "/products?includeInactive=true",
    { method: "GET" },
  );
}

export function getProduct(id: number, includeInactive = true) {
  const query = includeInactive ? "?includeInactive=true" : "";
  return adminRequest<{ product: AdminProduct }>(`/products/${id}${query}`, {
    method: "GET",
  });
}

export function createProduct(
  payload: CreateProductPayload,
  options?: ProductMutationOptions,
) {
  const body =
    options?.files?.length || options?.imageUrls?.length
      ? buildProductFormData(payload, options)
      : JSON.stringify(payload);

  return adminRequest<{ product: AdminProduct; message: string }>("/products", {
    method: "POST",
    body,
  });
}

export function updateProduct(
  id: number,
  payload: UpdateProductPayload,
  options?: ProductMutationOptions,
) {
  const body =
    options?.files?.length ||
    options?.imageUrls?.length ||
    options?.keepImageIds
      ? buildProductFormData(payload, options)
      : JSON.stringify(payload);

  return adminRequest<{ product: AdminProduct; message: string }>(
    `/products/${id}`,
    {
      method: "PATCH",
      body,
    },
  );
}

export function deleteProduct(id: number) {
  return adminRequest<{ message: string }>(`/products/${id}`, {
    method: "DELETE",
  });
}

import type { AdminProduct } from "@/services/admin";

export function getProductGalleryImages(product: AdminProduct) {
  if (product.images.length > 0) {
    return product.images;
  }

  return product.imageUrl
    ? [{ id: 0, imageUrl: product.imageUrl, sortOrder: 0, createdAt: product.createdAt ?? "" }]
    : [];
}

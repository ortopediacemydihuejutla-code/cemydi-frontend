import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { getCatalogProductById } from "@/services/catalog";
import ProductDetailClient from "./ProductDetailClient";

type ProductDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function truncateDescription(text: string, maxLength = 160) {
  const clean = text.trim().replace(/\s+/g, " ");
  if (clean.length <= maxLength) {
    return clean;
  }

  return `${clean.slice(0, maxLength - 1).trimEnd()}…`;
}

const loadProductOrThrowNotFound = cache(async (productId: number) => {
  try {
    const result = await getCatalogProductById(productId);
    return result.product;
  } catch (error) {
    const message = error instanceof Error ? error.message.toLowerCase() : "";
    if (message.includes("no encontrado") || message.includes("not found")) {
      notFound();
    }

    throw error;
  }
});

function getPrimaryProductImage(product: Awaited<ReturnType<typeof loadProductOrThrowNotFound>>) {
  return product.images[0]?.imageUrl ?? product.imageUrl ?? null;
}

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const productId = Number(id);

  if (!Number.isInteger(productId) || productId <= 0) {
    return {
      title: "Producto no encontrado",
    };
  }

  try {
    const product = await loadProductOrThrowNotFound(productId);
    const primaryImage = getPrimaryProductImage(product);
    const description = truncateDescription(
      product.descripcion || `${product.nombre} — ${product.clasificacion}`,
    );

    return {
      title: product.nombre,
      description,
      openGraph: {
        title: product.nombre,
        description,
        type: "website",
        images: primaryImage ? [{ url: primaryImage, alt: product.nombre }] : [],
      },
      twitter: {
        card: "summary_large_image",
        title: product.nombre,
        description,
        images: primaryImage ? [primaryImage] : undefined,
      },
      alternates: {
        canonical: `/producto/${productId}`,
      },
    };
  } catch {
    return {
      title: "Producto",
    };
  }
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { id } = await params;
  const productId = Number(id);

  if (!Number.isInteger(productId) || productId <= 0) {
    notFound();
  }

  const product = await loadProductOrThrowNotFound(productId);

  return <ProductDetailClient product={product} productId={productId} />;
}

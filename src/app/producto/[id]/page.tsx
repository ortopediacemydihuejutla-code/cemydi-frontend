import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { getCatalogProductById } from "@/services/catalog";
import { getSiteUrl } from "@/lib/site-config";
import {
  buildProductShareDescription,
  getProductShareImageUrl,
  getProductUrl,
  truncateShareDescription,
} from "@/lib/product-share";
import ProductDetailClient from "./ProductDetailClient";

type ProductDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

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
    const siteUrl = getSiteUrl();
    const productUrl = getProductUrl(product, siteUrl);
    const title = `${product.nombre} | CEMYDI`;
    const description = truncateShareDescription(
      buildProductShareDescription(product),
      180,
    );
    const imageUrl = getProductShareImageUrl(product, siteUrl);

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: productUrl,
        type: "website",
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: product.nombre,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [imageUrl],
      },
      alternates: {
        canonical: productUrl,
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

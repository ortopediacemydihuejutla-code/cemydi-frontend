import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import {
  getCatalogProductById,
  getCatalogProductBySlug,
  getCatalogProducts,
  getActivePromotions,
} from "@/services/catalog";
import { getSiteUrl } from "@/lib/site-config";
import {
  buildProductShareDescription,
  getProductShareImageUrl,
  getProductSlug,
  getProductUrl,
  slugifyProductName,
  truncateShareDescription,
} from "@/lib/product-share";
import ProductDetailClient from "./ProductDetailClient";

type ProductDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

const loadProductByIdOrThrowNotFound = cache(async (productId: number) => {
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

const loadProductBySlugOrThrowNotFound = cache(async (slug: string) => {
  try {
    const result = await getCatalogProductBySlug(slug);
    return result.product;
  } catch {
    // Compatibilidad temporal con backends que aún no exponen /products/slug/:slug.
  }

  const search = slug.replace(/-\d+$/, "").replace(/-/g, " ");
  const result = await getCatalogProducts({ search, page: 1, pageSize: 60 });
  const product = result.products.find(
    (item) =>
      getProductSlug(item) === slug || slugifyProductName(item.nombre) === slug,
  );

  if (!product) {
    notFound();
  }

  return product;
});

function getLegacyProductId(value: string) {
  const productId = Number(value);
  return Number.isInteger(productId) && productId > 0 ? productId : null;
}

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { id: productPath } = await params;
  const legacyProductId = getLegacyProductId(productPath);

  try {
    const product = legacyProductId
      ? await loadProductByIdOrThrowNotFound(legacyProductId)
      : await loadProductBySlugOrThrowNotFound(productPath);
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
  const { id: productPath } = await params;
  const legacyProductId = getLegacyProductId(productPath);
  const product = legacyProductId
    ? await loadProductByIdOrThrowNotFound(legacyProductId)
    : await loadProductBySlugOrThrowNotFound(productPath);

  if (legacyProductId) {
    redirect(`/producto/${encodeURIComponent(getProductSlug(product))}`);
  }

  const activePromotions = await getActivePromotions()
    .then((result) => result.promotions)
    .catch(() => []);
  const promotion =
    activePromotions
      .filter((item) => item.productId === product.id)
      .sort((a, b) => b.discountPercent - a.discountPercent)[0] ?? null;

  return (
    <ProductDetailClient
      product={product}
      productId={product.id}
      promotion={promotion}
    />
  );
}

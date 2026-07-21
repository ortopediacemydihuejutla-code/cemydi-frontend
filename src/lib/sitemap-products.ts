import { getInternalApiUrl } from "@/lib/api-config";

type SitemapProductPage = {
  products: Array<{ nombre: string; slug?: string; createdAt?: string }>;
  pagination?: {
    hasNext: boolean;
    page: number;
  };
};

export async function fetchActiveProductIdsForSitemap() {
  const baseUrl = getInternalApiUrl();
  const entries: Array<{
    nombre: string;
    slug?: string;
    lastModified?: Date;
  }> = [];
  let page = 1;
  let hasNext = true;

  while (hasNext) {
    const url = `${baseUrl}/products?page=${page}&pageSize=60`;
    const response = await fetch(url, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      break;
    }

    const data = (await response.json()) as SitemapProductPage;
    for (const product of data.products ?? []) {
      entries.push({
        nombre: product.nombre,
        slug: product.slug,
        lastModified: product.createdAt ? new Date(product.createdAt) : undefined,
      });
    }

    hasNext = Boolean(data.pagination?.hasNext);
    page += 1;

    if (!data.pagination) {
      break;
    }
  }

  return entries;
}

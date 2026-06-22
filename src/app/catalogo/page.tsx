import { getActivePromotions, getCatalogProducts } from "@/services/catalog";
import CatalogClient from "./components/CatalogClient";
import { mergeAvailableClassifications } from "./utils/catalog-formatters";
import { mergeAvailableBrands } from "./utils/catalog-params";
import {
  appliedParamsToApiQuery,
  CATALOG_PAGE_SIZE,
  parseCatalogSearchParams,
} from "./utils/catalog-params";

type CatalogPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const params = await searchParams;
  const applied = parseCatalogSearchParams(params);

  let products: Awaited<ReturnType<typeof getCatalogProducts>>["products"] = [];
  let pagination = {
    page: applied.page,
    pageSize: CATALOG_PAGE_SIZE,
    total: 0,
    totalPages: 1,
    hasPrevious: false,
    hasNext: false,
  };
  let availableClassifications = mergeAvailableClassifications();
  let availableBrands: string[] = [];
  let promotedProductIds: number[] = [];
  let error = "";

  try {
    const [result, promotionsResult] = await Promise.all([
      getCatalogProducts(appliedParamsToApiQuery(applied)),
      getActivePromotions().catch(() => ({ promotions: [] as [] })),
    ]);

    products = result.products;
    pagination = {
      page: result.pagination?.page ?? applied.page,
      pageSize: result.pagination?.pageSize ?? CATALOG_PAGE_SIZE,
      total: result.pagination?.total ?? result.products.length,
      totalPages: result.pagination?.totalPages ?? 1,
      hasPrevious: result.pagination?.hasPrevious ?? false,
      hasNext: result.pagination?.hasNext ?? false,
    };
    availableClassifications = mergeAvailableClassifications(
      result.filters?.clasificaciones,
    );
    availableBrands = mergeAvailableBrands(result.filters?.marcas);
    promotedProductIds = promotionsResult.promotions.map(
      (promotion) => promotion.productId,
    );
  } catch {
    error = "No pudimos cargar el catalogo. Intenta nuevamente en unos minutos.";
  }

  const catalogStateKey = [
    applied.searchQuery,
    applied.clasificaciones.join(","),
    applied.marcas.join(","),
    applied.tipos.join(","),
    applied.receta ?? "",
    applied.soloDisponibles ? "1" : "0",
    applied.sort,
    applied.view,
    String(applied.page),
  ].join("|");

  return (
    <CatalogClient
      key={catalogStateKey}
      products={products}
      pagination={pagination}
      availableClassifications={availableClassifications}
      availableBrands={availableBrands}
      promotedProductIds={promotedProductIds}
      applied={applied}
      error={error}
    />
  );
}

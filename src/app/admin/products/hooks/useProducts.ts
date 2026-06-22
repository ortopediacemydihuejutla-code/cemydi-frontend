"use client";

import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import type { AuthUserProfile } from "@/providers/AuthContext";
import { listProducts, type AdminProduct } from "@/services/admin";
import { adminQueryKeys } from "@/features/admin/lib/query-keys";

import { useClampPage, useResetPageOnChange } from "@/features/admin/hooks/use-admin-pagination";
import { getPaginationWindow } from "@/features/admin/lib/admin-list-utils";
import {
  PRODUCT_PAGE_SIZE,
  loadProductReferenceData,
  normalizeAdminProducts,
} from "@/features/admin/lib/product-shared";
import {
  compareProductSortValues,
  getDefaultProductSortDirection,
  getProductSortValue,
} from "../utils/product-filter-utils";
import {
  DEFAULT_PRODUCT_SORT,
  DEFAULT_PRODUCT_VISIBLE_COLUMNS,
  PRODUCT_COLUMN_ORDER,
  PRODUCT_COLUMN_WIDTHS,
  type ProductColumnId,
  type ProductSortState,
} from "../utils/product-types";
import { getProductGalleryImages } from "../utils/product-mappers";
import { useProductFilters } from "./useProductFilters";
import { useProductMutations } from "./useProductMutations";

export type ProductsAdminState = ReturnType<typeof useProducts>;

export function useProducts(user: AuthUserProfile | null) {
  const productsQuery = useQuery({
    queryKey: adminQueryKeys.products,
    queryFn: async () => {
      const response = await listProducts();
      return normalizeAdminProducts(response.products);
    },
    enabled: Boolean(user),
  });

  const referenceQuery = useQuery({
    queryKey: adminQueryKeys.productReference,
    queryFn: loadProductReferenceData,
    enabled: Boolean(user),
  });

  const products = productsQuery.data ?? [];
  const brands = referenceQuery.data?.brands ?? [];
  const classifications = referenceQuery.data?.classifications ?? [];
  const initialLoading = productsQuery.isLoading || referenceQuery.isLoading;
  const [page, setPage] = useState(1);
  const [sortState, setSortState] = useState<ProductSortState>(DEFAULT_PRODUCT_SORT);
  const [visibleProductColumns, setVisibleProductColumns] = useState<
    Record<ProductColumnId, boolean>
  >(DEFAULT_PRODUCT_VISIBLE_COLUMNS);
  const [imageDialogProduct, setImageDialogProduct] = useState<AdminProduct | null>(null);
  const [imageDialogIndex, setImageDialogIndex] = useState(0);

  const filters = useProductFilters({ products, brands, classifications });
  const mutations = useProductMutations({
    products,
    setPage,
    refetchProducts: () => productsQuery.refetch(),
  });

  const sortedProducts = useMemo(() => {
    const { column, direction } = sortState;
    return [...filters.filteredProducts].sort((a, b) => {
      const cmp = compareProductSortValues(
        getProductSortValue(a, column),
        getProductSortValue(b, column),
      );
      return direction === "asc" ? cmp : -cmp;
    });
  }, [filters.filteredProducts, sortState]);

  const visibleOrderedProductColumns = useMemo(
    () => PRODUCT_COLUMN_ORDER.filter((id) => visibleProductColumns[id]),
    [visibleProductColumns],
  );

  const productTableMinWidth = useMemo(() => {
    const cols = visibleOrderedProductColumns.reduce(
      (total, id) => total + (PRODUCT_COLUMN_WIDTHS[id] ?? 140),
      0,
    );
    const actionCol = 104;
    const floor = 320;
    return Math.max(floor, cols + actionCol);
  }, [visibleOrderedProductColumns]);

  const productTableColPercents = useMemo(() => {
    const actionW = 104;
    const dataTotal = visibleOrderedProductColumns.reduce(
      (s, id) => s + PRODUCT_COLUMN_WIDTHS[id],
      0,
    );
    const total = dataTotal + actionW;
    if (total <= 0) {
      return { columns: [] as { id: ProductColumnId; percent: string }[], action: "12%" };
    }
    return {
      columns: visibleOrderedProductColumns.map((id) => ({
        id,
        percent: `${((PRODUCT_COLUMN_WIDTHS[id] / total) * 100).toFixed(3)}%`,
      })),
      action: `${((actionW / total) * 100).toFixed(3)}%`,
    };
  }, [visibleOrderedProductColumns]);

  const { totalPages, resultStart, resultEnd } = getPaginationWindow(
    page,
    PRODUCT_PAGE_SIZE,
    sortedProducts.length,
  );

  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * PRODUCT_PAGE_SIZE;
    return sortedProducts.slice(start, start + PRODUCT_PAGE_SIZE);
  }, [sortedProducts, page]);

  const activeProducts = products.filter((product) => product.activo).length;
  const totalStock = products.reduce((acc, product) => acc + product.stock, 0);
  const recipeProducts = products.filter((product) => product.requiereReceta).length;

  const imageDialogImages = useMemo(
    () => (imageDialogProduct ? getProductGalleryImages(imageDialogProduct) : []),
    [imageDialogProduct],
  );

  const currentDialogImage = imageDialogImages[imageDialogIndex] ?? null;

  useClampPage(page, setPage, totalPages);
  useResetPageOnChange(setPage, [
    filters.search,
    filters.quickFilter,
    filters.tableAdvancedFilters,
  ]);

  const openImageDialog = (product: AdminProduct, index = 0) => {
    const images = getProductGalleryImages(product);
    if (images.length === 0) return;

    setImageDialogProduct(product);
    setImageDialogIndex(Math.max(0, Math.min(index, images.length - 1)));
  };

  const closeImageDialog = () => {
    setImageDialogProduct(null);
    setImageDialogIndex(0);
  };

  const showPreviousDialogImage = useCallback(() => {
    if (imageDialogImages.length <= 1) return;
    setImageDialogIndex((current) =>
      current === 0 ? imageDialogImages.length - 1 : current - 1,
    );
  }, [imageDialogImages.length]);

  const showNextDialogImage = useCallback(() => {
    if (imageDialogImages.length <= 1) return;
    setImageDialogIndex((current) =>
      current === imageDialogImages.length - 1 ? 0 : current + 1,
    );
  }, [imageDialogImages.length]);

  useEffect(() => {
    if (!imageDialogProduct) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        showPreviousDialogImage();
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        showNextDialogImage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [imageDialogProduct, showNextDialogImage, showPreviousDialogImage]);

  const handleProductSortChange = (columnId: ProductColumnId) => {
    setSortState((current) => {
      if (current.column === columnId) {
        return {
          column: columnId,
          direction: current.direction === "asc" ? "desc" : "asc",
        };
      }
      return {
        column: columnId,
        direction: getDefaultProductSortDirection(columnId),
      };
    });
  };

  const toggleProductColumnVisibility = (columnId: ProductColumnId, checked: boolean) => {
    const visibleCount = PRODUCT_COLUMN_ORDER.filter((id) => visibleProductColumns[id]).length;
    if (!checked && visibleCount === 1 && visibleProductColumns[columnId]) {
      toast.error("Debes mantener al menos una columna visible");
      return;
    }
    setVisibleProductColumns((current) => ({
      ...current,
      [columnId]: checked,
    }));
  };

  const resetProductVisibleColumns = () => {
    setVisibleProductColumns(DEFAULT_PRODUCT_VISIBLE_COLUMNS);
  };

  return {
    initialLoading,
    products,
    brands,
    classifications,
    page,
    setPage,
    sortState,
    visibleProductColumns,
    imageDialogProduct,
    imageDialogIndex,
    setImageDialogIndex,
    sortedProducts,
    visibleOrderedProductColumns,
    productTableMinWidth,
    productTableColPercents,
    totalPages,
    resultStart,
    resultEnd,
    paginatedProducts,
    activeProducts,
    totalStock,
    recipeProducts,
    imageDialogImages,
    currentDialogImage,
    openImageDialog,
    closeImageDialog,
    showPreviousDialogImage,
    showNextDialogImage,
    handleProductSortChange,
    toggleProductColumnVisibility,
    resetProductVisibleColumns,
    ...filters,
    ...mutations,
  };
}

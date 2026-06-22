"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";

import { adminQueryKeys } from "@/features/admin/lib/query-keys";

import {
  createProduct,
  deleteProduct,
  updateProduct,
  type AdminProduct,
} from "@/services/admin";

import {
  PRODUCT_CSV_COLUMNS,
  PRODUCT_CSV_REQUIRED_COLUMN_KEYS,
  applyProductExportFilters,
  buildCsvContent,
  createFileTimestamp,
  createProductImportPreview,
  createProductTemplatePreview,
  defaultProductExportFilters,
  downloadCsvFile,
  getProductCsvTemplateValue,
  getProductCsvValue,
  type ProductCsvColumnKey,
  type ProductCsvImportPreview,
  type ProductCsvTemplatePreview,
  type ProductCsvTemplateRow,
  type ProductExportFilters,
} from "../product-csv";
import { normalizeAdminProduct, normalizeAdminProducts } from "@/features/admin/lib/product-shared";

type UseProductMutationsOptions = {
  products: AdminProduct[];
  setPage: React.Dispatch<React.SetStateAction<number>>;
  refetchProducts?: () => void;
};

export function useProductMutations({
  products,
  setPage,
  refetchProducts,
}: UseProductMutationsOptions) {
  const queryClient = useQueryClient();

  const updateProductsCache = (
    updater: (current: AdminProduct[]) => AdminProduct[],
  ) => {
    queryClient.setQueryData<AdminProduct[]>(adminQueryKeys.products, (current) =>
      updater(current ?? []),
    );
  };

  const invalidateProducts = () => {
    if (refetchProducts) {
      void refetchProducts();
      return;
    }
    void queryClient.invalidateQueries({ queryKey: adminQueryKeys.products });
  };
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<AdminProduct | null>(null);

  const productCsvInputRef = useRef<HTMLInputElement | null>(null);
  const [productImportPreview, setProductImportPreview] =
    useState<ProductCsvImportPreview | null>(null);
  const [selectedExistingImportRows, setSelectedExistingImportRows] = useState<number[]>([]);
  const [importingProductsFromCsv, setImportingProductsFromCsv] = useState(false);
  const [showProductTemplateModal, setShowProductTemplateModal] = useState(false);
  const [productTemplatePreview, setProductTemplatePreview] =
    useState<ProductCsvTemplatePreview | null>(null);
  const [selectedProductTemplateColumns, setSelectedProductTemplateColumns] = useState<
    ProductCsvColumnKey[]
  >(() => PRODUCT_CSV_COLUMNS.map((column) => column.key));
  const [showProductExportModal, setShowProductExportModal] = useState(false);
  const [selectedProductExportColumns, setSelectedProductExportColumns] = useState<
    ProductCsvColumnKey[]
  >(() => PRODUCT_CSV_COLUMNS.map((column) => column.key));
  const [productExportFilters, setProductExportFilters] = useState<ProductExportFilters>(
    defaultProductExportFilters,
  );

  const existingProductModelCodes = useMemo(
    () => new Set(products.map((item) => item.modelo.trim().toLowerCase()).filter(Boolean)),
    [products],
  );

  const productImportSummary = useMemo(() => {
    const rows = productImportPreview?.rows ?? [];
    const invalidRows = rows.filter((row) => Boolean(row.validationError));
    const duplicateExistingRows = rows.filter((row) => row.duplicateExistingModel);
    const duplicateInFileRows = rows.filter((row) => row.duplicateInFile);
    const validRows = rows.filter(
      (row) => !row.validationError && !row.duplicateExistingModel && !row.duplicateInFile,
    );

    return {
      total: rows.length,
      invalidCount: invalidRows.length,
      duplicateExistingCount: duplicateExistingRows.length,
      duplicateInFileCount: duplicateInFileRows.length,
      validRows,
      duplicateExistingModels: Array.from(new Set(duplicateExistingRows.map((row) => row.modelo))),
      duplicateInFileModels: Array.from(new Set(duplicateInFileRows.map((row) => row.modelo))),
    };
  }, [productImportPreview]);

  const filteredProductsForExport = useMemo(
    () => applyProductExportFilters(products, productExportFilters),
    [productExportFilters, products],
  );

  const existingImportRowLineNumbers = useMemo(
    () =>
      (productImportPreview?.rows ?? [])
        .filter((row) => row.duplicateExistingModel)
        .map((row) => row.lineNumber),
    [productImportPreview],
  );

  const selectedExistingImportRowSet = useMemo(
    () => new Set(selectedExistingImportRows),
    [selectedExistingImportRows],
  );

  const allExistingImportRowsSelected =
    existingImportRowLineNumbers.length > 0 &&
    existingImportRowLineNumbers.every((lineNumber) =>
      selectedExistingImportRowSet.has(lineNumber),
    );

  useEffect(() => {
    if (!productImportPreview) {
      if (selectedExistingImportRows.length > 0) {
        setSelectedExistingImportRows([]);
      }
      return;
    }

    const existingRowSet = new Set(
      productImportPreview.rows
        .filter((row) => row.duplicateExistingModel)
        .map((row) => row.lineNumber),
    );

    setSelectedExistingImportRows((prev) =>
      prev.filter((lineNumber) => existingRowSet.has(lineNumber)),
    );
  }, [productImportPreview, selectedExistingImportRows.length]);

  const handleToggleActive = async (product: AdminProduct) => {
    try {
      setSaving(true);
      const response = await updateProduct(product.id, { activo: !product.activo });
      updateProductsCache((current) =>
        current.map((item) =>
          item.id === product.id ? normalizeAdminProduct(response.product) : item,
        ),
      );
      toast.success(response.message || "Estado del producto actualizado");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo cambiar el estado";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!productToDelete) return;

    try {
      setSaving(true);
      const response = await deleteProduct(productToDelete.id);
      updateProductsCache((current) =>
        current.filter((item) => item.id !== productToDelete.id),
      );
      toast.success(response.message || "Producto eliminado");
      setConfirmOpen(false);
      setProductToDelete(null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo eliminar el producto";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const openProductImportPicker = () => {
    productCsvInputRef.current?.click();
  };

  const openProductTemplateModal = () => {
    setProductTemplatePreview(null);
    setSelectedProductTemplateColumns(PRODUCT_CSV_COLUMNS.map((column) => column.key));
    setShowProductTemplateModal(true);
  };

  const openProductExportModal = () => {
    if (selectedProductExportColumns.length === 0) {
      setSelectedProductExportColumns(PRODUCT_CSV_COLUMNS.map((column) => column.key));
    }
    setProductExportFilters(defaultProductExportFilters);
    setShowProductExportModal(true);
  };

  const onProductCsvSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".csv")) {
      toast.error("Selecciona un archivo .csv valido.");
      return;
    }

    try {
      const csvText = await file.text();
      const preview = createProductImportPreview(file.name, csvText, existingProductModelCodes);
      setProductImportPreview(preview);
      setSelectedExistingImportRows([]);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo procesar el archivo CSV de productos";
      toast.error(message);
    }
  };

  const closeProductImportModal = () => {
    if (importingProductsFromCsv) return;
    setProductImportPreview(null);
    setSelectedExistingImportRows([]);
  };

  const closeProductTemplateModal = () => {
    setShowProductTemplateModal(false);
    setProductTemplatePreview(null);
  };

  const importProductsFromCsv = async () => {
    if (!productImportPreview) return;

    const rowsToImport = productImportSummary.validRows;
    if (rowsToImport.length === 0) {
      toast.error(
        "No hay filas validas para importar. Revisa modelos repetidos o errores.",
      );
      return;
    }

    try {
      setImportingProductsFromCsv(true);
      const createdProducts: AdminProduct[] = [];
      let failedRows = 0;

      for (const row of rowsToImport) {
        try {
          const result = await createProduct(row.payload);
          createdProducts.push(result.product);
        } catch {
          failedRows += 1;
        }
      }

      if (createdProducts.length > 0) {
        updateProductsCache((prev) => [
          ...normalizeAdminProducts(createdProducts),
          ...prev,
        ]);
        setPage(1);
        invalidateProducts();
      }

      setProductImportPreview(null);
      if (createdProducts.length > 0 && failedRows === 0) {
        toast.success(`Importacion completada: ${createdProducts.length} productos creados.`);
      } else if (createdProducts.length > 0) {
        toast.success(
          `Importacion parcial: ${createdProducts.length} creados, ${failedRows} filas no se pudieron guardar.`,
        );
      } else {
        toast.error("No se pudo importar ningun producto del CSV.");
      }
    } finally {
      setImportingProductsFromCsv(false);
    }
  };

  const toggleExportColumn = (columnKey: ProductCsvColumnKey) => {
    setSelectedProductExportColumns((prev) =>
      prev.includes(columnKey)
        ? prev.filter((item) => item !== columnKey)
        : [...prev, columnKey],
    );
  };

  const toggleTemplateColumn = (columnKey: ProductCsvColumnKey) => {
    if (PRODUCT_CSV_REQUIRED_COLUMN_KEYS.includes(columnKey)) {
      return;
    }

    setSelectedProductTemplateColumns((prev) =>
      prev.includes(columnKey)
        ? prev.filter((item) => item !== columnKey)
        : [...prev, columnKey],
    );
  };

  const updateProductExportFilter = <K extends keyof ProductExportFilters>(
    key: K,
    value: ProductExportFilters[K],
  ) => {
    setProductExportFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetProductExportFilters = () => {
    setProductExportFilters(defaultProductExportFilters);
  };

  const applyTopStockExportPreset = () => {
    setProductExportFilters((prev) => ({
      ...prev,
      orderBy: "stock-desc",
      limit: prev.limit === "ALL" ? "10" : prev.limit,
    }));
  };

  const applyTopPriceExportPreset = () => {
    setProductExportFilters((prev) => ({
      ...prev,
      orderBy: "price-desc",
      limit: prev.limit === "ALL" ? "10" : prev.limit,
    }));
  };

  const generateGenericProductTemplate = () => {
    setProductTemplatePreview(
      createProductTemplatePreview(
        PRODUCT_CSV_COLUMNS.map((column) => column.key),
        "generic",
      ),
    );
  };

  const generateCustomProductTemplate = () => {
    setProductTemplatePreview(
      createProductTemplatePreview(selectedProductTemplateColumns, "custom"),
    );
  };

  const resetCustomTemplateColumns = () => {
    setSelectedProductTemplateColumns([...PRODUCT_CSV_REQUIRED_COLUMN_KEYS]);
  };

  const selectAllTemplateColumns = () => {
    setSelectedProductTemplateColumns(PRODUCT_CSV_COLUMNS.map((column) => column.key));
  };

  const downloadProductTemplate = (preview: ProductCsvTemplatePreview) => {
    const csvContent = buildCsvContent<ProductCsvTemplateRow>(
      [],
      preview.columns,
      getProductCsvTemplateValue,
    );

    downloadCsvFile(csvContent, preview.fileName);
    closeProductTemplateModal();
    toast.success(`Plantilla descargada: ${preview.fileName}`);
  };

  const exportProductsCsv = (columns: ProductCsvColumnKey[], filePrefix: string) => {
    if (columns.length === 0) {
      toast.error("Selecciona al menos una columna para exportar.");
      return;
    }

    const orderedColumns = PRODUCT_CSV_COLUMNS.map((column) => column.key).filter((key) =>
      columns.includes(key),
    );
    if (filteredProductsForExport.length === 0) {
      toast.error("No hay productos que coincidan con los filtros de exportacion.");
      return;
    }

    const csvContent = buildCsvContent(
      filteredProductsForExport,
      orderedColumns,
      getProductCsvValue,
    );
    const fileName = `${filePrefix}_${createFileTimestamp()}.csv`;
    downloadCsvFile(csvContent, fileName);
    setShowProductExportModal(false);
    toast.success(
      `CSV exportado: ${fileName} (${filteredProductsForExport.length} productos).`,
    );
  };

  const toggleExistingImportRowSelection = (lineNumber: number) => {
    setSelectedExistingImportRows((prev) =>
      prev.includes(lineNumber)
        ? prev.filter((item) => item !== lineNumber)
        : [...prev, lineNumber],
    );
  };

  const toggleAllExistingImportRows = () => {
    setSelectedExistingImportRows(
      allExistingImportRowsSelected ? [] : existingImportRowLineNumbers,
    );
  };

  const removeSelectedExistingImportRows = () => {
    if (!productImportPreview || selectedExistingImportRows.length === 0) return;

    const selectedRows = new Set(selectedExistingImportRows);
    setProductImportPreview((prev) =>
      prev
        ? {
            ...prev,
            rows: prev.rows.filter((row) => !selectedRows.has(row.lineNumber)),
          }
        : prev,
    );
    setSelectedExistingImportRows([]);
  };

  const requestDeleteProduct = (product: AdminProduct) => {
    setProductToDelete(product);
    setConfirmOpen(true);
  };

  const cancelDeleteProduct = () => {
    if (saving) return;
    setConfirmOpen(false);
    setProductToDelete(null);
  };

  return {
    saving,
    confirmOpen,
    productToDelete,
    productCsvInputRef,
    productImportPreview,
    selectedExistingImportRows,
    importingProductsFromCsv,
    showProductTemplateModal,
    productTemplatePreview,
    setProductTemplatePreview,
    selectedProductTemplateColumns,
    showProductExportModal,
    setShowProductExportModal,
    selectedProductExportColumns,
    setSelectedProductExportColumns,
    productExportFilters,
    productImportSummary,
    filteredProductsForExport,
    existingImportRowLineNumbers,
    selectedExistingImportRowSet,
    allExistingImportRowsSelected,
    handleToggleActive,
    handleDelete,
    openProductImportPicker,
    openProductTemplateModal,
    openProductExportModal,
    onProductCsvSelected,
    closeProductImportModal,
    closeProductTemplateModal,
    importProductsFromCsv,
    toggleExportColumn,
    toggleTemplateColumn,
    updateProductExportFilter,
    resetProductExportFilters,
    applyTopStockExportPreset,
    applyTopPriceExportPreset,
    generateGenericProductTemplate,
    generateCustomProductTemplate,
    resetCustomTemplateColumns,
    selectAllTemplateColumns,
    downloadProductTemplate,
    exportProductsCsv,
    toggleExistingImportRowSelection,
    toggleAllExistingImportRows,
    removeSelectedExistingImportRows,
    requestDeleteProduct,
    cancelDeleteProduct,
  };
}

export type ProductMutationsState = ReturnType<typeof useProductMutations>;

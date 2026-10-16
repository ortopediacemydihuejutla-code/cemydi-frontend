"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import CatalogFilters from "@/app/catalogo/components/CatalogFilters";
import CatalogToolbar from "@/app/catalogo/components/CatalogToolbar";
import CatalogPagination from "@/app/catalogo/components/CatalogPagination";
import { buildCatalogQueryParams, countActiveFilters, parseCatalogSearchParams, type CatalogAppliedParams } from "@/app/catalogo/utils/catalog-params";
import { filterOfflineProducts, type OfflineProduct } from "@/lib/pwa/products";
import { getOfflineCatalogOrders, getOfflineProducts } from "@/lib/pwa/storage";
import { getSavedCatalogOrder, type OfflineCatalogOrders } from "@/lib/pwa/catalog-order";
import CatalogHeader from "@/app/catalogo/components/CatalogHeader";
import ProductGrid from "@/app/catalogo/components/ProductGrid";

export const OFFLINE_COMMERCE_MESSAGE = "Consultar disponibilidad y precio al reconectar";
export default function OfflineCatalog() {
  const [products, setProducts] = useState<OfflineProduct[] | null>(null);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState<CatalogAppliedParams>(() => parseCatalogSearchParams(new URLSearchParams()));
  const [orders, setOrders] = useState<OfflineCatalogOrders>({});
  const [open, setOpen] = useState(false);
  const filterTrigger = useRef<HTMLElement | null>(null);
  useEffect(() => {
    let cancelled = false;
    const initial = parseCatalogSearchParams(new URLSearchParams(location.search));
    void Promise.allSettled([getOfflineProducts(), getOfflineCatalogOrders()]).then(([productResult, orderResult]) => {
      if (cancelled) return;
      setProducts(productResult.status === "fulfilled" ? productResult.value : []);
      setOrders(orderResult.status === "fulfilled" ? orderResult.value : {});
      if (productResult.status === "rejected" || orderResult.status === "rejected") setError("No se pudo leer todo el contenido guardado. El almacenamiento puede estar bloqueado o no disponible.");
      setFilters({ ...initial, soloDisponibles: false });
    }).catch(() => { if (!cancelled) { setProducts([]); setError("No se pudo leer el almacenamiento. Puede estar bloqueado, vacío o haber sido eliminado por el navegador."); } });
    return () => { cancelled = true; };
  }, []);
  const result = useMemo(() => filterOfflineProducts(products ?? [], filters, getSavedCatalogOrder(orders, filters)), [products, filters, orders]);
  const update = (next: Partial<CatalogAppliedParams>) => {
    const value = { ...filters, page: 1, ...next };
    setFilters(value);
    if (location.pathname === "/catalogo") history.replaceState(null, "", `/catalogo?${buildCatalogQueryParams(value)}`);
  };
  function toggle<T>(values: T[], value: T) {
    return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
  }
  if (products === null) return <p role="status" className="p-6">Cargando productos guardados…</p>;
  const filterProps = {
    offline: true,
    availableBrands: [...new Set(products.map((product) => product.marca))].sort(),
    availableClassifications: [...new Set(products.map((product) => product.clasificacion))].sort(),
    applied: filters,
    onToggleClassification: (value: string) => update({ clasificaciones: toggle(filters.clasificaciones, value) }),
    onToggleMarca: (value: string) => update({ marcas: toggle(filters.marcas, value) }),
    onToggleTipo: (value: "VENTA" | "RENTA" | "MIXTO") => update({ tipos: toggle(filters.tipos, value) }),
    onToggleReceta: (value: "con" | "sin") => update({ receta: filters.receta === value ? null : value }),
    onToggleSoloDisponibles: () => {},
    onClearAll: () => update(parseCatalogSearchParams(new URLSearchParams())),
  };
  return <Dialog.Root open={open} onOpenChange={setOpen}><div className="min-h-[calc(100vh-110px)] bg-white">
    <div className="grid min-h-[inherit] w-full grid-cols-1 gap-7 px-4 py-6 lg:grid-cols-[286px_minmax(0,1fr)] lg:px-8 lg:py-8 xl:gap-9 xl:px-10 2xl:px-12">
      <div className="lg:col-span-2"><CatalogHeader searchQuery={filters.searchQuery} /><p className="sr-only">Se muestran únicamente productos guardados en este dispositivo. Los resultados son parciales.</p></div>
      <CatalogFilters {...filterProps} className="sticky top-36 hidden max-h-[calc(100dvh-10rem)] self-start lg:flex lg:flex-col" />
      <div className="grid min-w-0 content-start gap-5">
        <CatalogToolbar offline searchQuery={filters.searchQuery} sort={filters.sort} view={filters.view} activeFilterCount={countActiveFilters(filters)} onSearchSubmit={(value) => update({ searchQuery: value })} onSortChange={(sort) => update({ sort })} onViewChange={(view) => update({ view, page: filters.page })} onOpenMobileFilters={() => {
          filterTrigger.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
          setOpen(true);
        }} />
        <p aria-live="polite">{result.total} productos guardados · Página {result.page} de {result.totalPages}</p>
        {error && <p role="alert">{error}</p>}
        {!result.products.length && <div className="rounded-lg border border-dashed border-[#cfe0e5] bg-white px-6 py-14 text-center"><h2>No hay resultados guardados</h2><p>{products.length ? "Prueba otra búsqueda o limpia los filtros locales." : "Visita páginas del catálogo con conexión para guardar productos. El navegador puede eliminar los datos por restricciones de almacenamiento."}</p></div>}
        {!!result.products.length && <ProductGrid products={result.products} view={filters.view} searchQuery={filters.searchQuery} />}
        <CatalogPagination currentPage={result.page} totalPages={result.totalPages} onPageChange={(page) => update({ page })} />
      </div>
    </div>
    {/* Public catalog has no dialog wrapper; use the existing Radix dependency for focus and scroll management. */}
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-50 bg-[rgba(15,42,50,0.45)]" />
      <Dialog.Content className="fixed inset-y-0 right-0 z-50 flex h-full w-[min(380px,92vw)] flex-col bg-[#f5f9fa] shadow-[-8px_0_32px_rgba(0,0,0,0.12)]" onCloseAutoFocus={(event) => {
        event.preventDefault();
        filterTrigger.current?.focus();
      }}>
        <Dialog.Description className="sr-only">Filtra los productos guardados en este dispositivo.</Dialog.Description>
        <div className="flex items-center justify-between px-[18px] pt-[18px]"><Dialog.Title className="m-0 text-base font-semibold text-[#18313f]">Filtros</Dialog.Title><Dialog.Close className="flex size-11 items-center justify-center rounded-xl bg-white text-[#258e8b]" aria-label="Cerrar">×</Dialog.Close></div>
        <CatalogFilters {...filterProps} showHeading={false} className="flex min-h-0 flex-1 flex-col px-4 py-3" />
        <button type="button" className="mx-[18px] mb-[18px] min-h-11 rounded-2xl bg-[#0f6a67] px-4 py-[14px] text-[0.92rem] font-semibold text-white" onClick={() => setOpen(false)}>Ver {result.total} resultados</button>
      </Dialog.Content>
    </Dialog.Portal>
  </div></Dialog.Root>;
}

"use client";
import { useEffect, useState } from "react";
import { BadgeAlert, ChevronLeft, ChevronRight, ShieldCheck, Store, Truck } from "lucide-react";
import toast from "react-hot-toast";
import type { OfflineProduct } from "@/lib/pwa/products";
import { ProductDetailLayout, ProductDescription, PRODUCT_DETAIL_COLUMNS } from "@/components/product/ProductDetailLayout";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/features/admin/components/ui/dialog";
import OfflineImage from "./OfflineImage";
import { OFFLINE_COMMERCE_MESSAGE } from "./OfflineCatalog";

export default function OfflineProductDetail({ product }: { product: OfflineProduct | null }) {
  useEffect(() => {
    if (!product) toast.error("Esta ficha no está guardada o ya venció. Abre el producto con conexión para guardarlo.", { id: "pwa-product-detail" });
    else if (!product.detail) toast("Solo está guardada la ficha básica. Abre el producto con conexión para actualizar el detalle.", { id: "pwa-product-detail" });
  }, [product]);
  if (!product) return <ProductDetailLayout name="Producto no guardado">
    <h1 className="text-[2rem] font-semibold text-[#111f36]">Producto no guardado</h1>
    <a href="/catalogo" className="mt-4 inline-block font-semibold text-[#1f6a67]">Consultar catálogo guardado</a>
  </ProductDetailLayout>;
  return <SavedProductDetail key={product.id} product={product} />;
}

function SavedProductDetail({ product }: { product: OfflineProduct }) {
  const [selected, setSelected] = useState(0);
  const [zoom, setZoom] = useState(false);
  const urls = product.imageUrls;
  const current = urls[selected];
  const type = product.tipoAdquisicion === "VENTA" ? "Venta" : product.tipoAdquisicion === "RENTA" ? "Renta" : "Ambos";
  const move = (direction: number) => setSelected((index) => (index + direction + urls.length) % urls.length);
  return <ProductDetailLayout name={product.nombre}>
    <div className={PRODUCT_DETAIL_COLUMNS}>
      <section className="grid gap-4 xl:sticky xl:top-24 xl:self-start">
        <div className={`grid gap-4 lg:items-start ${urls.length > 1 ? "lg:grid-cols-[76px_minmax(0,1fr)]" : ""}`}>
          {urls.length > 1 && <div className="order-2 flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] lg:order-1 lg:max-h-[560px] lg:flex-col lg:overflow-x-hidden lg:overflow-y-auto lg:pb-0 [&::-webkit-scrollbar]:hidden">
            {urls.map((url, index) => <button key={url} type="button" onClick={() => setSelected(index)} aria-label={`Ver imagen ${index + 1} de ${urls.length}`} aria-pressed={selected === index}
              className={`relative aspect-square size-[64px] shrink-0 overflow-hidden rounded-[8px] border bg-white transition sm:size-[72px] ${selected === index ? "border-[#1f6a67] shadow-[0_0_0_2px_rgba(31,106,103,0.18)]" : "border-[#d7e3e6] hover:border-[#97b5b7]"}`}>
              <OfflineImage urls={[url]} name={`${product.nombre} imagen ${index + 1}`} />
            </button>)}
          </div>}
          <div className="order-1 grid gap-3 lg:order-2">
            <div className="relative overflow-hidden">
              {urls.length > 1 && <>
                <button type="button" aria-label="Imagen anterior" onClick={() => move(-1)} className="absolute left-3 top-1/2 z-[2] grid size-11 -translate-y-1/2 place-items-center rounded-full bg-[rgba(255,255,255,0.96)] text-[#1f6a67] shadow-[0_10px_18px_rgba(31,106,103,0.12)]"><ChevronLeft className="size-5" /></button>
                <button type="button" aria-label="Imagen siguiente" onClick={() => move(1)} className="absolute right-3 top-1/2 z-[2] grid size-11 -translate-y-1/2 place-items-center rounded-full bg-[rgba(255,255,255,0.96)] text-[#1f6a67] shadow-[0_10px_18px_rgba(31,106,103,0.12)]"><ChevronRight className="size-5" /></button>
              </>}
              <div className="group relative min-h-[360px] w-full overflow-hidden bg-white sm:min-h-[460px] lg:min-h-[560px]">
              <button type="button" aria-label="Ampliar imagen del producto" disabled={!current} onClick={() => setZoom(true)} className="absolute inset-0 h-full w-full cursor-zoom-in disabled:cursor-default">
                {product.requiereReceta && <span className="absolute left-4 top-4 z-[3] inline-flex items-center gap-1 rounded-full bg-[#1c2a3f] px-3 py-1.5 text-[0.74rem] font-bold text-white"><BadgeAlert className="size-3.5" />Requiere receta</span>}
                <div className="absolute inset-0 mx-auto w-full max-w-[760px]"><OfflineImage key={current ?? "empty"} urls={current ? [current] : []} name={product.nombre} /></div>
              </button></div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-[#5b6f79]">
              <span>{urls.length > 1 ? `${selected + 1} de ${urls.length} imágenes` : "Imagen del producto"}</span><span className="truncate">Modelo: {product.modelo}</span>
            </div>
          </div>
        </div>
      </section>
      <section className="grid content-start gap-5">
        <div className="grid gap-3">
          <div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-[#eaf4f3] px-3 py-1 text-xs font-semibold text-[#1f6a67]">{product.clasificacion}</span><span className="rounded-full bg-[#eef3f4] px-3 py-1 text-xs font-semibold text-[#60727a]">{type}</span></div>
          <div><h1 className="text-[2rem] leading-tight font-semibold text-[#111f36] sm:text-[2.35rem]">{product.nombre}</h1><div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-[#536774]"><span>Marca: <strong className="text-[#1b3141]">{product.marca}</strong></span></div></div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-[#e2eaec] bg-[#f8fbfb] p-4"><div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 size-5 text-[#1f6a67]" /><div><p className="text-sm font-semibold text-[#172f3e]">Garantía CEMYDI</p><p className="mt-1 text-sm leading-6 text-[#5a707a]">Cobertura estándar de 3 meses sobre defectos de fabricación.</p></div></div></div>
          <div className="rounded-2xl border border-[#e2eaec] bg-[#f8fbfb] p-4"><div className="flex items-start gap-3"><Truck className="mt-0.5 size-5 text-[#1f6a67]" /><div><p className="text-sm font-semibold text-[#172f3e]">Disponibilidad</p><p className="mt-1 text-sm leading-6 text-[#5a707a]">Consultar al reconectar</p></div></div></div>
        </div>
        <div className="grid gap-3 border-y border-[#e3ebee] py-5 sm:grid-cols-2">
          {[['Modelo', product.modelo], ['Tipo de adquisición', type], ['Clasificación', product.clasificacion]].map(([label, value]) => <div key={label}><p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#80929b]">{label}</p><p className="mt-1 text-[0.98rem] font-medium text-[#1b3141]">{value}</p></div>)}
        </div>
        {product.requiereReceta && <details className="rounded-2xl border border-[#dce5e8] bg-[#f8fbfc] px-4 py-3"><summary className="cursor-pointer text-sm font-semibold text-[#203744]">Qué necesito para este producto</summary><p className="mt-2.5 text-sm leading-6 text-[#4a606b]">Debes presentar receta médica vigente y una identificación oficial. El equipo de CEMYDI valida el documento antes de confirmar la compra o la renta.</p></details>}
      </section>
      <aside className="grid content-start gap-4 xl:sticky xl:top-24 xl:self-start">
        <div className="rounded-2xl border border-[#dbe4e6] bg-white p-5 shadow-[0_18px_38px_rgba(15,61,59,0.08)]">
          <p className="rounded-xl border border-[#e1e9eb] bg-[#f8fbfb] p-3.5 font-semibold text-[#1f6a67]">{OFFLINE_COMMERCE_MESSAGE}</p>
          <p className="mt-3 text-sm leading-6 text-[#5a707a]">Las compras y rentas requieren conexión.</p>
          <button type="button" onClick={() => navigator.onLine ? location.reload() : toast.error("Necesitas conexión a Internet para actualizar esta ficha.", { id: "pwa-product-refresh" })} className="mt-5 w-full cursor-pointer rounded-[14px] bg-[#1f6a67] px-[18px] py-[13px] text-base font-bold text-white">Actualizar ficha</button>
          <div className="mt-5 grid gap-3 border-t border-[#e8eef0] pt-4"><div className="flex items-start gap-3 text-sm text-[#455b67]"><Store className="mt-0.5 size-4 shrink-0 text-[#1f6a67]" /><span>Atención y seguimiento desde CEMYDI.</span></div><p className="text-sm text-[#5a707a]">Actualizado: {new Date(product.detail?.updatedAt ?? product.updatedAt).toLocaleString("es-MX")}</p></div>
        </div>
      </aside>
    </div>
    <ProductDescription product={{ descripcion: product.descripcion, medidas: product.detail?.medidas, pesoSoportado: product.detail?.pesoSoportado, material: product.detail?.material, contenidoCaja: product.detail?.contenidoCaja, indicacionesUso: product.detail?.indicacionesUso }} />
    <Dialog open={zoom} onOpenChange={setZoom}><DialogContent className="max-w-[min(96vw,1100px)]"><DialogTitle>{product.nombre}</DialogTitle><DialogDescription className="sr-only">Imagen guardada del producto ampliada.</DialogDescription><div className="h-[65vh]"><OfflineImage urls={current ? [current] : []} name={product.nombre} /></div></DialogContent></Dialog>
  </ProductDetailLayout>;
}

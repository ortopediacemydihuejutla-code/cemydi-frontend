import type { ReactNode } from "react";
import Link from "next/link";
import { ClipboardList, Layers3, ListChecks, Ruler, Weight } from "lucide-react";
import type { CatalogProduct } from "@/services/catalog";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/features/admin/components/ui/breadcrumb";

export const PRODUCT_DETAIL_COLUMNS = "grid gap-8 xl:grid-cols-[minmax(0,1.12fr)_minmax(0,0.9fr)_360px]";

export function ProductDetailLayout({ name, children }: { name: string; children: ReactNode }) {
  return <section className="mx-auto max-w-[1440px] px-4 pb-11 pt-6 lg:px-6">
    <div className="mb-5 border-b border-[#e3ebee] pb-4">
      <Breadcrumb><BreadcrumbList className="gap-y-2 text-[0.92rem]">
        <BreadcrumbItem><BreadcrumbLink asChild className="font-medium text-[#5e707a] hover:text-[#1f6a67]"><Link href="/">Inicio</Link></BreadcrumbLink></BreadcrumbItem>
        <BreadcrumbSeparator className="text-[#93a4ac]" />
        <BreadcrumbItem><BreadcrumbLink asChild className="font-medium text-[#5e707a] hover:text-[#1f6a67]"><Link href="/catalogo">Catálogo</Link></BreadcrumbLink></BreadcrumbItem>
        <BreadcrumbSeparator className="text-[#93a4ac]" />
        <BreadcrumbItem><BreadcrumbPage className="max-w-[min(70vw,620px)] truncate font-semibold text-[#142734]">{name}</BreadcrumbPage></BreadcrumbItem>
      </BreadcrumbList></Breadcrumb>
    </div>
    {children}
  </section>;
}

type PublicDescription = Pick<CatalogProduct, "descripcion" | "medidas" | "pesoSoportado" | "material" | "contenidoCaja" | "indicacionesUso">;

export function ProductDescription({ product }: { product: PublicDescription }) {
  const details = [
    { label: "Medidas", value: product.medidas, icon: Ruler },
    { label: "Peso soportado", value: product.pesoSoportado, icon: Weight },
    { label: "Material", value: product.material, icon: Layers3 },
    { label: "Contenido", value: product.contenidoCaja, icon: ClipboardList },
    { label: "Indicaciones", value: product.indicacionesUso, icon: ListChecks },
  ].filter((item) => item.value?.trim());
  return <section className="mt-9 border-t border-[#e3ebee] py-8 xl:mr-[388px]">
    <div className="grid gap-8">
      <h2 className="text-[1.65rem] font-semibold text-[#142734]">Descripción</h2>
      <p className="max-w-[1040px] whitespace-pre-line text-[1.04rem] leading-9 text-[#2d4d5b]">{product.descripcion}</p>
    </div>
    {details.length > 0 && <div className="mt-9 grid max-w-[1040px] gap-4 border-t border-[#e6eef1] pt-7">
      <h2 className="text-[1.4rem] font-semibold text-[#142734]">Ficha ortopédica</h2>
      <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
        {details.map(({ label, value, icon: Icon }) => <div key={label} className="grid grid-cols-[auto_minmax(0,1fr)] gap-3">
          <Icon className="mt-1 size-5 text-[#1f6a67]" aria-hidden />
          <div><dt className="text-xs font-semibold uppercase tracking-[0.08em] text-[#80929b]">{label}</dt><dd className="mt-1 whitespace-pre-line text-[0.98rem] leading-6 text-[#1b3141]">{value}</dd></div>
        </div>)}
      </dl>
    </div>}
  </section>;
}

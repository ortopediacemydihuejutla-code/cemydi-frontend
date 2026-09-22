import Link from "next/link";
import {
  Accessibility,
  ArrowRight,
  Bed,
  CalendarDays,
  HeartHandshake,
  HeartPulse,
  ShieldCheck,
} from "lucide-react";

type CategoryItem = {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
  badge?: string;
};

const CATEGORIES: CategoryItem[] = [
  {
    title: "Movilidad Asistida",
    description: "Sillas de ruedas estándar y plegables, andaderas ortopédicas, muletas y bastones.",
    href: "/catalogo?clasificaciones=Movilidad",
    icon: Accessibility,
  },
  {
    title: "Órtesis y Soportes",
    description: "Férulas, fajas lumbares, muñequeras, rodilleras y soportes articulares especializados.",
    href: "/catalogo?clasificaciones=Ortesis",
    icon: ShieldCheck,
  },
  {
    title: "Equipo Hospitalario",
    description: "Camas clínicas manuales y eléctricas, colchones de presión alterna y aspiradores.",
    href: "/catalogo?clasificaciones=Equipo+Medico",
    icon: Bed,
  },
  {
    title: "Rehabilitación y Fisioterapia",
    description: "Aparatos de ejercicio pasivo, bandas elásticas, electrodos y compresas terapéuticas.",
    href: "/catalogo?clasificaciones=Rehabilitacion",
    icon: HeartPulse,
  },
  {
    title: "Cuidado del Paciente",
    description: "Sillas para baño, cojines antiescaras, elevadores de inodoro y accesorios para el aseo.",
    href: "/catalogo?clasificaciones=Cuidado+del+Paciente",
    icon: HeartHandshake,
  },
  {
    title: "Equipos en Renta",
    description: "Renta de camas hospitalarias, concentradores y sillas con plazos flexibles por semana o mes.",
    href: "/catalogo?tipos=RENTA",
    icon: CalendarDays,
    badge: "Servicio estrella",
  },
];

export function HomeCategories() {
  return (
    <section
      aria-labelledby="categories-heading"
      className="border-t border-[#deebeb] bg-white py-16 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <h2
              id="categories-heading"
              className="text-2xl font-bold tracking-tight text-[#111827] sm:text-3xl lg:text-4xl"
            >
              Explora nuestro catálogo por categoría
            </h2>
            <p className="mt-3 text-sm text-[#4b5563] sm:text-base">
              Disponemos de equipo médico especializado, insumos para convalecencia y aparatología ortopédica certificada.
            </p>
          </div>

          <Link
            href="/catalogo"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#258e8b] no-underline hover:text-[#1d7370] focus-visible:outline-2 focus-visible:outline-[#258e8b]"
          >
            Ver todo el catálogo
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.title}
                href={category.href}
                className="group relative flex flex-col justify-between rounded-xl border border-[#deebeb] bg-[#f8fafc] p-6 no-underline shadow-sm transition-all hover:border-[#258e8b] hover:bg-white hover:shadow-md focus-visible:outline-2 focus-visible:outline-[#258e8b]"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex size-12 items-center justify-center rounded-lg bg-[#e8f2f2] text-[#258e8b] transition-colors group-hover:bg-[#258e8b] group-hover:text-white">
                      <Icon className="size-6" aria-hidden="true" />
                    </div>

                    {category.badge ? (
                      <span className="rounded-full border border-[#c4dede] bg-[#e8f2f2] px-2.5 py-0.5 text-xs font-semibold text-[#1d7370]">
                        {category.badge}
                      </span>
                    ) : null}
                  </div>

                  <h3 className="mt-4 text-lg font-bold text-[#111827] group-hover:text-[#258e8b]">
                    {category.title}
                  </h3>

                  <p className="mt-2 text-sm text-[#4b5563] leading-relaxed">
                    {category.description}
                  </p>
                </div>

                <div className="mt-6 flex items-center gap-1 text-sm font-bold text-[#258e8b] group-hover:text-[#1d7370]">
                  <span>Explorar categoría</span>
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

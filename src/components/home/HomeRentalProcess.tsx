import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

const STEPS = [
  {
    step: "01",
    title: "Selecciona el equipo",
    description:
      "Explora nuestro catálogo de renta: camas hospitalarias, sillas de ruedas, concentradores y soportes de movilidad.",
  },
  {
    step: "02",
    title: "Define tu plazo",
    description:
      "Elige el tiempo de uso que requieras con tarifas diarias y mensuales claras, sin plazos forzosos.",
  },
  {
    step: "03",
    title: "Recepción e inducción",
    description:
      "Entregamos el equipo revisado, higienizado y te explicamos su manejo adecuado para seguridad del paciente.",
  },
  {
    step: "04",
    title: "Renovación o recolección",
    description:
      "Si la recuperación requiere más tiempo, puedes extender tu periodo fácilmente o agendar la devolución.",
  },
];

export function HomeRentalProcess() {
  return (
    <section
      id="renta-medica"
      aria-labelledby="rental-process-heading"
      className="border-t border-[#deebeb] bg-white py-16 text-[#111827] sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#c4dede] bg-[#e8f2f2] px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-[#1d7370]">
            Proceso de Renta Sencillo
          </div>
          <h2
            id="rental-process-heading"
            className="mt-4 text-2xl font-bold tracking-tight text-[#111827] sm:text-3xl lg:text-4xl"
          >
            Cómo funciona el servicio de renta médica
          </h2>
          <p className="mt-3 text-sm text-[#4b5563] sm:text-base leading-relaxed">
            Diseñado para que obtengas el equipamiento necesario de manera rápida y sin complicaciones burocráticas.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((item) => (
            <div
              key={item.step}
              className="flex flex-col justify-between rounded-xl border border-[#deebeb] bg-[#f8fafc] p-6 shadow-sm transition-colors hover:border-[#258e8b]"
            >
              <div>
                <span className="font-mono text-xs font-bold text-[#258e8b]">
                  PASO {item.step}
                </span>
                <h3 className="mt-3 text-lg font-bold text-[#111827]">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-[#4b5563] leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-[#1d7370]">
                <Check className="size-4 shrink-0 text-[#258e8b]" aria-hidden="true" />
                <span>Garantía de servicio</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/catalogo?tipos=RENTA"
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-[#258e8b] px-7 py-3 text-sm font-bold text-white no-underline shadow-sm transition-colors hover:bg-[#1d7370] focus-visible:outline-2 focus-visible:outline-[#258e8b]"
          >
            Ver catálogo de renta
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>

          <Link
            href="/contactanos"
            className="inline-flex min-h-[44px] items-center justify-center rounded-full border-2 border-[#258e8b] bg-white px-7 py-3 text-sm font-bold text-[#258e8b] no-underline transition-colors hover:bg-[#e8f2f2] focus-visible:outline-2 focus-visible:outline-[#258e8b]"
          >
            Cotizar por WhatsApp o teléfono
          </Link>
        </div>
      </div>
    </section>
  );
}

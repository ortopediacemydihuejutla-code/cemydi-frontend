import Link from "next/link";
import { BadgePercent, ClipboardList, Mic2, Sparkles, Volume2 } from "lucide-react";

const alexaSearchUrl =
  "https://www.amazon.com.mx/s?k=rentas+cemydi&i=alexa-skills";

const benefits = [
  { label: "Requisitos de renta", icon: ClipboardList },
  { label: "Costos aproximados", icon: BadgePercent },
  { label: "Promociones vigentes", icon: Sparkles },
];

export function AlexaSkillPromo() {
  return (
    <section
      className="border-y border-[#dcebed] bg-white py-12 sm:py-16"
      aria-labelledby="alexa-skill-title"
    >
      <div className="mx-auto w-full max-w-[80rem] px-4 sm:px-6 lg:px-8">
        <div className="grid overflow-hidden rounded-2xl border border-[#d1e4e6] bg-[#f7fbfb] shadow-[0_10px_30px_rgba(19,78,74,0.06)] lg:grid-cols-[1.08fr_0.92fr]">
          <div className="relative p-6 sm:p-8 lg:p-10">
            <p className="mb-3 text-xs font-bold tracking-[0.2em] text-[#2f6470] uppercase">
              Asistente por voz
            </p>
            <h2
              id="alexa-skill-title"
              className="m-0 text-[clamp(1.75rem,4vw,2.45rem)] font-bold tracking-tight text-[#0f2a32]"
            >
              Renta CEMYDI en Alexa
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#4a6670] sm:text-[1.05rem]">
              Consulta por voz requisitos, costos aproximados, promociones y disponibilidad de
              productos ortopédicos en renta.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {benefits.map(({ label, icon: Icon }) => (
                <span
                  key={label}
                  className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[#d7e8ea] bg-white px-4 text-sm font-semibold text-[#194d55]"
                >
                  <Icon className="size-4 text-[#1f7a78]" aria-hidden="true" />
                  {label}
                </span>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href={alexaSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#134e4a] px-7 py-3.5 text-sm font-bold text-white no-underline transition hover:-translate-y-px hover:bg-[#0f3d3a]"
              >
                <Volume2 className="size-4" aria-hidden="true" />
                Abrir en Alexa
              </Link>
              <Link
                href="/catalogo"
                className="inline-flex items-center justify-center rounded-full border-2 border-[#134e4a] bg-white px-7 py-3.5 text-sm font-bold text-[#134e4a] no-underline transition hover:bg-[#134e4a] hover:text-white"
              >
                Ver catálogo de renta
              </Link>
            </div>
          </div>

          <div className="flex min-h-[16.25rem] items-center justify-center border-t border-[#d1e4e6] bg-[#e8f2f2] p-6 text-[#123f3d] sm:p-8 lg:border-t-0 lg:border-l lg:p-10">
            <div className="grid w-full max-w-[28rem] gap-5">
              <div className="flex items-start gap-4">
                <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-[#134e4a] text-white shadow-[0_12px_28px_rgba(19,78,74,0.18)]">
                  <Mic2 className="size-7" aria-hidden="true" />
                </span>
                <div>
                  <p className="m-0 text-xs font-bold tracking-[0.18em] text-[#5b757d] uppercase">
                    Comando
                  </p>
                  <p className="m-0 mt-1 text-2xl font-extrabold leading-tight text-[#0f2a32]">
                    Di: &quot;Alexa, abre rentas cemydi&quot;
                  </p>
                </div>
              </div>
              <p className="m-0 border-t border-[#c8dddf] pt-5 text-sm leading-relaxed text-[#4a6670]">
                Para confirmar disponibilidad o iniciar una solicitud, comunícate directamente con
                CEMYDI.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

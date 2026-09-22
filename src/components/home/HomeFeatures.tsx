import { Clock, MapPin, ShieldCheck, Stethoscope } from "lucide-react";

const FEATURES = [
  {
    title: "Asesoría Clínica Personalizada",
    description:
      "Te apoyamos para interpretar recetas y seleccionar la talla, medida o especificación técnica adecuada para el paciente.",
    icon: Stethoscope,
  },
  {
    title: "Equipos Sanitizados y Verificados",
    description:
      "Cada unidad pasa por un riguroso protocolo de inspección mecánica y desinfección antes de ser entregada a tu domicilio.",
    icon: ShieldCheck,
  },
  {
    title: "Renta Flexible Sin Plazos Forzosos",
    description:
      "Alquila camas, sillas o concentradores por el tiempo que dure la convalecencia, con opciones sencillas de extensión.",
    icon: Clock,
  },
  {
    title: "Atención y Entrega Local en Huejutla",
    description:
      "Compromiso directo en la región huasteca con tiempos de respuesta ágiles e instrucciones de operación al recibir tu equipo.",
    icon: MapPin,
  },
];

export function HomeFeatures() {
  return (
    <section
      aria-labelledby="features-heading"
      className="border-t border-[#deebeb] bg-white py-16 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#c4dede] bg-[#e8f2f2] px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-[#1d7370]">
            Confianza y profesionalismo
          </div>
          <h2
            id="features-heading"
            className="mt-3 text-2xl font-bold tracking-tight text-[#111827] sm:text-3xl lg:text-4xl"
          >
            Por qué confiar en Ortopedia CEMYDI
          </h2>
          <p className="mt-3 text-sm text-[#4b5563] sm:text-base leading-relaxed">
            Ofrecemos respaldo integral a familias, médicos e instituciones con soluciones
            ortopédicas seguras y de grado clínico.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="flex flex-col items-start rounded-xl border border-[#deebeb] bg-[#f8fafc] p-6 transition-colors hover:border-[#258e8b]"
              >
                <div className="flex size-12 items-center justify-center rounded-lg bg-[#e8f2f2] text-[#258e8b]">
                  <Icon className="size-6" aria-hidden="true" />
                </div>
                <h3 className="mt-5 text-base font-bold text-[#111827]">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-[#4b5563] leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

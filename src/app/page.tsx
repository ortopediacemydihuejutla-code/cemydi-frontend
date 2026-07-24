import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { AlexaSkillPromo } from "@/components/home/alexa-skill-promo";
import { PromotionsShowcase } from "@/components/home/promotions-showcase";
import TestimonialsSection from "@/components/ui/testimonial-v2";
import { ActivePromotion, getActivePromotions } from "@/services/catalog";
import { HomeTestimonial, getHomeTestimonials } from "@/services/reviews";

export const metadata: Metadata = {
  title: "Inicio",
  description:
    "Ortopedia CEMYDI: equipos médicos, ortesis, movilidad y rehabilitación. Calidad certificada con asesoría de expertos en México.",
  openGraph: {
    title: "Ortopedia CEMYDI — Tu bienestar es nuestra prioridad",
    description:
      "Equipos médicos, ortesis y suministros de alta calidad. Explora el catálogo y crea tu cuenta.",
  },
};

async function loadPromotions() {
  try {
    const result = await getActivePromotions();
    return result.promotions;
  } catch {
    return [] as ActivePromotion[];
  }
}

async function loadTestimonials() {
  try {
    const result = await getHomeTestimonials();
    return result.testimonials;
  } catch {
    return [] as HomeTestimonial[];
  }
}

export default async function HomePage() {
  const [promotions, testimonials] = await Promise.all([
    loadPromotions(),
    loadTestimonials(),
  ]);

  return (
    <>
      <section className="relative flex min-h-[calc(100svh-3.75rem)] items-center overflow-hidden text-white lg:min-h-[calc(100svh-5rem)]">
        <Image
          src="/rehabilitacion.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(15,61,59,.95),rgba(30,98,96,.78),rgba(30,98,96,.25))]" />
        <div className="relative z-[1] mx-auto w-full max-w-[80rem] px-4 sm:px-6 lg:px-8">
          <div className="max-w-[43.75rem]">
            <span className="mb-6 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[1px]">
              Calidad médica certificada
            </span>

            <h1 className="m-0 text-[clamp(2rem,6vw,4.2rem)] leading-[1.05]">
              Tu bienestar es nuestra prioridad
            </h1>

            <p className="mt-4 mb-7 text-[clamp(1rem,1.8vw,1.2rem)] text-[#dcfce7]">
              Encuentra equipos, ortesis y suministros médicos de alta calidad con garantías seguras
              y asesoría de expertos.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/catalogo"
                className="rounded-full bg-white px-6 py-3.5 font-bold text-[#134e4a] no-underline transition hover:-translate-y-px"
              >
                Explorar catálogo
              </Link>
              <Link
                href="/register"
                className="rounded-full border border-white/40 bg-white/8 px-6 py-3.5 font-bold text-white no-underline transition hover:bg-white/14"
              >
                Crear cuenta
              </Link>
            </div>
          </div>
        </div>
      </section>

      <AlexaSkillPromo />
      <PromotionsShowcase promotions={promotions} />
      <TestimonialsSection testimonials={testimonials} />
    </>
  );
}

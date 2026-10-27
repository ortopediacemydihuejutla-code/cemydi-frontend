import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthRouteLoading } from "@/components/auth/auth-route-loading";

import { HomeCategories } from "@/components/home/HomeCategories";
import { HomeFeatures } from "@/components/home/HomeFeatures";
import { HomeHero } from "@/components/home/HomeHero";
import { HomeRentalProcess } from "@/components/home/HomeRentalProcess";
import { PromotionsShowcase } from "@/components/home/promotions-showcase";
import TestimonialsSection from "@/components/ui/testimonial-v2";
import { ActivePromotion, getActivePromotions } from "@/services/catalog";
import { HomeTestimonial, getHomeTestimonials } from "@/services/reviews";
import OfflineBoundary from "@/components/pwa/OfflineBoundary";

export const metadata: Metadata = {
  title: "Inicio",
  description:
    "Ortopedia CEMYDI: venta y renta de equipo médico, camas hospitalarias, sillas de ruedas, ortesis y rehabilitación con calidad certificada y asesoría en Huejutla.",
  openGraph: {
    title: "Ortopedia CEMYDI — Equipamiento ortopédico y médico para tu recuperación",
    description:
      "Venta y renta de equipo médico de alta calidad con garantías seguras y asesoría de expertos.",
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

export default function HomePage() {
  return (
    <Suspense fallback={<AuthRouteLoading title="Cargando CEMYDI" description="Preparando el contenido..." />}>
      <HomeContent />
    </Suspense>
  );
}

async function HomeContent() {
  const [promotions, testimonials] = await Promise.all([
    loadPromotions(),
    loadTestimonials(),
  ]);

  return (
    <OfflineBoundary>
      <HomeHero />
      <HomeCategories />
      <PromotionsShowcase promotions={promotions} />
      <HomeRentalProcess />
      <HomeFeatures />
      <TestimonialsSection testimonials={testimonials} />
    </OfflineBoundary>
  );
}

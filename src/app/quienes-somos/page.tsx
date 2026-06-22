import type { Metadata } from "next";
import { AboutPageClient } from "./AboutPageClient";
import { getAboutPageContent } from "@/services/about-page";

export const metadata: Metadata = {
  title: "Quiénes somos",
  description:
    "Conoce la misión, visión y valores de Ortopedia CEMYDI en Huejutla de Reyes.",
  openGraph: {
    title: "Quiénes somos | Ortopedia CEMYDI",
    description:
      "Misión, visión y valores de Ortopedia CEMYDI: soluciones de movilidad, rehabilitación y cuidado en casa.",
  },
};

export default async function AboutPage() {
  const content = await getAboutPageContent();

  return <AboutPageClient content={content} />;
}

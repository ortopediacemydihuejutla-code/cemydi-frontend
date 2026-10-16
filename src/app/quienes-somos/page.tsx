import type { Metadata } from "next";
import { AboutPageClient } from "./AboutPageClient";
import { getAboutPageSnapshot } from "@/services/about-page";
import OfflineBoundary from "@/components/pwa/OfflineBoundary";

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
  const { content, valid, unavailable } = await getAboutPageSnapshot();

  return <OfflineBoundary unavailable={unavailable} preserveState>{!valid && <p className="p-4 text-sm">Contenido institucional predeterminado.</p>}<AboutPageClient content={content} persist={valid} /></OfflineBoundary>;
}

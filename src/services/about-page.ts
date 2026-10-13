import { publicFetch } from "@/lib/api/public-fetch";
import { parseApiResponse } from "@/lib/api-error";
import { aboutPageResponseSchema } from "@/lib/schemas/about-page";
import { canUseOfflineFallback } from "@/lib/pwa/errors";

export type AboutPageContent = {
  id: number;
  heroTitle: string;
  heroSubtitle: string;
  missionTitle: string;
  missionText: string;
  visionTitle: string;
  visionText: string;
  valuesTitle: string;
  values: string[];
  storyTitle: string;
  storyText: string;
  heroImageUrl: string | null;
  secondaryImageUrl: string | null;
  updatedAt?: string;
  createdAt?: string;
};

export const defaultAboutPageContent: AboutPageContent = {
  id: 1,
  heroTitle: "Quiénes somos",
  heroSubtitle:
    "Cuidamos tu movilidad con orientación cercana, productos confiables y acompañamiento humano en cada etapa.",
  missionTitle: "Misión",
  missionText:
    "Brindar soluciones ortopédicas, de rehabilitación y cuidado en casa con asesoría clara, productos de calidad y atención cercana para mejorar la movilidad y bienestar de cada persona.",
  visionTitle: "Visión",
  visionText:
    "Ser la ortopedia de referencia en la región por nuestra calidez, innovación y capacidad de acompañar a pacientes, familias e instituciones con soluciones oportunas.",
  valuesTitle: "Valores",
  values: ["Empatía", "Confianza", "Responsabilidad", "Servicio", "Calidad"],
  storyTitle: "Atención pensada para personas reales",
  storyText:
    "En CEMYDI reunimos experiencia, disponibilidad y orientación para que elegir un equipo ortopédico sea más sencillo. Escuchamos tu necesidad, resolvemos dudas y buscamos la alternativa adecuada para compra, renta o seguimiento.",
  heroImageUrl: "/img_Contactanos.png",
  secondaryImageUrl: "/fondowan.png",
};

type AboutPageResponse = {
  aboutPage: AboutPageContent | null;
};

export async function getAboutPageContent(): Promise<AboutPageContent> {
  return (await getAboutPageSnapshot()).content;
}

export async function getAboutPageSnapshot(): Promise<{ content: AboutPageContent; valid: boolean; unavailable: boolean }> {
  try {
    const response = await publicFetch("/about-page", {
      next: { revalidate: 60 },
    });

    const data = await parseApiResponse<AboutPageResponse>(
      response,
      "No se pudo cargar Quiénes somos",
      aboutPageResponseSchema,
    );

    return { content: data.aboutPage ?? defaultAboutPageContent, valid: Boolean(data.aboutPage), unavailable: false };
  } catch (error) {
    return { content: defaultAboutPageContent, valid: false, unavailable: canUseOfflineFallback(error) };
  }
}

import type { Metadata } from "next";
import ContactContent from "./ContactContent";
export const metadata: Metadata = {
  title: "Contáctanos",
  description:
    "Contacta a Ortopedia CEMYDI por teléfono, correo o visitando nuestras ubicaciones en Huejutla de Reyes.",
  openGraph: {
    title: "Contáctanos | Ortopedia CEMYDI",
    description:
      "Formulario de contacto, teléfonos, correo y ubicaciones de Ortopedia CEMYDI.",
  },
};


export default function ContactPage() { return <ContactContent />; }

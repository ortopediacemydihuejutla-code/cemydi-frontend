import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    lang: "es-MX",
    name: "Ortopedia CEMYDI",
    short_name: "CEMYDI",
    description:
      "Equipos médicos, movilidad y rehabilitación para venta y renta en México.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f8fbfb",
    theme_color: "#258e8b",
    icons: [
      { src: "/icon-maskable-192.png?v=2", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icon-maskable-512.png?v=2", sizes: "512x512", type: "image/png", purpose: "maskable" },
      {
        src: "/icon-192.png?v=2",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png?v=2",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
    screenshots: [
      { src: "/pwa/inicio-wide.png", sizes: "1440x900", type: "image/png", form_factor: "wide", label: "Inicio de Ortopedia CEMYDI en escritorio" },
      { src: "/pwa/inicio-narrow.png", sizes: "390x844", type: "image/png", form_factor: "narrow", label: "Inicio de Ortopedia CEMYDI en móvil" },
    ],
    shortcuts: [
      { name: "Catálogo", url: "/catalogo", icons: [{ src: "/icon-96.png", sizes: "96x96", type: "image/png" }] },
      { name: "Quiénes somos", url: "/quienes-somos", icons: [{ src: "/icon-96.png", sizes: "96x96", type: "image/png" }] },
      { name: "Contáctanos", url: "/contactanos", icons: [{ src: "/icon-96.png", sizes: "96x96", type: "image/png" }] },
    ],
  };
}

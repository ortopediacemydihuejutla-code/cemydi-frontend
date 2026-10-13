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
      { src: "/icon-maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
    shortcuts: [
      { name: "Catálogo", url: "/catalogo" },
      { name: "Quiénes somos", url: "/quienes-somos" },
      { name: "Contáctanos", url: "/contactanos" },
    ],
  };
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Catálogo de productos",
  description:
    "Explora el catálogo de Ortopedia CEMYDI: equipos médicos, movilidad, rehabilitación y soporte. Filtra por clasificación, tipo de adquisición y más.",
  openGraph: {
    title: "Catálogo de productos | Ortopedia CEMYDI",
    description:
      "Explora equipos médicos, movilidad y rehabilitación. Productos para venta y renta.",
  },
};

export default function CatalogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

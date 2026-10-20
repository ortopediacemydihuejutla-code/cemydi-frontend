import type { Metadata } from "next";
import { LegalDocumentPage } from "@/components/legal/LegalDocumentPage";
import { getLegalDocumentSnapshot } from "@/services/legal-documents";
import OfflineBoundary from "@/components/pwa/OfflineBoundary";
import LegalPersistence from "@/components/pwa/LegalPersistence";

export const metadata: Metadata = {
  title: "Términos y condiciones",
  description: "Consulta los términos y condiciones de uso y servicio de Ortopedia CEMYDI.",
};

export default async function TermsPage() {
  const { document, valid, unavailable } = await getLegalDocumentSnapshot("terminos-y-condiciones");
  return <OfflineBoundary unavailable={unavailable}>
    {valid && <LegalPersistence document={document} />}
    <LegalDocumentPage document={document} />
  </OfflineBoundary>;
}

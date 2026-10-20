import type { Metadata } from "next";
import { LegalDocumentPage } from "@/components/legal/LegalDocumentPage";
import { getLegalDocumentSnapshot } from "@/services/legal-documents";
import OfflineBoundary from "@/components/pwa/OfflineBoundary";
import LegalPersistence from "@/components/pwa/LegalPersistence";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description: "Consulta la política de privacidad y protección de datos de Ortopedia CEMYDI.",
};

export default async function PrivacyPolicyPage() {
  const { document, valid, unavailable } = await getLegalDocumentSnapshot("politicas-de-privacidad");
  return <OfflineBoundary unavailable={unavailable}>
    {valid && <LegalPersistence document={document} />}
    <LegalDocumentPage document={document} />
  </OfflineBoundary>;
}

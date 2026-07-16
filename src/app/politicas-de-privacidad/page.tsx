import type { Metadata } from "next";
import { LegalDocumentPage } from "@/components/legal/LegalDocumentPage";
import { getLegalDocument } from "@/services/legal-documents";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description: "Consulta la política de privacidad y protección de datos de Ortopedia CEMYDI.",
};

export default async function PrivacyPolicyPage() {
  const document = await getLegalDocument("politicas-de-privacidad");
  return <LegalDocumentPage document={document} />;
}

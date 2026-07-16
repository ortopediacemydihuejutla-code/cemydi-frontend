import type { Metadata } from "next";
import { LegalDocumentPage } from "@/components/legal/LegalDocumentPage";
import { getLegalDocument } from "@/services/legal-documents";

export const metadata: Metadata = {
  title: "Términos y condiciones",
  description: "Consulta los términos y condiciones de uso y servicio de Ortopedia CEMYDI.",
};

export default async function TermsPage() {
  const document = await getLegalDocument("terminos-y-condiciones");
  return <LegalDocumentPage document={document} />;
}

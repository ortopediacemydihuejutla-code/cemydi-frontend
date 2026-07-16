import type {
  LegalDocument,
  LegalDocumentSlug,
} from "@/services/legal-documents";
import { adminRequest } from "./request";

export type UpdateLegalDocumentPayload = Pick<
  LegalDocument,
  "title" | "description" | "fields" | "customSections"
>;

export async function getAdminLegalDocument(slug: LegalDocumentSlug) {
  return adminRequest<{ document: LegalDocument }>(`/legal-documents/${slug}`);
}

export async function updateAdminLegalDocument(
  slug: LegalDocumentSlug,
  payload: UpdateLegalDocumentPayload,
) {
  return adminRequest<{ message: string; document: LegalDocument }>(
    `/legal-documents/${slug}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

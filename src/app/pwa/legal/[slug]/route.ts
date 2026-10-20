import { legalDocumentSchema } from "@/lib/schemas/legal-document";
import { getLegalDocumentSnapshot } from "@/services/legal-documents";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const parsed = legalDocumentSchema.shape.slug.safeParse((await params).slug);
  if (!parsed.success) return Response.json({ message: "Documento no encontrado" }, { status: 404 });
  const snapshot = await getLegalDocumentSnapshot(parsed.data, true);
  // Only validated public content may become an installation essential.
  if (!snapshot.valid) return Response.json({ message: "Documento temporalmente no disponible" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  return Response.json(snapshot.document, { headers: { "Cache-Control": "no-store" } });
}

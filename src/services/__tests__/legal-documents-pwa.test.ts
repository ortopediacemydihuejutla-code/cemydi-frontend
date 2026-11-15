import { afterEach, describe, expect, it, vi } from "vitest";
import { defaultLegalDocuments, getLegalDocumentSnapshot, legalDocumentSlugs } from "../legal-documents";
import { publicFetch } from "@/lib/api/public-fetch";

vi.mock("@/lib/api/public-fetch", () => ({ publicFetch: vi.fn() }));
afterEach(() => vi.clearAllMocks());

describe("documentos legales sin conexión", () => {
  it.each(legalDocumentSlugs)("permite persistir el documento público validado %s", async (slug) => {
    const document = { ...defaultLegalDocuments[slug], title: "Versión publicada" };
    vi.mocked(publicFetch).mockResolvedValue(new Response(JSON.stringify({ document })));
    expect(await getLegalDocumentSnapshot(slug)).toEqual({ document, valid: true, unavailable: false });
  });
  it.each([401, 403, 404, 503])("un HTTP %i no renueva el documento guardado", async (status) => {
    vi.mocked(publicFetch).mockResolvedValue(new Response("{}", { status }));
    expect(await getLegalDocumentSnapshot("terminos-y-condiciones")).toEqual({
      document: defaultLegalDocuments["terminos-y-condiciones"], valid: false, unavailable: status >= 500,
    });
  });
  it.each([null, {}, { ...defaultLegalDocuments["politicas-de-privacidad"] }])("no guarda contenido ausente, incompatible o de otra ruta", async (document) => {
    vi.mocked(publicFetch).mockResolvedValue(new Response(JSON.stringify({ document })));
    expect((await getLegalDocumentSnapshot("terminos-y-condiciones")).valid).toBe(false);
  });
  it("muestra el aviso completo si la API devuelve un documento vacío", async () => {
    const slug = "politicas-de-privacidad";
    const document = { ...defaultLegalDocuments[slug], id: 1, description: "", fields: {}, sections: [] };
    vi.mocked(publicFetch).mockResolvedValue(Response.json({ document }));
    const snapshot = await getLegalDocumentSnapshot(slug);
    expect(snapshot.document).toEqual(defaultLegalDocuments[slug]);
    expect(snapshot.valid).toBe(false);
  });
  it("reemplaza los términos de demostración de una API anterior", async () => {
    const slug = "terminos-y-condiciones";
    const document = {
      ...defaultLegalDocuments[slug],
      description: "Contenido demostrativo para revisar la estructura visual de los términos y condiciones.",
      sections: [{ id: "aceptacion-alcance", title: "Alcance de ejemplo", body: "Texto de demostración" }],
    };
    vi.mocked(publicFetch).mockResolvedValue(Response.json({ document }));
    const snapshot = await getLegalDocumentSnapshot(slug);
    expect(snapshot.document).toEqual(defaultLegalDocuments[slug]);
    expect(snapshot.valid).toBe(false);
  });
  it("usa la copia offline ante un fallo de transporte", async () => {
    vi.mocked(publicFetch).mockRejectedValue(new TypeError("fetch failed"));
    expect(await getLegalDocumentSnapshot("terminos-y-condiciones")).toMatchObject({ valid: false, unavailable: true });
  });
});

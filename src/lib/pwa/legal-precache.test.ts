import { afterEach, describe, expect, it, vi } from "vitest";
import { legalPrecacheSlug, validateLegalPrecacheResponse, getPrecachedLegal } from "./legal-precache";
import { defaultLegalDocuments } from "@/services/legal-documents";

afterEach(() => vi.restoreAllMocks());
describe("precache legal", () => {
  it("acepta únicamente las dos rutas públicas explícitas", () => {
    expect(legalPrecacheSlug("/pwa/legal/terminos-y-condiciones")).toBe("terminos-y-condiciones");
    expect(legalPrecacheSlug("/pwa/legal/politicas-de-privacidad")).toBe("politicas-de-privacidad");
    for (const path of ["/api/users/me", "/pwa/legal/desconocido", "/pwa/legal/terminos-y-condiciones/extra"]) expect(legalPrecacheSlug(path)).toBeNull();
  });
  it("valida contenido, slug, tipo de respuesta y HTTP antes de completar la instalación", async () => {
    const slug = "terminos-y-condiciones";
    const valid = Response.json(defaultLegalDocuments[slug]);
    expect(await validateLegalPrecacheResponse(valid, slug)).toBe(true);
    expect(await valid.json()).toHaveProperty("slug", slug);
    expect(await validateLegalPrecacheResponse(Response.json(defaultLegalDocuments["politicas-de-privacidad"]), slug)).toBe(false);
    expect(await validateLegalPrecacheResponse(Response.json({}), slug)).toBe(false);
    expect(await validateLegalPrecacheResponse(Response.json({}, { status: 503 }), slug)).toBe(false);
    expect(await validateLegalPrecacheResponse(new Response("<html>Error</html>"), slug)).toBe(false);
  });
  it("sin un worker activo no descarga el documento al consultarlo", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    expect(await getPrecachedLegal("terminos-y-condiciones")).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});

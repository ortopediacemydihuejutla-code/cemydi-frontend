import { afterEach, describe, expect, it, vi } from "vitest";
import { getAboutPageSnapshot, defaultAboutPageContent } from "../about-page";
import { publicFetch } from "@/lib/api/public-fetch";
vi.mock("@/lib/api/public-fetch", () => ({ publicFetch: vi.fn() }));
afterEach(() => vi.clearAllMocks());
describe("actualización institucional offline", () => {
  it("identifica una respuesta pública válida para persistencia", async () => {
    vi.mocked(publicFetch).mockResolvedValue(new Response(JSON.stringify({ aboutPage: { ...defaultAboutPageContent, heroTitle: "Contenido actualizado" } }), { status: 200 }));
    const snapshot = await getAboutPageSnapshot();
    expect(snapshot.valid).toBe(true);
    expect(snapshot.content.heroTitle).toBe("Contenido actualizado");
  });
  it.each([503, 401, 404])("un HTTP %i no autoriza persistir ni renovar defaults", async (status) => {
    vi.mocked(publicFetch).mockResolvedValue(new Response('{"message":"error"}', { status }));
    expect(await getAboutPageSnapshot()).toEqual({ content: defaultAboutPageContent, valid: false, unavailable: status >= 500 });
  });
  it("rechaza contenido incompatible y contenido ausente", async () => {
    vi.mocked(publicFetch).mockResolvedValueOnce(new Response('{"aboutPage":{"heroTitle":"Incompleto"}}', { status: 200 }));
    expect((await getAboutPageSnapshot()).valid).toBe(false);
    vi.mocked(publicFetch).mockResolvedValueOnce(new Response('{"aboutPage":null}', { status: 200 }));
    expect((await getAboutPageSnapshot()).valid).toBe(false);
  });
});

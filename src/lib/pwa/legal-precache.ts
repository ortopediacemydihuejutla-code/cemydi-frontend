import { legalDocumentSchema } from "@/lib/schemas/legal-document";
import type { LegalDocumentSlug } from "@/services/legal-documents";

export const legalPrecachePath = (slug: LegalDocumentSlug) => `/pwa/legal/${slug}`;

export function legalPrecacheSlug(pathname: string) {
  const match = /^\/pwa\/legal\/([^/]+)$/.exec(pathname);
  const parsed = legalDocumentSchema.shape.slug.safeParse(match?.[1]);
  return parsed.success ? parsed.data : null;
}

export async function validateLegalPrecacheResponse(response: Response, slug: LegalDocumentSlug) {
  if (response.status !== 200 || !response.headers.get("Content-Type")?.includes("application/json")) return false;
  const parsed = legalDocumentSchema.safeParse(await response.clone().json().catch(() => null));
  return parsed.success && parsed.data.slug === slug;
}

// Ask the controlling worker for its own revision, without a network fallback.
export async function getPrecachedLegal(slug: LegalDocumentSlug) {
  const worker = "serviceWorker" in navigator ? navigator.serviceWorker.controller : null;
  if (!worker || typeof MessageChannel === "undefined") return null;
  return new Promise<ReturnType<typeof legalDocumentSchema.parse> | null>((resolve, reject) => {
    const channel = new MessageChannel();
    const close = () => { clearTimeout(timer); channel.port1.close(); channel.port2.close(); };
    const timer = setTimeout(() => { close(); resolve(null); }, 3_000);
    channel.port1.onmessage = (event: MessageEvent<unknown>) => {
      close();
      const parsed = legalDocumentSchema.safeParse(event.data);
      resolve(parsed.success && parsed.data.slug === slug ? parsed.data : null);
    };
    channel.port1.onmessageerror = () => { close(); reject(new Error("No se pudo leer el documento precargado.")); };
    try { worker.postMessage({ type: "READ_LEGAL_PRECACHE", slug }, [channel.port2]); }
    catch (error) { close(); reject(error); }
  });
}

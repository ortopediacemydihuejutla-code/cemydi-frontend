"use client";

import { useEffect, useState } from "react";
import { LegalDocumentPage } from "@/components/legal/LegalDocumentPage";
import { getOfflineLegal } from "@/lib/pwa/storage";
import type { LegalDocumentSlug } from "@/services/legal-documents";

export default function OfflineLegalDocument({ slug }: { slug: LegalDocumentSlug }) {
  const [snapshot, setSnapshot] = useState<{ slug: LegalDocumentSlug; saved: Awaited<ReturnType<typeof getOfflineLegal>>; error: boolean } | null>(null);
  useEffect(() => {
    let cancelled = false;
    void getOfflineLegal(slug).then(
      (saved) => { if (!cancelled) setSnapshot({ slug, saved, error: false }); },
      () => { if (!cancelled) setSnapshot({ slug, saved: null, error: true }); },
    );
    return () => { cancelled = true; };
  }, [slug]);
  if (!snapshot || snapshot.slug !== slug) return <p role="status" className="p-6">Cargando documento guardado…</p>;
  const title = slug === "terminos-y-condiciones" ? "Términos y condiciones" : "Política de privacidad";
  if (!snapshot.saved) return <section className="mx-auto max-w-3xl space-y-4 px-5 py-14">
    <h1 className="text-3xl">{title}</h1>
    <p role={snapshot.error ? "alert" : "status"}>{snapshot.error ? "No se pudo leer el documento guardado." : "No hay una copia guardada vigente de este documento."} Visita esta página con conexión para guardar su contenido.</p>
  </section>;
  return <>
    <p role="status" className="mx-auto max-w-7xl px-5 py-4 text-sm text-muted-foreground">Copia guardada el {new Date(snapshot.saved.updatedAt).toLocaleString("es-MX")}. Conéctate para consultar la versión más reciente.</p>
    <LegalDocumentPage document={snapshot.saved.document} />
  </>;
}

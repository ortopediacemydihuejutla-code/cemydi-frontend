"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import OfflineCatalog from "./OfflineCatalog";
import OfflineProductDetail from "./OfflineProductDetail";
import { findOfflineProduct, type OfflineProduct } from "@/lib/pwa/products";
import { clearOfflineContent, getOfflineAbout, getOfflineProducts } from "@/lib/pwa/storage";
import { defaultAboutPageContent, type AboutPageContent } from "@/services/about-page";
import { AboutPageClient } from "@/app/quienes-somos/AboutPageClient";
import ContactContent from "@/app/contactanos/ContactContent";
import { useOfflinePresentation } from "@/providers/PwaProvider";
import toast from "react-hot-toast";
import OfflineHome from "./OfflineHome";
import { getOfflineProductAlias } from "@/lib/pwa/policy";

export default function OfflineEntry({ documentFallback = false }: { documentFallback?: boolean }) {
  const { setActive } = useOfflinePresentation();
  const router = useRouter();
  const [path, setPath] = useState("/offline");
  const [product, setProduct] = useState<OfflineProduct | null>(null);
  const [about, setAbout] = useState<{ content: AboutPageContent; updatedAt: number } | null>(null);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    setActive(true);
    if (navigator.onLine) toast("Servicio temporalmente no disponible. Mostramos contenido guardado.", { id: "pwa-service" });
    return () => { setActive(false); toast.dismiss("pwa-service"); };
  }, [setActive]);
  useEffect(() => {
    const dirtyForms = new Set<HTMLFormElement>();
    let recovering = false;
    const trackDirty = (event: Event) => {
      if (event.target instanceof Element) {
        const form = event.target.closest("form");
        if (form) dirtyForms.add(form);
      }
    };
    const resetForm = (event: Event) => { if (event.target instanceof HTMLFormElement && !event.defaultPrevented) dirtyForms.delete(event.target); };
    const disconnect = () => { recovering = false; };
    const reconnect = () => {
      if (!navigator.onLine || recovering) return;
      if (!documentFallback) {
        // Refresh server data without replacing the document or form state.
        recovering = true;
        router.refresh();
        return;
      }
      const modified = [...document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>("form input, form textarea, form select")].some((field) => {
        if (field instanceof HTMLSelectElement) return [...field.options].some((option) => option.selected !== option.defaultSelected);
        if (field instanceof HTMLInputElement && (field.type === "checkbox" || field.type === "radio")) return field.checked !== field.defaultChecked;
        return field.value !== field.defaultValue;
      });
      // Only the precached /offline document needs a document navigation to
      // recover its real route. Never reload ordinary public pages or drafts.
      if ([...dirtyForms].some((form) => form.isConnected) || modified) return;
      recovering = true;
      location.replace(location.pathname === "/offline" ? "/" : location.href);
    };
    document.addEventListener("input", trackDirty);
    document.addEventListener("change", trackDirty);
    document.addEventListener("reset", resetForm);
    window.addEventListener("offline", disconnect);
    window.addEventListener("online", reconnect);
    // The dynamic fallback may mount after the online event already fired.
    // A route refresh is safe here; a cached document must await a real event
    // to avoid reloading repeatedly while the server still returns a fallback.
    if (navigator.onLine && !documentFallback) reconnect();
    return () => {
      document.removeEventListener("input", trackDirty);
      document.removeEventListener("change", trackDirty);
      document.removeEventListener("reset", resetForm);
      window.removeEventListener("offline", disconnect);
      window.removeEventListener("online", reconnect);
    };
  }, [documentFallback, router]);
  useEffect(() => {
    let cancelled = false;
    void Promise.allSettled([getOfflineProducts(), getOfflineAbout()]).then(([productResult, aboutResult]) => {
      if (cancelled) return;
      const products = productResult.status === "fulfilled" ? productResult.value : [];
      const savedAbout = aboutResult.status === "fulfilled" ? aboutResult.value : null;
      setPath(location.pathname.replace(/\/$/, "") || "/");
      setCount(products.length);
      setAbout(savedAbout);
      setProduct(findOfflineProduct(products, getOfflineProductAlias(location.pathname)));
      if (productResult.status === "rejected" || aboutResult.status === "rejected") setError("Parte del contenido guardado no se pudo leer. El almacenamiento local puede estar bloqueado o no disponible.");
      setLoading(false);
    }).catch(() => { if (!cancelled) { setPath(location.pathname.replace(/\/$/, "") || "/"); setLoading(false); setError("El almacenamiento local no está disponible. Puedes reintentar con conexión."); } });
    return () => { cancelled = true; };
  }, []);
  const clear = async () => {
    if (!confirm("¿Borrar los productos, detalles, contenido informativo e imágenes guardados en este dispositivo?")) return;
    try { await clearOfflineContent(); location.reload(); } catch { setError("No se pudo borrar el contenido guardado. Intenta nuevamente."); }
  };
  return <>
      {error && <p role="alert" className="p-4">{error}</p>}
      {loading ? <p role="status" className="p-6">Cargando contenido guardado…</p>
        : path === "/" ? <OfflineHome />
        : path === "/catalogo" ? <OfflineCatalog />
        : path.startsWith("/producto/") ? <OfflineProductDetail product={product} />
        : path === "/quienes-somos" ? <><AboutPageClient content={about?.content ?? defaultAboutPageContent} offline /><p className="mx-auto max-w-7xl px-5 py-4 text-sm text-muted-foreground">{about ? `Contenido público guardado. Actualizado: ${new Date(about.updatedAt).toLocaleString("es-MX")}` : "Contenido institucional predeterminado. No hay una actualización guardada vigente."}</p></>
        : path === "/contactanos" ? <ContactContent offline /> : <section className="mx-auto grid max-w-3xl gap-5 p-6 py-14"><h1 className="text-3xl">Contenido guardado</h1>{count > 0 ? <a href="/catalogo" className="font-semibold text-primary">Consultar {count} productos guardados</a> : <p>No hay productos guardados vigentes. Visita el catálogo con conexión para guardarlos.</p>}<Button variant="outline" onClick={() => void clear()}>Borrar contenido guardado</Button></section>}
  </>;
}

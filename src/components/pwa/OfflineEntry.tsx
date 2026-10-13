"use client";
import { useEffect, useState } from "react";
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

export default function OfflineEntry() {
  const { setActive } = useOfflinePresentation();
  const [path, setPath] = useState("/offline");
  const [product, setProduct] = useState<OfflineProduct | null>(null);
  const [about, setAbout] = useState<{ content: AboutPageContent; updatedAt: number } | null>(null);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    setActive(true);
    if (navigator.onLine) toast("Servicio temporalmente no disponible. Mostramos contenido guardado.", { id: "pwa-service" });
    return () => setActive(false);
  }, [setActive]);
  useEffect(() => {
    let cancelled = false;
    void Promise.all([getOfflineProducts(), getOfflineAbout()]).then(([products, savedAbout]) => {
      if (cancelled) return;
      setPath(location.pathname);
      setCount(products.length);
      setAbout(savedAbout);
      setProduct(findOfflineProduct(products, decodeURIComponent(location.pathname.split("/").filter(Boolean).pop() ?? "")));
      setLoading(false);
    }).catch(() => { if (!cancelled) { setPath(location.pathname); setLoading(false); setError("El almacenamiento local no está disponible. Puedes reintentar con conexión."); } });
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

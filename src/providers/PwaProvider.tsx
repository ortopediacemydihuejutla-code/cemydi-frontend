"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { isOfflinePublicPath } from "@/lib/pwa/policy";
import { useOnline } from "@/lib/pwa/connectivity";
import toast from "react-hot-toast";
import { WifiOff } from "lucide-react";

export function showOfflineToast() {
  toast("Sin conexión", { id: "pwa-connectivity", duration: 3_000, icon: <WifiOff className="size-5 shrink-0 text-red-600" aria-hidden="true" /> });
}

const OfflineContext = createContext<{ active: boolean; setActive: (active: boolean) => void }>({ active: false, setActive: () => {} });
export function useOfflinePresentation() { return useContext(OfflineContext); }
export default function PwaProvider({ children }: { children: ReactNode }) {
  const online = useOnline();
  const [notice, setNotice] = useState("");
  const [fallback, setFallback] = useState(false);
  const fallbackRef = useRef(false);
  const dirty = useRef(false);
  const setActive = useCallback((active: boolean) => { fallbackRef.current = active; setFallback(active); }, []);
  useEffect(() => {
    if (!online) showOfflineToast();
  }, [online]);
  useEffect(() => { if (notice) toast.error(notice, { id: "pwa-notice" }); }, [notice]);
  useEffect(() => {
    const trackDirty = (event: Event) => { if (event.target instanceof Element && event.target.closest("form")) dirty.current = true; };
    const reset = () => { dirty.current = false; };
    document.addEventListener("input", trackDirty);
    document.addEventListener("change", trackDirty);
    document.addEventListener("submit", trackDirty);
    document.addEventListener("reset", reset);
    const reconnect = () => {
      if (!isOfflinePublicPath(location.pathname)) return;
      const filledForm = [...document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("form input, form textarea")].some((field) => field.value !== field.defaultValue);
      if (!filledForm && !dirty.current) location.reload();
    };
    window.addEventListener("online", reconnect);
    let cancelled = false;
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      // Let the browser install updates in the background. With skipWaiting
      // disabled, activation waits until every old controlled tab/app closes.
      // Never force activation or reload a client for an update.
      void navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).catch(() => {
        if (!cancelled) setNotice("No se pudo habilitar el respaldo offline. Puedes seguir navegando con conexión.");
      });
    } else if ("serviceWorker" in navigator) {
      // A previous production run on the same localhost origin must not leave
      // CEMYDI's worker registered during next dev. Preserve public IndexedDB.
      void navigator.serviceWorker.getRegistrations().then((registrations) => Promise.all(
        registrations.filter((item) => {
          const worker = item.active ?? item.waiting ?? item.installing;
          return worker && new URL(worker.scriptURL).pathname === "/sw.js";
        }).map((item) => item.unregister()),
      )).catch(() => {});
    }
    // Offline links must request a document, never a new RSC payload.
    const navigateOffline = (event: MouseEvent) => {
      if ((navigator.onLine && !fallbackRef.current) || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element ? event.target.closest("a") : null;
      if (!link || link.hasAttribute("download")) return;
      const url = new URL(link.href, location.href);
      if (url.origin === location.origin || /^https?:$/.test(url.protocol)) {
        if (link.target && url.origin === location.origin && isOfflinePublicPath(url.pathname)) return;
        event.preventDefault(); event.stopPropagation();
        if (url.origin === location.origin && isOfflinePublicPath(url.pathname)) location.assign(url.href);
        else toast.error("Necesitas conexión a Internet para entrar a esta página.", { id: "pwa-navigation" });
      }
    };
    document.addEventListener("click", navigateOffline, true);
    return () => {
      cancelled = true;
      document.removeEventListener("input", trackDirty);
      document.removeEventListener("change", trackDirty);
      document.removeEventListener("submit", trackDirty);
      document.removeEventListener("reset", reset);
      window.removeEventListener("online", reconnect);
      document.removeEventListener("click", navigateOffline, true);
    };
  }, []);
  return <OfflineContext.Provider value={{ active: !online || fallback, setActive }}>
    {children}
  </OfflineContext.Provider>;
}

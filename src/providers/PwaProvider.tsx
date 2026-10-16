"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { isOfflinePublicPath } from "@/lib/pwa/policy";
import { useOnline } from "@/lib/pwa/connectivity";
import toast from "react-hot-toast";
import { Wifi, WifiOff } from "lucide-react";

const RECONNECT_DURATION = 4_000;
const connectivityToastOptions = {
  id: "pwa-connectivity",
  position: "bottom-left" as const,
  ariaProps: { role: "status", "aria-live": "polite" } as const,
  style: { padding: "8px 12px", fontSize: "13px", fontWeight: 500, boxShadow: "0 4px 14px rgba(15, 42, 50, 0.12)" },
};

export function showOfflineToast() {
  toast("Sin conexión", { ...connectivityToastOptions, duration: Infinity, icon: <WifiOff className="size-4 shrink-0 text-red-600" aria-hidden="true" /> });
}

function showConnectedToast(duration = RECONNECT_DURATION) {
  toast("Conexión restablecida", { ...connectivityToastOptions, duration, icon: <Wifi className="size-4 shrink-0 text-green-700" aria-hidden="true" /> });
}

const OfflineContext = createContext<{ active: boolean; setActive: (active: boolean) => void }>({ active: false, setActive: () => {} });
export function useOfflinePresentation() { return useContext(OfflineContext); }
export default function PwaProvider({ children }: { children: ReactNode }) {
  const online = useOnline();
  const [notice, setNotice] = useState("");
  const [fallback, setFallback] = useState(false);
  const fallbackRef = useRef(false);
  const wasOnline = useRef(true);
  const setActive = useCallback((active: boolean) => { fallbackRef.current = active; setFallback(active); }, []);
  useEffect(() => {
    if (!online) {
      showOfflineToast();
    } else if (!wasOnline.current) showConnectedToast();
    wasOnline.current = online;
  }, [online]);
  useEffect(() => { if (notice) toast.error(notice, { id: "pwa-notice" }); }, [notice]);
  useEffect(() => {
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
      // A recovered connection can leave the shell open while a form is dirty.
      // Explicit navigation then uses a document and may reach any online page.
      if (navigator.onLine) {
        const samePageHash = url.hash && url.pathname === location.pathname && url.search === location.search;
        if (url.origin === location.origin && (!link.target || link.target === "_self") && !samePageHash) {
          event.preventDefault(); event.stopPropagation(); location.assign(url.href);
        }
        return;
      }
      if (url.origin === location.origin || /^https?:$/.test(url.protocol)) {
        if (link.target && link.target !== "_self" && url.origin === location.origin && isOfflinePublicPath(url.pathname)) return;
        event.preventDefault(); event.stopPropagation();
        if (url.origin === location.origin && isOfflinePublicPath(url.pathname)) location.assign(url.href);
        else toast.error("Necesitas conexión a Internet para entrar a esta página.", { id: "pwa-navigation" });
      }
    };
    document.addEventListener("click", navigateOffline, true);
    return () => {
      cancelled = true;
      document.removeEventListener("click", navigateOffline, true);
    };
  }, []);
  return <OfflineContext.Provider value={{ active: !online || fallback, setActive }}>
    {children}
  </OfflineContext.Provider>;
}

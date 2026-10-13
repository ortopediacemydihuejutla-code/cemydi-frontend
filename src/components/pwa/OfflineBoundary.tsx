"use client";
import { useEffect, useState, type ReactNode } from "react";
import { useOnline } from "@/lib/pwa/connectivity";
import dynamic from "next/dynamic";
const OfflineEntry = dynamic(() => import("./OfflineEntry"), { loading: () => <p role="status" className="p-6">Cargando contenido guardado…</p> });

export default function OfflineBoundary({ children, unavailable = false }: { children: ReactNode; unavailable?: boolean }) {
  const online = useOnline();
  const [disconnected, setDisconnected] = useState(false);
  useEffect(() => {
    const off = () => setDisconnected(true);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("offline", off); };
  }, []);
  return !online || disconnected || unavailable ? <OfflineEntry /> : children;
}

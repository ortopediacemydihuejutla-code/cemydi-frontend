"use client";
import { Activity, useState, type ReactNode } from "react";
import { useOnline } from "@/lib/pwa/connectivity";
import dynamic from "next/dynamic";
const OfflineEntry = dynamic(() => import("./OfflineEntry"), { loading: () => <p role="status" className="p-6">Cargando contenido guardado…</p> });

export default function OfflineBoundary({ children, unavailable = false, preserveState = false }: { children: ReactNode; unavailable?: boolean; preserveState?: boolean }) {
  const online = useOnline();
  const [recovery, setRecovery] = useState<{ online: boolean; interrupted: { children: ReactNode } | null }>({ online, interrupted: null });
  // An online event does not prove the server is reachable. Hold the fallback
  // until refresh supplies a new route snapshot, rather than revealing old
  // prices/stock from the previously mounted page in the meantime.
  if (recovery.online !== online) {
    setRecovery({ online, interrupted: online ? recovery.interrupted : { children } });
  } else if (online && recovery.interrupted && recovery.interrupted.children !== children) {
    setRecovery({ online, interrupted: null });
  }
  const awaitingFreshContent = online && recovery.interrupted !== null && recovery.interrupted.children === children;
  const offline = !online || unavailable || awaitingFreshContent;
  if (!preserveState) return offline ? <OfflineEntry /> : children;
  // Preserve drafts while suspending hidden effects (scroll locks, persistence
  // and subscriptions). Activity is available in the installed React 19.2.
  return <>
    {/* Keep visible fallback anchors/labels ahead of the preserved hidden DOM. */}
    {offline && <OfflineEntry />}
    <Activity mode={offline ? "hidden" : "visible"}>{children}</Activity>
  </>;
}

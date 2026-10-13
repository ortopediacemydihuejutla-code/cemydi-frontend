"use client";
import { useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";

function subscribe(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => { window.removeEventListener("online", callback); window.removeEventListener("offline", callback); };
}
export function useOnline() {
  return useSyncExternalStore(subscribe, () => navigator.onLine, () => true);
}

// Cached /offline HTML is served under the requested public URL. The header
// must mark that URL active rather than the shell's internal Next.js pathname.
export function usePublicPathname() {
  const pathname = usePathname();
  const actual = useSyncExternalStore(subscribe, () => location.pathname, () => pathname);
  return pathname === "/offline" ? actual : pathname;
}

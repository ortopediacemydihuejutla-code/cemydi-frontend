import type { Metadata } from "next";
import OfflineEntry from "@/components/pwa/OfflineEntry";
export const metadata: Metadata = { title: "Sin conexión", robots: { index: false, follow: false } };
export default function OfflinePage() { return <OfflineEntry />; }

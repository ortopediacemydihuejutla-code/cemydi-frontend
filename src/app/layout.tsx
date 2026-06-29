import type { Metadata } from "next";
import "./globals.css";
import { headers } from "next/headers";
import { AuthProvider } from "@/providers/AuthContext";
import { CartProvider } from "@/providers/CartContext";
import ToasterClient from "@/components/providers/ToasterClient";
import AppShell from "@/components/layout/AppShell";
import { getSiteUrl } from "@/lib/site-config";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Ortopedia CEMYDI",
    template: "%s | Ortopedia CEMYDI",
  },
  description:
    "Ortopedia CEMYDI: equipos médicos, movilidad y rehabilitación. Catálogo de productos para venta y renta en México.",
  openGraph: {
    type: "website",
    locale: "es_MX",
    siteName: "Ortopedia CEMYDI",
    title: "Ortopedia CEMYDI",
    description:
      "Equipos médicos, movilidad y rehabilitación. Catálogo de productos para venta y renta.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ortopedia CEMYDI",
    description:
      "Equipos médicos, movilidad y rehabilitación. Catálogo de productos para venta y renta.",
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any", type: "image/x-icon" },
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: [{ url: "/favicon.ico", type: "image/x-icon" }],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const requestHeaders = await headers();
  const pathname = requestHeaders.get("x-pathname") ?? "";

  return (
    <html lang="es">
      <body>
        <AuthProvider>
          <CartProvider>
            <ToasterClient />
            <AppShell initialPathname={pathname}>{children}</AppShell>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

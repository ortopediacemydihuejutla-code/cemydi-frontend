import type { Metadata } from "next";
import "./globals.css";
import { headers } from "next/headers";
import { AuthProvider } from "@/providers/AuthContext";
import { CartProvider } from "@/providers/CartContext";
import ToasterClient from "@/components/providers/ToasterClient";
import AppShell from "@/components/layout/AppShell";
import { getSiteUrl } from "@/lib/site-config";

const siteUrl = getSiteUrl();
const iconVersion = "cemydi-20260701";

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
      <head>
        <link
          rel="icon"
          href={`/favicon.svg?v=${iconVersion}`}
          type="image/svg+xml"
          sizes="any"
        />
        <link
          rel="icon"
          href={`/favicon-32x32.png?v=${iconVersion}`}
          type="image/png"
          sizes="32x32"
        />
        <link
          rel="icon"
          href={`/favicon-16x16.png?v=${iconVersion}`}
          type="image/png"
          sizes="16x16"
        />
        <link
          rel="icon"
          href={`/favicon-48x48.png?v=${iconVersion}`}
          type="image/png"
          sizes="48x48"
        />
        <link rel="shortcut icon" href={`/favicon.ico?v=${iconVersion}`} />
        <link rel="apple-touch-icon" href={`/apple-icon.png?v=${iconVersion}`} sizes="180x180" />
        <link rel="manifest" href="/manifest.webmanifest" />
      </head>
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

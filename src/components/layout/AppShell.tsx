"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { usePathname } from "next/navigation";

const PUBLIC_ROUTE_PREFIXES = [
  "/",
  "/carrito",
  "/catalogo",
  "/configuracion",
  "/contactanos",
  "/contacto",
  "/forgot-password",
  "/login",
  "/mi-cuenta",
  "/mis-pedidos",
  "/mis-resenas",
  "/mis-rentas",
  "/favoritos",
  "/perfil",
  "/politicas-de-privacidad",
  "/producto",
  "/quienes-somos",
  "/register",
  "/reset-password",
  "/terminos-y-condiciones",
  "/verify-email",
];

function isPublicChromeRoute(pathname: string) {
  if (pathname === "/") {
    return true;
  }

  return PUBLIC_ROUTE_PREFIXES.some((route) => {
    return route !== "/" && (pathname === route || pathname.startsWith(`${route}/`));
  });
}

export default function AppShell({
  children,
  initialPathname,
}: {
  children: React.ReactNode;
  initialPathname: string;
}) {
  const currentPathname = usePathname();
  const pathname = currentPathname || initialPathname;
  const hidePublicChrome =
    pathname.startsWith("/admin") || !isPublicChromeRoute(pathname);

  if (hidePublicChrome) {
    return <>{children}</>;
  }

  return (
    <div className="appShell">
      <Header />
      <main className="appMain">{children}</main>
      <Footer />
    </div>
  );
}

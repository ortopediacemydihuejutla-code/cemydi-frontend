import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { fetchSessionUserFromCookieHeader } from "@/lib/admin-session";
import { createContentSecurityPolicy } from "@/lib/content-security-policy";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = createContentSecurityPolicy(nonce);
  requestHeaders.set("x-nonce", nonce);
  // Next.js reads the request CSP to apply the nonce to framework scripts.
  requestHeaders.set("Content-Security-Policy", csp);

  if (pathname.startsWith("/admin")) {
    const cookieHeader = request.cookies
      .getAll()
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ");

    const user = await fetchSessionUserFromCookieHeader(cookieHeader);

    if (!user) {
      console.warn("[SECURITY_AUDIT] Intento de acceso administrativo sin autenticación", {
        pathname,
        ip: request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "unknown",
        timestamp: new Date().toISOString(),
      });
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (user.rol !== "ADMIN") {
      console.warn("[SECURITY_AUDIT] Acceso administrativo denegado por rol no autorizado", {
        pathname,
        userId: user.id,
        role: user.rol,
        timestamp: new Date().toISOString(),
      });
      return NextResponse.redirect(new URL("/perfil", request.url));
    }
  }

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: [
    "/((?!api(?:/|$)|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.webmanifest|sw.js).*)",
  ],
};

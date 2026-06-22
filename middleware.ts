import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { fetchSessionUserFromCookieHeader } from "@/lib/admin-session";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  if (pathname.startsWith("/admin")) {
    const cookieHeader = request.cookies
      .getAll()
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ");

    const user = await fetchSessionUserFromCookieHeader(cookieHeader);

    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (user.rol !== "ADMIN") {
      return NextResponse.redirect(new URL("/perfil", request.url));
    }
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/admin/:path*"],
};

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public paths that bypass auth
  const publicPaths = ["/_next", "/api/auth", "/static", "/login", "/favicon.ico", "/opengraph-image.png", "/sitemap.xml", "/robots.txt"];
  if (publicPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const secret = process.env.AUTH_SECRET || "fallback-secret-for-local-dev-change-in-prod-12345";
  const token = await getToken({ req: request, secret });

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === "/") {
    return NextResponse.redirect(new URL("/pipeline", request.url));
  }

  if (pathname.startsWith("/settings/organization") && token.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/pipeline?error=unauthorized", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

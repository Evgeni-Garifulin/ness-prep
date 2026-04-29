import { NextResponse, type NextRequest } from "next/server";

// Edge middleware can't import node:crypto, so we do a *cheap* presence check
// for the cookie here and let server components run the full HMAC verify.
// Anyone who forges a cookie body still fails the signature check downstream.
const COOKIE = "ness_session";

const PUBLIC_PATHS = new Set<string>(["/login"]);

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    PUBLIC_PATHS.has(pathname) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname === "/robots.txt" ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const hasCookie = !!req.cookies.get(COOKIE);
  if (!hasCookie) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt).*)"],
};

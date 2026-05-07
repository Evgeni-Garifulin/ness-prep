import { NextResponse, type NextRequest } from "next/server";

// Edge middleware can't import node:crypto, so we do a *cheap* presence check
// for the cookie here and let server components run the full HMAC verify.
// Anyone who forges a cookie body still fails the signature check downstream.
const COOKIE = "ness_session";

const PUBLIC_PATHS = new Set<string>(["/login"]);

// Перезаписываем Cache-Control на HTML-страницах, чтобы они попадали в
// bfcache (мгновенный back/forward в браузере). По умолчанию Next.js
// для force-dynamic + cookies() ставит `no-store`, и браузер тогда
// выкидывает страницу из bfcache. Нам приватность всё равно сохраняет
// `private` + `no-cache` + `must-revalidate` — CDN/прокси не кешируют,
// а ревалидация при возврате обязательна.
const BFCACHE_FRIENDLY = "private, no-cache, max-age=0, must-revalidate";

function withBfcacheHeader(res: ReturnType<typeof NextResponse.next>) {
  res.headers.set("Cache-Control", BFCACHE_FRIENDLY);
  return res;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Чисто-сервисные пути — пропускаем без auth и без bfcache-перезаписи.
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname === "/robots.txt" ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const hasCookie = !!req.cookies.get(COOKIE);

  // /api/* — JSON, своя политика кеширования, bfcache не нужен.
  if (pathname.startsWith("/api/")) {
    if (!hasCookie) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }
    return NextResponse.next();
  }

  // /login и другие публичные HTML-страницы — bfcache имеет смысл.
  if (PUBLIC_PATHS.has(pathname)) {
    return withBfcacheHeader(NextResponse.next());
  }

  if (!hasCookie) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  return withBfcacheHeader(NextResponse.next());
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt).*)"],
};

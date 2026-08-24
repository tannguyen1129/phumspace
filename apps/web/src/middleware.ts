import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = ["/welcome", "/register", "/login", "/verify-email", "/forgot-password", "/reset-password", "/legal", "/support", "/offline", "/api/health"];
const AUTH_COOKIE_NAME = "ps_auth";

/**
 * Hien thuc "account-required" o tang routing (UX-V11-01): chua co cookie ps_auth thi
 * redirect ve /welcome cho moi route ngoai PUBLIC_PATHS. Day la UX gate, KHONG phai bien
 * gioi bao mat — bien gioi that la JwtAuthGuard tren tung API call (apps/api/src/common/auth).
 */
export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const isPublicPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path));
  const isAuthenticated = request.cookies.has(AUTH_COOKIE_NAME);

  if (!isPublicPath && !isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = "/welcome";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js).*)"],
};

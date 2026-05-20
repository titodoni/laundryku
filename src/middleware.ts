import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const PUBLIC_FILE = /\.(.*)$/;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/" ||
    pathname === "/register" ||
    pathname === "/onboarding" ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  const slug = pathname.split("/").filter(Boolean)[0];

  if (slug) {
    // Internal-only headers. API handlers must NEVER trust these for auth.
    // Always re-validate session independently in every route handler.
    response.headers.set("x-laundryku-internal-slug", slug);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)", "/((?!api/).*)"]
};

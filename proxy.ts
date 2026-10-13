import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifyToken } from "@/lib/admin/token";

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Arabic is the site's main language (DEFAULT_LOCALE in lib/seo.ts):
  // idvet.co → idvet.co/ar, permanently.
  if (pathname === "/") {
    return NextResponse.redirect(new URL(`/ar${search}`, request.url), 308);
  }

  // /admin/*: send visitors without a valid session to the login page. This is
  // the first gate only — every admin page, Server Action and upload route
  // checks the session again itself.
  const signedIn = verifyToken(request.cookies.get(SESSION_COOKIE)?.value);
  const isLogin = pathname === "/admin/login";
  let response: NextResponse;
  if (!signedIn && !isLogin) {
    const login = new URL("/admin/login", request.url);
    login.searchParams.set("next", pathname + search);
    response = NextResponse.redirect(login);
  } else if (signedIn && isLogin) {
    response = NextResponse.redirect(new URL("/admin", request.url));
  } else {
    response = NextResponse.next();
  }
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export const config = {
  // Upload routes live under /api/admin, outside this matcher on purpose:
  // proxy buffers request bodies only up to 10MB and would truncate uploads.
  matcher: ["/", "/admin", "/admin/:path*"],
};

import { NextRequest, NextResponse } from "next/server";
import { locales, defaultLocale } from "./lib/i18n";
import { updateSession } from "./lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip auth callback — let the route handler process it
  if (pathname.startsWith("/auth/callback")) {
    return await updateSession(request);
  }

  // i18n: redirect to default locale if no locale prefix
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (!pathnameHasLocale) {
    request.nextUrl.pathname = `/${defaultLocale}${pathname}`;
    return NextResponse.redirect(request.nextUrl);
  }

  // Refresh Supabase auth session
  return await updateSession(request);
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico|.*\\..*).*)"],
};

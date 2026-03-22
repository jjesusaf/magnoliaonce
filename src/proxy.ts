import { NextRequest, NextResponse } from "next/server";
import { locales, defaultLocale } from "./lib/i18n";
import { updateSession } from "./lib/supabase/middleware";
import { rateLimit } from "./lib/rate-limit";

// Rate limit configs per route pattern (requests / window)
const API_LIMITS: { pattern: string; limit: number; windowMs: number }[] = [
  // Checkout: 10 requests per minute
  { pattern: "/api/checkout", limit: 10, windowMs: 60_000 },
  // Coupons: 20 requests per minute
  { pattern: "/api/coupons", limit: 20, windowMs: 60_000 },
  // AI generate: 5 requests per minute
  { pattern: "/api/ai", limit: 5, windowMs: 60_000 },
  // Webhooks: generous limit (MP can send bursts)
  { pattern: "/api/webhooks", limit: 100, windowMs: 60_000 },
  // Admin routes: 30 requests per minute
  { pattern: "/api/admin", limit: 30, windowMs: 60_000 },
  // Default for any other API: 30 requests per minute
  { pattern: "/api/", limit: 30, windowMs: 60_000 },
];

function getIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function handleApiRateLimit(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl;
  const ip = getIp(request);

  // Find matching limit config
  const config = API_LIMITS.find((c) => pathname.startsWith(c.pattern));
  if (!config) return null;

  const key = `${ip}:${config.pattern}`;
  const result = rateLimit(key, config.limit, config.windowMs);

  if (!result.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((result.resetAt - Date.now()) / 1000)),
          "X-RateLimit-Limit": String(config.limit),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  return null;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rate limit API routes
  if (pathname.startsWith("/api/")) {
    const blocked = handleApiRateLimit(request);
    if (blocked) return blocked;
    return NextResponse.next();
  }

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
  matcher: [
    // All pages (i18n + auth)
    "/((?!_next|favicon.ico|.*\\..*).*)",
    // API routes (rate limiting)
    "/api/:path*",
  ],
};

"use client";

import { use, Suspense, useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  LogOut,
  Heart,
  ShoppingBag,
  CircleHelp,
  Shield,
  FileText,
  ChevronRight,
  Ticket,
  Copy,
  Check,
  LayoutDashboard,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

type Provider = "google" | "apple" | "facebook";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function getGreeting(isEs: boolean): string {
  const h = new Date().getHours();
  if (h < 12) return isEs ? "Buenos días" : "Good morning";
  if (h < 18) return isEs ? "Buenas tardes" : "Good afternoon";
  return isEs ? "Buenas noches" : "Good evening";
}

function generateCouponCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "MAGNOLIA-";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

const PROVIDER_LABELS: Record<string, string> = {
  google: "Google",
  apple: "Apple",
  facebook: "Facebook",
};

/* ─── Coupon card ──────────────────────────────────────────── */

function CouponCard({
  code,
  discount,
  isRedeemed,
  expiresAt,
  isEs,
}: {
  code: string;
  discount: number;
  isRedeemed: boolean;
  expiresAt: string;
  isEs: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const expired = new Date(expiresAt) < new Date();
  const inactive = isRedeemed || expired;

  const expiryLabel = new Date(expiresAt).toLocaleDateString(
    isEs ? "es-MX" : "en-US",
    { day: "numeric", month: "long", year: "numeric" }
  );

  function handleCopy() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className={`relative overflow-hidden border-2 border-dashed p-5 ${
        inactive
          ? "border-base-content/10 bg-base-200/50 opacity-60"
          : "border-base-content/20 bg-base-200/30"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Ticket className="h-4 w-4 text-base-content/50" strokeWidth={1.5} />
            <span className="text-xs tracking-widest uppercase text-base-content/50">
              {isEs ? "Tu cupón de bienvenida" : "Your welcome coupon"}
            </span>
          </div>
          <p className="text-2xl tracking-widest uppercase">{discount}% OFF</p>
          <p className="text-xs text-base-content/40 mt-1">
            {isRedeemed
              ? isEs
                ? "Cupón ya utilizado"
                : "Coupon already used"
              : expired
                ? isEs
                  ? "Cupón expirado"
                  : "Coupon expired"
                : isEs
                  ? "En tu primera compra"
                  : "On your first purchase"}
          </p>
        </div>
      </div>

      {/* Code */}
      <div className="mt-4 flex items-center gap-2">
        <code
          className={`flex-1 text-center text-sm font-mono tracking-widest py-2 px-3 ${
            inactive
              ? "bg-base-200/50 text-base-content/40 line-through"
              : "bg-base-100 text-base-content border border-base-content/10"
          }`}
        >
          {code}
        </code>
        {!inactive && (
          <button
            onClick={handleCopy}
            className="p-2 hover:opacity-60 transition-opacity"
            aria-label="Copy code"
          >
            {copied ? (
              <Check className="h-4 w-4" strokeWidth={1.5} />
            ) : (
              <Copy className="h-4 w-4" strokeWidth={1.5} />
            )}
          </button>
        )}
      </div>

      {/* Expiry */}
      <p className="text-xs text-base-content/30 mt-3">
        {inactive
          ? isEs
            ? `Expiró el ${expiryLabel}`
            : `Expired on ${expiryLabel}`
          : isEs
            ? `Válido hasta el ${expiryLabel}`
            : `Valid until ${expiryLabel}`}
      </p>
    </div>
  );
}

/* ─── Main form ────────────────────────────────────────────── */

function LoginForm({ lang }: { lang: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const error = searchParams.get("error");
  const { user, loading, signOut } = useAuth();
  const isEs = lang === "es";

  const [signingIn, setSigningIn] = useState<Provider | null>(null);
  const [coupon, setCoupon] = useState<{
    code: string;
    discount_percent: number;
    is_redeemed: boolean;
    expires_at: string;
  } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check admin status
  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    supabase
      .from("profiles")
      .select("is_admin")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data?.is_admin) setIsAdmin(true);
      });
  }, [user]);

  const handleOAuthLogin = async (provider: Provider) => {
    setSigningIn(provider);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/${lang}/shop`,
      },
    });
  };

  const handleSignOut = async () => {
    await signOut();
    router.push(`/${lang}/shop`);
  };

  // Fetch or create coupon when user is authenticated
  const fetchOrCreateCoupon = useCallback(async (userId: string) => {
    setCouponLoading(true);
    const supabase = createClient();

    // Try to fetch existing coupon
    const { data: existing } = await supabase
      .schema("magnolia")
      .from("coupons")
      .select("code, discount_percent, is_redeemed, expires_at")
      .eq("user_id", userId)
      .single();

    if (existing) {
      setCoupon(existing);
      setCouponLoading(false);
      return;
    }

    // Create a new welcome coupon
    const code = generateCouponCode();
    const { data: created } = await supabase
      .schema("magnolia")
      .from("coupons")
      .insert({ user_id: userId, code, discount_percent: 30 })
      .select("code, discount_percent, is_redeemed, expires_at")
      .single();

    if (created) {
      setCoupon(created);
    }
    setCouponLoading(false);
  }, []);

  useEffect(() => {
    if (user) {
      fetchOrCreateCoupon(user.id);
    }
  }, [user, fetchOrCreateCoupon]);

  // Loading — profile skeleton
  if (loading) {
    return (
      <div className="min-h-dvh bg-base-100 flex flex-col">
        <header className="sticky top-0 z-40 bg-base-100/80 backdrop-blur-xl border-b border-base-content/10">
          <div className="max-w-lg mx-auto flex items-center gap-4 px-6 py-3">
            <div className="p-1.5"><div className="size-4" /></div>
            <div className="logo-stack grid">
              <Image src="/images/logo.svg" alt="Magnolia Once" width={120} height={24} className="logo-dark h-5 w-auto" />
              <Image src="/images/logo-light.svg" alt="Magnolia Once" width={120} height={24} className="logo-light h-5 w-auto" />
            </div>
          </div>
        </header>
        <div className="max-w-lg w-full mx-auto px-6 pt-10 pb-8">
          <div className="flex items-center gap-5">
            <div className="skeleton w-16 h-16 shrink-0" />
            <div className="flex-1 min-w-0 space-y-2">
              <div className="skeleton h-3 w-24" />
              <div className="skeleton h-6 w-36" />
              <div className="skeleton h-3.5 w-48" />
            </div>
          </div>
        </div>
        <div className="max-w-lg w-full mx-auto px-6 space-y-2">
          <div className="flex gap-3">
            <div className="skeleton h-8 w-36" />
            <div className="skeleton h-8 w-44" />
          </div>
        </div>
        <div className="max-w-lg w-full mx-auto px-6 mt-6">
          <div className="skeleton h-40 w-full" />
        </div>
        <div className="max-w-lg w-full mx-auto px-6">
          <div className="border-b border-base-content/10 mt-8 mb-2" />
          <div className="skeleton h-3 w-24 mt-4 mb-3" />
          <div className="space-y-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-3 px-1">
                <div className="skeleton size-4.5" />
                <div className="skeleton h-3.5 flex-1 max-w-48" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── Authenticated ───────────────────────────────────────
  if (user) {
    const fullName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split("@")[0] ||
      "Usuario";
    const firstName = fullName.split(" ")[0];
    const email = user.email;
    const provider = user.app_metadata?.provider;
    const initials = getInitials(fullName);
    const greeting = getGreeting(isEs);
    const memberSince = user.created_at
      ? new Date(user.created_at).toLocaleDateString(
          isEs ? "es-MX" : "en-US",
          { month: "long", year: "numeric" }
        )
      : null;

    const accountLinks = [
      ...(isAdmin
        ? [
            {
              label: isEs ? "Panel de admin" : "Admin dashboard",
              href: `/${lang}/admin`,
              icon: LayoutDashboard,
            },
          ]
        : []),
      {
        label: isEs ? "Mis pedidos" : "My orders",
        href: `/${lang}/orders`,
        icon: ShoppingBag,
      },
      {
        label: isEs ? "Mis favoritos" : "My favorites",
        href: `/${lang}/favorites`,
        icon: Heart,
      },
      {
        label: isEs ? "Preguntas frecuentes" : "FAQ",
        href: `/${lang}/faq`,
        icon: CircleHelp,
      },
      {
        label: isEs ? "Política de privacidad" : "Privacy policy",
        href: `/${lang}/privacy`,
        icon: Shield,
      },
      {
        label: isEs ? "Términos de servicio" : "Terms of service",
        href: `/${lang}/terms`,
        icon: FileText,
      },
    ];

    return (
      <div className="min-h-dvh bg-base-100 flex flex-col">
        {/* Sticky header */}
        <header className="sticky top-0 z-40 bg-base-100/80 backdrop-blur-xl border-b border-base-content/10">
          <div className="max-w-lg mx-auto flex items-center gap-4 px-6 py-3">
            <Link
              href={`/${lang}/shop`}
              className="p-1.5 hover:opacity-60 transition-opacity"
              aria-label={isEs ? "Volver" : "Back"}
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
            </Link>
            <div className="logo-stack grid">
              <Image
                src="/images/logo.svg"
                alt="Magnolia Once"
                width={120}
                height={24}
                className="logo-dark h-5 w-auto"
              />
              <Image
                src="/images/logo-light.svg"
                alt="Magnolia Once"
                width={120}
                height={24}
                className="logo-light h-5 w-auto"
              />
            </div>
          </div>
        </header>

        {/* Profile hero */}
        <div className="max-w-lg w-full mx-auto px-6 pt-10 pb-8">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 shrink-0 bg-base-content flex items-center justify-center">
              <span className="text-xl tracking-widest text-base-100">
                {initials}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-xs text-base-content/40 tracking-widest uppercase mb-0.5">
                {greeting}
              </p>
              <h1 className="text-xl tracking-widest uppercase truncate">
                {firstName}
              </h1>
              {email && (
                <p className="text-sm text-base-content/40 truncate">
                  {email}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Account details */}
        <div className="max-w-lg w-full mx-auto px-6">
          <div className="flex items-center gap-3 flex-wrap">
            {provider && (
              <span className="text-xs tracking-widest uppercase text-base-content/40 px-3 py-1.5 border border-base-content/10">
                {isEs ? "Sesión con" : "Signed in with"}{" "}
                {PROVIDER_LABELS[provider] ?? provider}
              </span>
            )}
            {memberSince && (
              <span className="text-xs tracking-widest uppercase text-base-content/40 px-3 py-1.5 border border-base-content/10">
                {isEs ? "Miembro desde" : "Member since"} {memberSince}
              </span>
            )}
          </div>
        </div>

        {/* Coupon */}
        <div className="max-w-lg w-full mx-auto px-6 mt-6">
          {couponLoading ? (
            <div className="border-2 border-dashed border-base-content/10 p-5 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="skeleton size-4" />
                <div className="skeleton h-3 w-40" />
              </div>
              <div className="skeleton h-7 w-28" />
              <div className="skeleton h-3 w-36" />
              <div className="skeleton h-10 w-full mt-4" />
              <div className="skeleton h-3 w-44 mt-3" />
            </div>
          ) : coupon ? (
            <CouponCard
              code={coupon.code}
              discount={coupon.discount_percent}
              isRedeemed={coupon.is_redeemed}
              expiresAt={coupon.expires_at}
              isEs={isEs}
            />
          ) : null}
        </div>

        {/* Divider */}
        <div className="max-w-lg w-full mx-auto px-6">
          <div className="border-b border-base-content/10 mt-8 mb-2" />
        </div>

        {/* Account links */}
        <nav className="max-w-lg w-full mx-auto px-6">
          <p className="text-xs tracking-widest uppercase text-base-content/30 px-1 py-3">
            {isEs ? "Información" : "Information"}
          </p>
          <ul className="space-y-0.5">
            {accountLinks.map((link) => {
              const Icon = link.icon;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex items-center gap-3 px-1 py-3 hover:bg-base-200/50 transition-colors group"
                  >
                    <Icon className="h-4.5 w-4.5 text-base-content/30 group-hover:text-base-content/50 transition-colors" strokeWidth={1.5} />
                    <span className="flex-1 text-sm text-base-content/70 group-hover:text-base-content transition-colors">
                      {link.label}
                    </span>
                    <ChevronRight className="h-4 w-4 text-base-content/20 group-hover:text-base-content/40 transition-colors" strokeWidth={1.5} />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sign out */}
        <div className="max-w-lg w-full mx-auto px-6 mt-auto pb-10 pt-8">
          <button
            onClick={handleSignOut}
            className="flex items-center justify-center gap-2 w-full py-3 text-sm tracking-widest uppercase text-base-content/40 hover:text-base-content border border-base-content/10 hover:border-base-content/25 transition-colors"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.5} />
            {isEs ? "Cerrar sesión" : "Sign out"}
          </button>
        </div>
      </div>
    );
  }

  // ─── Unauthenticated — login form ────────────────────────
  return (
    <div className="min-h-dvh bg-base-100 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center p-6">
        <Link
          href={`/${lang}/shop`}
          className="flex items-center gap-2 text-base-content/50 hover:text-base-content transition-colors"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
          <span className="text-xs tracking-widest uppercase">
            {isEs ? "Volver a tienda" : "Back to shop"}
          </span>
        </Link>
      </div>

      {/* Centered form */}
      <div className="flex-1 flex items-center justify-center px-6 pb-16">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="flex justify-center mb-10">
            <div className="logo-stack grid">
              <Image
                src="/images/logo.svg"
                alt="Magnolia Once"
                width={180}
                height={36}
                className="logo-dark h-8 w-auto"
              />
              <Image
                src="/images/logo-light.svg"
                alt="Magnolia Once"
                width={180}
                height={36}
                className="logo-light h-8 w-auto"
              />
            </div>
          </div>

          {/* Heading */}
          <div className="text-center mb-8">
            <h1 className="text-2xl tracking-widest uppercase">
              {isEs ? "Bienvenida" : "Welcome"}
            </h1>
            <p className="text-base-content/50 text-sm mt-2">
              {isEs
                ? "Inicia sesión para acceder a tu cuenta"
                : "Sign in to access your account"}
            </p>
          </div>

          {/* Promo badge */}
          <div className="flex justify-center mb-6">
            <span className="flex items-center gap-1.5 text-xs tracking-widest uppercase text-base-content/50 px-3 py-1.5 border border-base-content/10">
              <Ticket className="h-3 w-3" strokeWidth={1.5} />
              {isEs
                ? "30% de descuento en tu primera compra"
                : "30% off your first purchase"}
            </span>
          </div>

          {/* Error */}
          {error && (
            <div role="alert" className="border border-error/30 bg-error/5 text-error text-sm px-4 py-3 mb-6">
              {isEs
                ? "Ocurrió un error al iniciar sesión. Intenta de nuevo."
                : "An error occurred while signing in. Please try again."}
            </div>
          )}

          {/* OAuth buttons */}
          <div className="flex flex-col gap-3">
            {/* Google */}
            <button
              onClick={() => handleOAuthLogin("google")}
              disabled={signingIn !== null}
              className="flex items-center justify-center gap-3 w-full h-12 text-sm border border-base-content/15 bg-base-100 hover:bg-base-200/50 text-base-content transition-colors disabled:opacity-40"
            >
              {signingIn === "google" ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                <svg
                  aria-label="Google logo"
                  width="18"
                  height="18"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 512 512"
                >
                  <g>
                    <path d="m0 0H512V512H0" fill="#fff" />
                    <path
                      fill="#34a853"
                      d="M153 292c30 82 118 95 171 60h62v48A192 192 0 0190 341"
                    />
                    <path
                      fill="#4285f4"
                      d="m386 400a140 175 0 0053-179H260v74h102q-7 37-38 57"
                    />
                    <path
                      fill="#fbbc02"
                      d="m90 341a208 200 0 010-171l63 49q-12 37 0 73"
                    />
                    <path
                      fill="#ea4335"
                      d="m153 219c22-69 116-109 179-50l55-54c-78-75-230-72-297 55"
                    />
                  </g>
                </svg>
              )}
              {isEs ? "Continuar con Google" : "Continue with Google"}
            </button>

            {/* Apple */}
            <button
              onClick={() => handleOAuthLogin("apple")}
              disabled={signingIn !== null}
              className="flex items-center justify-center gap-3 w-full h-12 text-sm bg-base-content text-base-100 hover:bg-base-content/90 transition-colors disabled:opacity-40"
            >
              {signingIn === "apple" ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                <svg
                  aria-label="Apple logo"
                  width="18"
                  height="18"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 1195 1195"
                >
                  <path
                    fill="currentColor"
                    d="M1006.933 812.8c-32 153.6-115.2 211.2-147.2 249.6-32 25.6-121.6 25.6-153.6 6.4-38.4-25.6-134.4-25.6-166.4 0-44.8 32-115.2 19.2-128 12.8-256-179.2-352-716.8 12.8-774.4 64-12.8 134.4 32 134.4 32 51.2 25.6 70.4 12.8 115.2-6.4 96-44.8 243.2-44.8 313.6 76.8-147.2 96-153.6 294.4 19.2 403.2zM802.133 64c12.8 70.4-64 224-204.8 230.4-12.8-38.4 32-217.6 204.8-230.4z"
                  />
                </svg>
              )}
              {isEs ? "Continuar con Apple" : "Continue with Apple"}
            </button>

            {/* Facebook */}
            <button
              onClick={() => handleOAuthLogin("facebook")}
              disabled={signingIn !== null}
              className="flex items-center justify-center gap-3 w-full h-12 text-sm bg-[#1877F2] text-white hover:bg-[#166FE5] transition-colors disabled:opacity-40"
            >
              {signingIn === "facebook" ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                <svg
                  aria-label="Facebook logo"
                  width="18"
                  height="18"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 32 32"
                >
                  <path
                    fill="white"
                    d="M8 12h5V8c0-6 4-7 11-6v5c-4 0-5 0-5 3v2h5l-1 6h-4v12h-6V18H8z"
                  />
                </svg>
              )}
              {isEs ? "Continuar con Facebook" : "Continue with Facebook"}
            </button>
          </div>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 border-t border-base-content/10" />
            <span className="text-xs text-base-content/30 tracking-widest uppercase">
              {isEs ? "O" : "OR"}
            </span>
            <div className="flex-1 border-t border-base-content/10" />
          </div>

          <Link
            href={`/${lang}/shop`}
            className="flex items-center justify-center w-full py-3 text-sm tracking-widest uppercase text-base-content/50 hover:text-base-content border border-base-content/10 hover:border-base-content/25 transition-colors"
          >
            {isEs ? "Explorar como invitado" : "Browse as guest"}
          </Link>

          <p className="text-center text-xs text-base-content/40 mt-8 leading-relaxed">
            {isEs ? (
              <>
                Al continuar, aceptas nuestros{" "}
                <Link
                  href={`/${lang}/terms`}
                  className="underline underline-offset-2 hover:text-base-content transition-colors"
                >
                  Términos de Servicio
                </Link>{" "}
                y{" "}
                <Link
                  href={`/${lang}/privacy`}
                  className="underline underline-offset-2 hover:text-base-content transition-colors"
                >
                  Política de Privacidad
                </Link>
                .
              </>
            ) : (
              <>
                By continuing, you agree to our{" "}
                <Link
                  href={`/${lang}/terms`}
                  className="underline underline-offset-2 hover:text-base-content transition-colors"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href={`/${lang}/privacy`}
                  className="underline underline-offset-2 hover:text-base-content transition-colors"
                >
                  Privacy Policy
                </Link>
                .
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh bg-base-100 flex flex-col items-center justify-center px-6">
          <div className="w-full max-w-sm space-y-6">
            <div className="flex justify-center">
              <div className="skeleton h-8 w-40" />
            </div>
            <div className="space-y-2 flex flex-col items-center">
              <div className="skeleton h-7 w-36" />
              <div className="skeleton h-3.5 w-56" />
            </div>
            <div className="space-y-3 pt-4">
              <div className="skeleton h-12 w-full" />
              <div className="skeleton h-12 w-full" />
              <div className="skeleton h-12 w-full" />
            </div>
          </div>
        </div>
      }
    >
      <LoginPageInner params={params} />
    </Suspense>
  );
}

function LoginPageInner({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  return <LoginForm lang={lang} />;
}

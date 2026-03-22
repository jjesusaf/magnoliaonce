"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { X, Ticket } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { createClient } from "@/lib/supabase/client";
import { getImageUrl } from "@/lib/storage";

const STORAGE_KEY = "magnolia_promo_dismissed";
const BUCKET = "magnolia";
const PROMO_IMAGE = "hero/IMG_9196.jpeg";

type Provider = "google" | "apple" | "facebook";

type Props = {
  lang: string;
};

export function PromoModal({ lang }: Props) {
  const { user, loading } = useAuth();
  const [show, setShow] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [signingIn, setSigningIn] = useState<Provider | null>(null);
  const isEs = lang === "es";

  useEffect(() => {
    if (loading) return;
    if (user) return;
    // Check localStorage with 24h expiration
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed) {
      const expiry = Number(dismissed);
      if (Date.now() < expiry) return;
      localStorage.removeItem(STORAGE_KEY);
    }
    const timer = setTimeout(() => setShow(true), 800);
    return () => clearTimeout(timer);
  }, [user, loading]);

  function dismiss() {
    setShow(false);
    // Store timestamp 24h from now
    const expiry = Date.now() + 24 * 60 * 60 * 1000;
    localStorage.setItem(STORAGE_KEY, String(expiry));
  }

  async function handleOAuthLogin(provider: Provider) {
    setSigningIn(provider);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/${lang}/shop`,
      },
    });
  }

  if (!show) return null;

  const imageUrl = getImageUrl(BUCKET, PROMO_IMAGE, {
    width: 600,
    height: 800,
    resize: "cover",
  });

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-0 lg:p-8"
      onClick={dismiss}
    >
      <div
        className="relative bg-base-100 w-full h-full lg:h-auto lg:max-w-3xl lg:max-h-[90vh] flex flex-col lg:flex-row overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 z-10 p-2 bg-base-100/80 backdrop-blur-sm hover:bg-base-200 transition-colors lg:bg-transparent"
          aria-label="Close"
        >
          <X className="h-5 w-5" strokeWidth={1.5} />
        </button>

        {/* Image — hidden on mobile when login is showing */}
        {imageUrl && (
          <div className={`relative w-full lg:w-1/2 h-[40vh] lg:h-auto lg:min-h-[500px] shrink-0 ${showLogin ? "hidden lg:block" : ""}`}>
            <Image
              src={imageUrl}
              alt="Magnolia Once"
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 50vw, 100vw"
              priority
            />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 lg:px-12 text-center">
          {!showLogin ? (
            <>
              {/* Promo content */}
              <div className="flex items-center gap-2 mb-4">
                <Ticket className="h-4 w-4 text-base-content/50" strokeWidth={1.5} />
                <span className="text-xs tracking-[0.2em] uppercase text-base-content/50">
                  {isEs ? "Oferta exclusiva" : "Exclusive offer"}
                </span>
              </div>

              <h2 className="text-3xl lg:text-4xl tracking-widest uppercase leading-tight">
                {isEs ? "30% DE DESCUENTO" : "30% OFF"}
              </h2>

              <p className="text-base-content/60 mt-3 text-sm lg:text-base">
                {isEs
                  ? "En tu primera compra de arreglos florales"
                  : "Your first order of floral arrangements"}
              </p>

              <button
                onClick={() => setShowLogin(true)}
                className="w-full max-w-xs mt-8 py-3.5 text-sm tracking-widest uppercase bg-base-content text-base-100 hover:bg-base-content/90 transition-colors"
              >
                {isEs ? "Obtener 30% de descuento" : "Get 30% Off"}
              </button>

              <button
                onClick={dismiss}
                className="mt-4 text-sm tracking-widest uppercase text-base-content/40 hover:text-base-content/70 transition-colors"
              >
                {isEs ? "No, gracias" : "No, thanks"}
              </button>

              <p className="text-[11px] text-base-content/30 mt-8 max-w-xs leading-relaxed">
                {isEs
                  ? "Al registrarte obtienes un cupón de 30% de descuento en tu primera compra. Sujeto a disponibilidad."
                  : "Sign up to get a 30% discount coupon on your first purchase. Subject to availability."}
              </p>
            </>
          ) : (
            <>
              {/* Login form inline */}
              <div className="w-full max-w-sm">
                <div className="flex justify-center mb-6">
                  <div className="logo-stack grid">
                    <Image
                      src="/images/logo.svg"
                      alt="Magnolia Once"
                      width={160}
                      height={32}
                      className="logo-dark h-7 w-auto"
                    />
                    <Image
                      src="/images/logo-light.svg"
                      alt="Magnolia Once"
                      width={160}
                      height={32}
                      className="logo-light h-7 w-auto"
                    />
                  </div>
                </div>

                <h2 className="text-xl tracking-widest uppercase mb-2">
                  {isEs ? "Crear cuenta" : "Create account"}
                </h2>
                <p className="text-sm text-base-content/50 mb-6">
                  {isEs
                    ? "Regístrate para obtener tu 30% de descuento"
                    : "Sign up to get your 30% off"}
                </p>

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
                      <svg aria-label="Google logo" width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                        <g>
                          <path d="m0 0H512V512H0" fill="#fff" />
                          <path fill="#34a853" d="M153 292c30 82 118 95 171 60h62v48A192 192 0 0190 341" />
                          <path fill="#4285f4" d="m386 400a140 175 0 0053-179H260v74h102q-7 37-38 57" />
                          <path fill="#fbbc02" d="m90 341a208 200 0 010-171l63 49q-12 37 0 73" />
                          <path fill="#ea4335" d="m153 219c22-69 116-109 179-50l55-54c-78-75-230-72-297 55" />
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
                      <svg aria-label="Apple logo" width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1195 1195">
                        <path fill="currentColor" d="M1006.933 812.8c-32 153.6-115.2 211.2-147.2 249.6-32 25.6-121.6 25.6-153.6 6.4-38.4-25.6-134.4-25.6-166.4 0-44.8 32-115.2 19.2-128 12.8-256-179.2-352-716.8 12.8-774.4 64-12.8 134.4 32 134.4 32 51.2 25.6 70.4 12.8 115.2-6.4 96-44.8 243.2-44.8 313.6 76.8-147.2 96-153.6 294.4 19.2 403.2zM802.133 64c12.8 70.4-64 224-204.8 230.4-12.8-38.4 32-217.6 204.8-230.4z" />
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
                      <svg aria-label="Facebook logo" width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
                        <path fill="white" d="M8 12h5V8c0-6 4-7 11-6v5c-4 0-5 0-5 3v2h5l-1 6h-4v12h-6V18H8z" />
                      </svg>
                    )}
                    {isEs ? "Continuar con Facebook" : "Continue with Facebook"}
                  </button>
                </div>

                <button
                  onClick={() => setShowLogin(false)}
                  className="mt-6 text-sm tracking-widest uppercase text-base-content/40 hover:text-base-content/70 transition-colors"
                >
                  {isEs ? "Volver" : "Back"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

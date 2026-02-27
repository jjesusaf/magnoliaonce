"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ShoppingBag, Sparkles, ChevronRight } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/i18n-helpers";
import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/i18n";

type Order = {
  id: string;
  external_reference: string;
  status: string;
  total: number;
  currency: string;
  created_at: string;
};

type OrdersDict = {
  title: string;
  empty: string;
  total: string;
  viewOrders: string;
  backToShop: string;
  loginRequired: string;
  loginCta: string;
};

/* ─── Skeleton card ─── */
function SkeletonCard() {
  return (
    <div className="border border-base-content/10 p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="skeleton h-3.5 w-40" />
          <div className="skeleton h-3 w-28" />
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="skeleton h-4 w-16" />
          <div className="skeleton size-4" />
        </div>
      </div>
    </div>
  );
}

/* ─── Main content ─── */
function OrdersContent({ lang }: { lang: string }) {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [dict, setDict] = useState<OrdersDict | null>(null);
  const isEs = lang === "es";

  useEffect(() => {
    getDictionary(lang as Locale).then((d) => setDict(d.orders));
  }, [lang]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }

    const supabase = createClient();
    supabase
      .from("orders")
      .select("id, external_reference, status, total, currency, created_at")
      .eq("user_id", user.id)
      .eq("status", "paid")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setOrders(data as Order[]);
        setLoading(false);
      });
  }, [user, authLoading]);

  if (!dict) return null;

  /* ─── Loading ─── */
  if (authLoading || loading) {
    return (
      <div className="min-h-dvh bg-base-100 flex flex-col">
        <header className="sticky top-0 z-40 bg-base-100/80 backdrop-blur-xl border-b border-base-content/10">
          <div className="max-w-2xl mx-auto flex items-center gap-4 px-4 sm:px-6 py-3">
            <div className="p-1.5">
              <ArrowLeft className="h-4 w-4 text-transparent" strokeWidth={1.5} />
            </div>
            <div className="logo-stack grid">
              <Image src="/images/logo.svg" alt="Magnolia Once" width={120} height={24} className="logo-dark h-5 w-auto" />
              <Image src="/images/logo-light.svg" alt="Magnolia Once" width={120} height={24} className="logo-light h-5 w-auto" />
            </div>
          </div>
        </header>
        <main className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <div className="skeleton h-7 sm:h-8 w-40 mb-6 sm:mb-8" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </main>
      </div>
    );
  }

  /* ─── Not authenticated ─── */
  if (!user) {
    return (
      <div className="min-h-dvh bg-base-100 flex flex-col items-center justify-center px-6 text-center">
        <div className="relative mb-8">
          <div className="w-28 h-28 rounded-full bg-primary/10 flex items-center justify-center">
            <ShoppingBag className="h-12 w-12 text-primary/60" />
          </div>
          <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-secondary" />
          </div>
        </div>
        <h1 className="text-2xl lg:text-3xl tracking-widest uppercase mb-3">
          {dict.loginRequired}
        </h1>
        <p className="text-base-content/50 text-sm max-w-sm mb-8 leading-relaxed">
          {isEs
            ? "Inicia sesion para ver tu historial de pedidos"
            : "Sign in to view your order history"}
        </p>
        <Link href={`/${lang}/login`} className="btn btn-primary px-8">
          {dict.loginCta}
        </Link>
        <Link
          href={`/${lang}/shop`}
          className="btn btn-ghost btn-sm mt-4 gap-2 text-base-content/50"
        >
          <ArrowLeft className="h-4 w-4" />
          {dict.backToShop}
        </Link>
      </div>
    );
  }

  /* ─── Authenticated — Orders list ─── */
  return (
    <div className="min-h-dvh bg-base-100 flex flex-col">
      {/* Sticky header */}
      <header className="sticky top-0 z-40 bg-base-100/80 backdrop-blur-xl border-b border-base-content/10">
        <div className="max-w-2xl mx-auto flex items-center gap-4 px-4 sm:px-6 py-3">
          <Link
            href={`/${lang}/shop`}
            className="p-1.5 hover:opacity-60 transition-opacity"
            aria-label={isEs ? "Volver" : "Back"}
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
          </Link>
          <div className="logo-stack grid">
            <Image src="/images/logo.svg" alt="Magnolia Once" width={120} height={24} className="logo-dark h-5 w-auto" />
            <Image src="/images/logo-light.svg" alt="Magnolia Once" width={120} height={24} className="logo-light h-5 w-auto" />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <h1 className="text-xl sm:text-2xl tracking-widest uppercase mb-6 sm:mb-8">
          {dict.title}
        </h1>

        {orders.length === 0 ? (
          /* ─── Empty state ─── */
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-24 h-24 rounded-full bg-base-200 flex items-center justify-center mb-8">
              <ShoppingBag className="h-10 w-10 text-base-content/15" />
            </div>
            <p className="text-sm text-base-content/50 mb-6">{dict.empty}</p>
            <Link
              href={`/${lang}/shop`}
              className="btn btn-primary btn-sm gap-2 px-6"
            >
              <ArrowLeft className="h-4 w-4" />
              {dict.backToShop}
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const dateStr = new Date(order.created_at).toLocaleDateString(
                isEs ? "es-MX" : "en-US",
                { day: "numeric", month: "long", year: "numeric" }
              );
              return (
                <Link
                  key={order.id}
                  href={`/${lang}/orders/${order.external_reference}`}
                  className="block border border-base-content/10 p-4 sm:p-5 hover:border-base-content/20 transition-colors group"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm tracking-widest uppercase truncate font-mono">
                        {order.external_reference}
                      </p>
                      <p className="text-xs text-base-content/40 mt-1">
                        {dateStr}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-sm sm:text-base">
                        {formatPrice(order.total, order.currency)}
                      </span>
                      <ChevronRight className="h-4 w-4 text-base-content/30 group-hover:text-base-content/60 transition-colors" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default function OrdersPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  return <OrdersContent lang={lang} />;
}

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { getDictionary } from "@/lib/dictionaries";
import { Locale } from "@/lib/i18n";
import { CheckoutClient } from "@/components/shop/checkout-client";

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  return (
    <div className="min-h-dvh bg-base-100 flex flex-col">
      {/* Sticky header */}
      <header className="sticky top-0 z-40 bg-base-100/80 backdrop-blur-xl border-b border-base-content/10">
        <div className="max-w-3xl mx-auto flex items-center gap-4 px-6 py-3">
          <Link
            href={`/${lang}/shop`}
            className="p-1.5 hover:opacity-60 transition-opacity"
            aria-label={lang === "es" ? "Volver a la tienda" : "Back to shop"}
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

      {/* Page content */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-10 md:py-14">
        <CheckoutClient lang={lang} dict={dict.checkout} />
      </main>
    </div>
  );
}

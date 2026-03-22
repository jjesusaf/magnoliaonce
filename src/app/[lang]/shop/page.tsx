import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";
import { ShopHero } from "@/components/layouts/shop-hero";
import { ShopFooter } from "@/components/layouts/shop-footer";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://magnoliaonce.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  return {
    title: lang === "es"
      ? "Tienda — Magnolia Once"
      : "Shop — Magnolia Once",
    description: lang === "es"
      ? "Explora nuestra colección de arreglos florales, ramos y diseño floral para eventos. Estudio floral contemporáneo."
      : "Explore our collection of floral arrangements, bouquets, and event floral design. Contemporary floral studio.",
    alternates: {
      languages: { es: `${siteUrl}/es/shop`, en: `${siteUrl}/en/shop` },
      canonical: `${siteUrl}/${lang}/shop`,
    },
  };
}

export default async function ShopPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  return (
    <>
      {/* Desktop: fit viewport no scroll / Mobile: scroll + padding for fixed footer */}
      <main className="pt-16 pb-28 lg:pb-0 min-h-dvh lg:h-dvh lg:max-h-dvh flex flex-col lg:overflow-hidden">
        <ShopHero lang={lang} />
        <ShopFooter lang={lang} dict={dict.footer} />
      </main>
    </>
  );
}

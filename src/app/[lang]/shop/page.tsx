import type { Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";
import { ShopHero } from "@/components/layouts/shop-hero";
import { ShopFooter } from "@/components/layouts/shop-footer";

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
      <main className="pt-16 pb-28 lg:pb-0 lg:h-dvh lg:overflow-hidden flex flex-col">
        <ShopHero lang={lang} />
        <ShopFooter lang={lang} dict={dict.footer} />
      </main>
    </>
  );
}

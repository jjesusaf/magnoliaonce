import type { Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";
import { ShopNavbar } from "@/components/layouts/shop-navbar";
import { PromoModal } from "@/components/shop/promo-modal";

export default async function ShopLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  return (
    <>
      <ShopNavbar lang={lang} nav={dict.nav} cartDict={dict.cart}>
        {children}
      </ShopNavbar>
      <PromoModal lang={lang} />
    </>
  );
}

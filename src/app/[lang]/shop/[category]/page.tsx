import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";
import { getCategory, getProductsByCategory } from "@/lib/queries";
import { localized } from "@/lib/i18n-helpers";
import { ProductCard } from "@/components/shop/product-card";
import { FavoriteButton } from "@/components/shop/favorite-button";
import { ShopFooter } from "@/components/layouts/shop-footer";

type Props = {
  params: Promise<{ lang: string; category: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, category: slug } = await params;
  const cat = await getCategory(slug);
  if (!cat) return {};
  return {
    title: localized(cat, "name", lang) + " — Magnolia Once",
  };
}

export default async function CategoryPage({ params }: Props) {
  const { lang, category: slug } = await params;
  const dict = await getDictionary(lang as Locale);

  const category = await getCategory(slug);
  if (!category) notFound();

  const products = await getProductsByCategory(category.id);
  const categoryName = localized(category, "name", lang);
  const categoryDesc = localized(category, "description", lang);

  return (
    <main className="pt-16 pb-28 lg:pb-0 flex flex-col min-h-dvh">
      {/* Header section */}
      <section className="px-6 pt-10 pb-6 lg:px-16 lg:pt-14 lg:pb-8 flex flex-col gap-6">
        {/* Breadcrumbs */}
        <div className="breadcrumbs text-sm">
          <ul>
            <li>
              <Link
                href={`/${lang}/shop`}
                className="tracking-widest uppercase text-base-content/60 hover:text-base-content transition-colors"
              >
                {dict.nav.shop}
              </Link>
            </li>
            <li>
              <span className="tracking-widest uppercase text-base-content">
                {categoryName}
              </span>
            </li>
          </ul>
        </div>

        {/* Category title */}
        <h1 className="text-3xl lg:text-4xl tracking-widest uppercase">
          {categoryName}
        </h1>

        {/* Category description */}
        {categoryDesc && (
          <p className="text-sm lg:text-base leading-relaxed tracking-wide uppercase text-base-content/70 max-w-3xl">
            {categoryDesc}
          </p>
        )}
      </section>

      {/* Product grid */}
      <section className="flex-1 px-4 pb-8 lg:px-16 lg:pb-12">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {products.map((product) => (
            <div key={product.id} className="relative group">
              <ProductCard
                product={product}
                categorySlug={slug}
                lang={lang}
                fromLabel={dict.shop.from}
              />
              <FavoriteButton
                productId={product.id}
                lang={lang}
                variant="card"
              />
            </div>
          ))}
        </div>

        {products.length === 0 && (
          <p className="text-center text-base-content/60 py-16">
            {lang === "es" ? "Próximamente" : "Coming soon"}
          </p>
        )}
      </section>

      <ShopFooter lang={lang} dict={dict.footer} />
    </main>
  );
}

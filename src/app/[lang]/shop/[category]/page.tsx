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

  return (
    <main className="pt-16 pb-28 lg:pb-0 flex flex-col min-h-dvh">
      <section className="flex-1 px-6 py-8 lg:px-16 lg:py-12">
        {/* Breadcrumbs */}
        <div className="breadcrumbs text-sm mb-8">
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
        <h1 className="text-2xl lg:text-3xl tracking-widest uppercase mb-8 lg:mb-12">
          {categoryName}
        </h1>

        {/* Product grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
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

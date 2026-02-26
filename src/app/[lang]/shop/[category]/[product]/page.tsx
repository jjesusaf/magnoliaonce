import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";
import { getCategory, getProductBySlug } from "@/lib/queries";
import { localized } from "@/lib/i18n-helpers";
import { getImageUrl } from "@/lib/storage";
import { ProductGallery } from "@/components/shop/product-gallery";
import { VariantPicker } from "@/components/shop/variant-picker";
import { FavoriteButton } from "@/components/shop/favorite-button";
import { ShopFooter } from "@/components/layouts/shop-footer";

const BUCKET = "magnolia";

type Props = {
  params: Promise<{ lang: string; category: string; product: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, product: slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  const name = localized(product, "name", lang);
  const description = localized(product, "description", lang);
  return {
    title: `${name} — Magnolia Once`,
    description: description || undefined,
  };
}

export default async function ProductPage({ params }: Props) {
  const { lang, category: catSlug, product: productSlug } = await params;
  const dict = await getDictionary(lang as Locale);

  const [category, product] = await Promise.all([
    getCategory(catSlug),
    getProductBySlug(productSlug),
  ]);

  if (!product || !product.is_active) notFound();

  const productName = localized(product, "name", lang);
  const categoryName = category ? localized(category, "name", lang) : catSlug;
  const description = localized(product, "description", lang);

  // Build gallery images with URLs (4:5 portrait ratio)
  const galleryImages = (product.product_images ?? []).map((img) => ({
    id: img.id,
    url: getImageUrl(BUCKET, img.storage_path, { width: 800, height: 1000, resize: "cover" }) ?? "",
    fullUrl: getImageUrl(BUCKET, img.storage_path, { width: 1200, height: 1500, resize: "contain" }) ?? "",
    thumbUrl: getImageUrl(BUCKET, img.storage_path, { width: 200, height: 250, resize: "cover" }) ?? "",
    alt: localized(img, "alt", lang) || productName,
  }));

  return (
    <main className="pt-16 pb-28 lg:pb-0 flex flex-col min-h-dvh">
      <section className="flex-1 px-4 py-8 md:px-8 lg:px-12 lg:py-10">
        {/* Product layout — two columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 max-w-7xl mx-auto">
          {/* Left: Gallery */}
          <div className="md:sticky md:top-24 md:self-start">
            <ProductGallery images={galleryImages} />
          </div>

          {/* Right: Details */}
          <div className="flex flex-col gap-5 md:pt-2">
            {/* Breadcrumbs */}
            <div className="breadcrumbs text-sm">
              <ul>
                <li>
                  <Link
                    href={`/${lang}/shop`}
                    className="tracking-widest uppercase text-base-content/50 hover:text-base-content transition-colors"
                  >
                    {dict.nav.shop}
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/${lang}/shop/${catSlug}`}
                    className="tracking-widest uppercase text-base-content/50 hover:text-base-content transition-colors"
                  >
                    {categoryName}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Title + favorite */}
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-2xl lg:text-3xl tracking-widest uppercase leading-tight">
                {productName}
              </h1>
              <FavoriteButton
                productId={product.id}
                lang={lang}
                variant="detail"
              />
            </div>

            {/* Description */}
            {description && (
              <p className="text-base-content/70 leading-relaxed">
                {description}
              </p>
            )}

            {/* Variants + Add to cart */}
            <VariantPicker
              variants={product.product_variants ?? []}
              lang={lang}
              dict={dict.shop}
              addedLabel={dict.cart.added}
              productId={product.id}
              productName={productName}
              imageUrl={galleryImages[0]?.url ?? ""}
              categorySlug={catSlug}
            />

            {/* Back link */}
            <Link
              href={`/${lang}/shop/${catSlug}`}
              className="text-sm tracking-widest uppercase text-base-content/50 hover:text-base-content transition-colors mt-2"
            >
              &larr; {dict.shop.backToCollection}
            </Link>
          </div>
        </div>
      </section>

      <ShopFooter lang={lang} dict={dict.footer} />
    </main>
  );
}

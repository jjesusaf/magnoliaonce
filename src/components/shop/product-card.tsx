import Image from "next/image";
import Link from "next/link";
import { getImageUrl } from "@/lib/storage";
import { localized, formatPrice, currencyForLang } from "@/lib/i18n-helpers";

const BUCKET = "magnolia";

type Props = {
  product: {
    slug: string;
    name_es: string;
    name_en: string;
    product_images: { storage_path: string; alt_es: string | null; alt_en: string | null }[];
    product_variants: { price: number; currency: string }[];
  };
  categorySlug: string;
  lang: string;
  fromLabel: string;
};

export function ProductCard({ product, categorySlug, lang, fromLabel }: Props) {
  const name = localized(product, "name", lang);
  const image = product.product_images[0];
  const imageUrl = image ? getImageUrl(BUCKET, image.storage_path, { width: 600, height: 800, resize: "cover" }) : null;
  const alt = image ? localized(image, "alt", lang) || name : name;

  // Filter variants by lang currency and find the cheapest
  const currency = currencyForLang(lang);
  const langVariants = product.product_variants.filter((v) => v.currency === currency);
  const cheapest = langVariants.length
    ? langVariants.reduce((min, v) => (v.price < min.price ? v : min))
    : null;

  return (
    <Link
      href={`/${lang}/shop/${categorySlug}/${product.slug}`}
      className="group flex flex-col"
    >
      <div className="aspect-3/4 w-full overflow-hidden bg-base-200">
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={alt}
            width={600}
            height={800}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
      </div>
      <div className="mt-3 space-y-1">
        <h3 className="text-sm tracking-widest uppercase text-base-content/80 group-hover:text-base-content transition-colors">
          {name}
        </h3>
        {cheapest && (
          <p className="text-sm text-base-content/60">
            {fromLabel} {formatPrice(cheapest.price, cheapest.currency)}
          </p>
        )}
      </div>
    </Link>
  );
}

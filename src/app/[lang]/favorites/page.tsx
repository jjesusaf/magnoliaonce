"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useFavorites } from "@/lib/favorites-context";
import { createClient } from "@/lib/supabase/client";
import { FavoriteButton } from "@/components/shop/favorite-button";
import { getImageUrl } from "@/lib/storage";
import { localized, formatPrice, currencyForLang } from "@/lib/i18n-helpers";

const BUCKET = "magnolia";

type FavoriteProduct = {
  id: string;
  slug: string;
  name_es: string;
  name_en: string;
  category_id: string;
  product_images: {
    storage_path: string;
    alt_es: string | null;
    alt_en: string | null;
  }[];
  product_variants: { price: number; currency: string }[];
  categories: { slug: string } | null;
};

function FavoritesContent({ lang }: { lang: string }) {
  const { user, loading: authLoading } = useAuth();
  const { count } = useFavorites();
  const [products, setProducts] = useState<FavoriteProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const isEs = lang === "es";

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }

    const supabase = createClient();
    supabase
      .from("favorites")
      .select(
        "product_id, products(id, slug, name_es, name_en, category_id, product_images!inner(storage_path, alt_es, alt_en, is_primary), product_variants(price, currency), categories(slug))"
      )
      .eq("user_id", user.id)
      .eq("products.product_images.is_primary", true)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) {
          const items = data
            .map((row: Record<string, unknown>) => row.products as FavoriteProduct | null)
            .filter((p): p is FavoriteProduct => p !== null);
          setProducts(items);
        }
        setLoading(false);
      });
    // refetch when favorites count changes (toggle)
  }, [user, authLoading, count]);

  if (authLoading || loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-base-100">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-dvh bg-base-100 flex flex-col items-center justify-center px-6 text-center">
        <Heart className="h-12 w-12 text-base-content/20 mb-4" />
        <h1 className="text-xl font-semibold mb-2">
          {isEs ? "Inicia sesion para ver tus favoritos" : "Sign in to view your favorites"}
        </h1>
        <p className="text-base-content/50 text-sm mb-6">
          {isEs
            ? "Guarda tus productos favoritos para encontrarlos facilmente"
            : "Save your favorite products to find them easily"}
        </p>
        <Link href={`/${lang}/login`} className="btn btn-primary">
          {isEs ? "Iniciar sesion" : "Sign in"}
        </Link>
      </div>
    );
  }

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
                {isEs ? "Tienda" : "Shop"}
              </Link>
            </li>
            <li>
              <span className="tracking-widest uppercase text-base-content">
                {isEs ? "Favoritos" : "Favorites"}
              </span>
            </li>
          </ul>
        </div>

        <h1 className="text-2xl lg:text-3xl tracking-widest uppercase mb-8 lg:mb-12">
          {isEs ? "Mis favoritos" : "My favorites"}
        </h1>

        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Heart className="h-12 w-12 text-base-content/15 mb-4" />
            <p className="text-base-content/50 mb-1">
              {isEs ? "Aun no tienes favoritos" : "No favorites yet"}
            </p>
            <p className="text-base-content/30 text-sm mb-6">
              {isEs
                ? "Toca el corazon en cualquier producto para guardarlo aqui"
                : "Tap the heart on any product to save it here"}
            </p>
            <Link
              href={`/${lang}/shop`}
              className="btn btn-ghost btn-sm gap-2 text-base-content/60"
            >
              <ArrowLeft className="h-4 w-4" />
              {isEs ? "Explorar tienda" : "Browse shop"}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {products.map((product) => {
              const name = localized(product, "name", lang);
              const image = product.product_images[0];
              const imageUrl = image
                ? getImageUrl(BUCKET, image.storage_path, {
                    width: 600,
                    height: 600,
                    resize: "cover",
                  })
                : null;
              const alt = image ? localized(image, "alt", lang) || name : name;
              const currency = currencyForLang(lang);
              const langVariants = product.product_variants.filter(
                (v) => v.currency === currency
              );
              const cheapest = langVariants.length
                ? langVariants.reduce((min, v) =>
                    v.price < min.price ? v : min
                  )
                : null;
              const catSlug = product.categories?.slug ?? "";

              return (
                <div key={product.id} className="relative group">
                  <Link
                    href={`/${lang}/shop/${catSlug}/${product.slug}`}
                    className="group flex flex-col"
                  >
                    <div className="aspect-square w-full overflow-hidden bg-base-200">
                      {imageUrl && (
                        <Image
                          src={imageUrl}
                          alt={alt}
                          width={600}
                          height={600}
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
                          {isEs ? "Desde" : "From"}{" "}
                          {formatPrice(cheapest.price, cheapest.currency)}
                        </p>
                      )}
                    </div>
                  </Link>
                  <FavoriteButton
                    productId={product.id}
                    lang={lang}
                    variant="card"
                  />
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

export default function FavoritesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  return <FavoritesContent lang={lang} />;
}

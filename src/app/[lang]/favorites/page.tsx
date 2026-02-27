"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ArrowLeft, ShoppingBag, Sparkles, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useFavorites } from "@/lib/favorites-context";
import { useCart } from "@/lib/cart-context";
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
  product_variants: { id: string; price: number; currency: string; label: string }[];
  categories: { slug: string } | null;
};

/* ─── Skeleton card for loading state ─── */
function SkeletonCard() {
  return (
    <div className="flex flex-col">
      <div className="skeleton aspect-[3/4] w-full rounded-box" />
      <div className="p-3 lg:p-4 space-y-2">
        <div className="skeleton h-3 w-3/4" />
        <div className="skeleton h-4 w-1/2" />
      </div>
    </div>
  );
}

function FavoritesContent({ lang }: { lang: string }) {
  const { user, loading: authLoading } = useAuth();
  const { count, toggleFavorite } = useFavorites();
  const { addItem } = useCart();
  const [products, setProducts] = useState<FavoriteProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
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
        "product_id, products(id, slug, name_es, name_en, category_id, product_images!inner(storage_path, alt_es, alt_en, is_primary), product_variants(id, price, currency, label), categories(slug))"
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
  }, [user, authLoading, count]);

  const handleRemove = (productId: string) => {
    setRemovingId(productId);
    setTimeout(() => {
      toggleFavorite(productId);
      setRemovingId(null);
    }, 300);
  };

  const handleAddToCart = (product: FavoriteProduct) => {
    const currency = currencyForLang(lang);
    const langVariants = product.product_variants.filter(
      (v) => v.currency === currency
    );
    const variant = langVariants.length
      ? langVariants.reduce((min, v) => (v.price < min.price ? v : min))
      : null;
    if (!variant) return;

    const image = product.product_images[0];
    const imageUrl = image
      ? getImageUrl(BUCKET, image.storage_path, {
          width: 200,
          height: 200,
          resize: "cover",
        }) || ""
      : "";

    addItem({
      productId: product.id,
      variantId: variant.id,
      productName: localized(product, "name", lang),
      variantLabel: variant.label,
      price: variant.price,
      currency: variant.currency,
      imageUrl,
    });
  };

  /* ─── Loading: skeleton grid ─── */
  if (authLoading || loading) {
    return (
      <main className="pt-16 pb-28 lg:pb-0 flex flex-col min-h-dvh">
        <section className="flex-1 px-6 py-8 lg:px-16 lg:py-12">
          {/* Breadcrumbs skeleton */}
          <div className="breadcrumbs text-sm mb-6">
            <ul>
              <li><div className="skeleton h-3.5 w-14" /></li>
              <li><div className="skeleton h-3.5 w-20" /></li>
            </ul>
          </div>

          {/* Title + count skeleton */}
          <div className="mb-10 lg:mb-14 space-y-2">
            <div className="skeleton h-7 lg:h-10 w-52" />
            <div className="skeleton h-3.5 w-24" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </section>
      </main>
    );
  }

  /* ─── Not authenticated ─── */
  if (!user) {
    return (
      <main className="min-h-dvh flex flex-col items-center justify-center px-6 text-center pt-16">
        <div className="relative mb-8">
          <div className="w-28 h-28 rounded-full bg-primary/10 flex items-center justify-center">
            <Heart className="h-12 w-12 text-primary/60" />
          </div>
          <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-secondary" />
          </div>
        </div>
        <h1 className="text-2xl lg:text-3xl tracking-widest uppercase mb-3">
          {isEs ? "Tus favoritos te esperan" : "Your favorites await"}
        </h1>
        <p className="text-base-content/50 text-sm max-w-sm mb-8 leading-relaxed">
          {isEs
            ? "Inicia sesión para guardar tus productos favoritos y encontrarlos fácilmente"
            : "Sign in to save your favorite products and find them easily"}
        </p>
        <Link href={`/${lang}/login`} className="btn btn-primary px-8">
          {isEs ? "Iniciar sesión" : "Sign in"}
        </Link>
        <Link
          href={`/${lang}/shop`}
          className="btn btn-ghost btn-sm mt-4 gap-2 text-base-content/50"
        >
          <ArrowLeft className="h-4 w-4" />
          {isEs ? "Explorar tienda" : "Browse shop"}
        </Link>
      </main>
    );
  }

  /* ─── Authenticated ─── */
  return (
    <main className="pt-16 pb-28 lg:pb-0 flex flex-col min-h-dvh">
      <section className="flex-1 px-6 py-8 lg:px-16 lg:py-12">
        {/* Breadcrumbs */}
        <div className="breadcrumbs text-sm mb-6">
          <ul>
            <li>
              <Link
                href={`/${lang}/shop`}
                className="tracking-widest uppercase text-base-content/50 hover:text-base-content transition-colors"
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

        {/* Header */}
        <div className="flex items-end justify-between mb-10 lg:mb-14">
          <div>
            <h1 className="text-2xl lg:text-4xl tracking-widest uppercase">
              {isEs ? "Mis favoritos" : "My favorites"}
            </h1>
            {products.length > 0 && (
              <p className="text-base-content/40 text-sm mt-2 tracking-wide">
                {products.length}{" "}
                {isEs
                  ? products.length === 1
                    ? "producto"
                    : "productos"
                  : products.length === 1
                  ? "item"
                  : "items"}
              </p>
            )}
          </div>
          {products.length > 0 && (
            <Link
              href={`/${lang}/shop`}
              className="btn btn-ghost btn-sm gap-2 text-base-content/50 hidden sm:inline-flex"
            >
              <ArrowLeft className="h-4 w-4" />
              {isEs ? "Seguir comprando" : "Continue shopping"}
            </Link>
          )}
        </div>

        {products.length === 0 ? (
          /* ─── Empty state ─── */
          <div className="flex flex-col items-center justify-center py-16 lg:py-24 text-center">
            <div className="relative mb-8">
              <div className="w-24 h-24 rounded-full bg-base-200 flex items-center justify-center">
                <Heart className="h-10 w-10 text-base-content/15" />
              </div>
            </div>
            <h2 className="text-lg font-semibold mb-2 tracking-wide">
              {isEs ? "Aún no tienes favoritos" : "No favorites yet"}
            </h2>
            <p className="text-base-content/40 text-sm max-w-xs mb-8 leading-relaxed">
              {isEs
                ? "Toca el corazón en cualquier producto para guardarlo aquí"
                : "Tap the heart on any product to save it here"}
            </p>
            <Link
              href={`/${lang}/shop`}
              className="btn btn-primary btn-sm gap-2 px-6"
            >
              <ArrowLeft className="h-4 w-4" />
              {isEs ? "Explorar tienda" : "Browse shop"}
            </Link>
          </div>
        ) : (
          /* ─── Product grid ─── */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {products.map((product) => {
              const name = localized(product, "name", lang);
              const image = product.product_images[0];
              const imageUrl = image
                ? getImageUrl(BUCKET, image.storage_path, {
                    width: 600,
                    height: 800,
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
              const isRemoving = removingId === product.id;

              return (
                <div
                  key={product.id}
                  className={`relative group transition-all duration-300 ${
                    isRemoving ? "opacity-0 scale-95" : "opacity-100 scale-100"
                  }`}
                >
                  {/* Card */}
                  <Link
                    href={`/${lang}/shop/${catSlug}/${product.slug}`}
                    className="block rounded-box overflow-hidden bg-base-200/50 hover:shadow-lg transition-shadow duration-300"
                  >
                    {/* Image */}
                    <div className="aspect-[3/4] w-full overflow-hidden bg-base-200 relative">
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

                    {/* Info */}
                    <div className="p-3 lg:p-4 space-y-1">
                      <h3 className="text-xs lg:text-sm tracking-widest uppercase text-base-content/80 group-hover:text-base-content transition-colors line-clamp-2">
                        {name}
                      </h3>
                      {cheapest && (
                        <p className="text-sm lg:text-base font-semibold text-base-content">
                          {isEs ? "Desde " : "From "}
                          {formatPrice(cheapest.price, cheapest.currency)}
                        </p>
                      )}
                    </div>
                  </Link>

                  {/* Action buttons overlay */}
                  <div className="absolute top-2 right-2 z-10 flex flex-col gap-1">
                    {/* Favorite (remove) button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleRemove(product.id);
                      }}
                      className="btn btn-circle btn-sm bg-base-100/80 backdrop-blur-sm shadow-sm border-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label={isEs ? "Quitar de favoritos" : "Remove from favorites"}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-error/70" />
                    </button>
                  </div>

                  {/* Favorite heart - always visible */}
                  <div className="absolute top-2 left-2 z-10">
                    <Heart className="h-4 w-4 fill-red-500 text-red-500 drop-shadow-sm" />
                  </div>

                  {/* Quick add to cart */}
                  {cheapest && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleAddToCart(product);
                      }}
                      className="absolute bottom-[4.5rem] lg:bottom-[5.5rem] right-2 z-10 btn btn-circle btn-sm bg-primary text-primary-content shadow-md border-0 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-200"
                      aria-label={isEs ? "Agregar al carrito" : "Add to cart"}
                    >
                      <ShoppingBag className="h-3.5 w-3.5" />
                    </button>
                  )}
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

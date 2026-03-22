import type { MetadataRoute } from "next";
import { getSupabase } from "@/lib/supabase";
import { locales } from "@/lib/i18n";

const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://magnoliaonce.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = getSupabase();

  const [{ data: categories }, { data: products }] = await Promise.all([
    supabase.from("categories").select("slug, created_at"),
    supabase
      .from("products")
      .select("slug, category_id, created_at, categories!inner(slug)")
      .eq("is_active", true),
  ]);

  const entries: MetadataRoute.Sitemap = [];

  // Static pages per locale
  for (const lang of locales) {
    entries.push(
      {
        url: `${siteUrl}/${lang}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 1,
      },
      {
        url: `${siteUrl}/${lang}/shop`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.9,
      }
    );

    // Category pages
    for (const cat of categories ?? []) {
      entries.push({
        url: `${siteUrl}/${lang}/shop/${cat.slug}`,
        lastModified: new Date(cat.created_at),
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }

    // Product pages
    for (const product of products ?? []) {
      const catSlug = (product as unknown as { categories: { slug: string } })
        .categories.slug;
      entries.push({
        url: `${siteUrl}/${lang}/shop/${catSlug}/${product.slug}`,
        lastModified: new Date(product.created_at),
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  }

  return entries;
}

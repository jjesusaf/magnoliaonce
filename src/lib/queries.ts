import { getSupabase } from "./supabase";

export async function getCategories() {
  const { data, error } = await getSupabase()
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("getCategories error:", error);
    return [];
  }
  return data ?? [];
}

export async function getCategory(slug: string) {
  const { data, error } = await getSupabase()
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) return null;
  return data;
}

export async function getProductsByCategory(categoryId: string) {
  const { data, error } = await getSupabase()
    .from("products")
    .select(
      "*, product_images!inner(id, storage_path, alt_es, alt_en, is_primary), product_variants(id, price, currency)"
    )
    .eq("category_id", categoryId)
    .eq("is_active", true)
    .eq("product_images.is_primary", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("getProductsByCategory error:", error);
    return [];
  }
  return data ?? [];
}

export async function getProductBySlug(slug: string) {
  const { data, error } = await getSupabase()
    .from("products")
    .select(
      "*, product_images(id, storage_path, alt_es, alt_en, is_primary, sort_order), product_variants(id, label, price, currency, is_available, sku, sort_order)"
    )
    .eq("slug", slug)
    .single();

  if (error) return null;

  // Sort nested arrays
  if (data.product_images) {
    data.product_images.sort((a, b) => a.sort_order - b.sort_order);
  }
  if (data.product_variants) {
    data.product_variants.sort((a, b) => a.sort_order - b.sort_order);
  }

  return data;
}

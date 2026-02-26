"use client";

import { use, useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Upload,
  X,
  Eye,
  EyeOff,
  Star,
  Package,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { createClient } from "@/lib/supabase/client";
import { getImageUrl } from "@/lib/storage";

const BUCKET = "magnolia";

/* ─── Types ──────────────────────────────────────────────── */

type Category = {
  id: string;
  slug: string;
  name_es: string;
  name_en: string;
};

type ProductImage = {
  id: string;
  storage_path: string;
  alt_es: string | null;
  alt_en: string | null;
  is_primary: boolean;
  sort_order: number;
};

type ProductVariant = {
  id: string;
  label: string;
  price: number;
  currency: string;
  is_available: boolean;
  sku: string | null;
  sort_order: number;
};

type Product = {
  id: string;
  slug: string;
  name_es: string;
  name_en: string;
  description_es: string | null;
  description_en: string | null;
  category_id: string;
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
  product_images: ProductImage[];
  product_variants: ProductVariant[];
};

type NewVariant = {
  label: string;
  price: string;
  currency: string;
};

/* ─── Helpers ────────────────────────────────────────────── */

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/* ─── Admin Content ──────────────────────────────────────── */

function AdminContent({ lang }: { lang: string }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const isEs = lang === "es";

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Product form
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formName_es, setFormNameEs] = useState("");
  const [formName_en, setFormNameEn] = useState("");
  const [formDesc_es, setFormDescEs] = useState("");
  const [formDesc_en, setFormDescEn] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formCategoryId, setFormCategoryId] = useState("");
  const [formVariants, setFormVariants] = useState<NewVariant[]>([]);
  const [formImages, setFormImages] = useState<File[]>([]);
  const [formImagePreviews, setFormImagePreviews] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDialogElement>(null);

  // Check admin
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace(`/${lang}/login`);
      return;
    }
    const supabase = createClient();
    supabase
      .from("profiles")
      .select("is_admin")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (!data?.is_admin) {
          router.replace(`/${lang}/shop`);
          return;
        }
        setIsAdmin(true);
      });
  }, [user, authLoading, router, lang]);

  // Load categories
  useEffect(() => {
    if (!isAdmin) return;
    const supabase = createClient();
    supabase
      .from("categories")
      .select("id, slug, name_es, name_en")
      .order("sort_order")
      .then(({ data }) => {
        if (data) {
          // Filter out events
          const filtered = data.filter((c) => c.slug !== "events");
          setCategories(filtered);
          if (filtered.length > 0 && !activeCategory) {
            setActiveCategory(filtered[0].id);
          }
        }
      });
  }, [isAdmin, activeCategory]);

  // Load products
  const loadProducts = useCallback(() => {
    if (!activeCategory) return;
    setLoading(true);
    const supabase = createClient();
    supabase
      .from("products")
      .select(
        "*, product_images(id, storage_path, alt_es, alt_en, is_primary, sort_order), product_variants(id, label, price, currency, is_available, sku, sort_order)"
      )
      .eq("category_id", activeCategory)
      .order("sort_order")
      .then(({ data }) => {
        setProducts(data ?? []);
        setLoading(false);
      });
  }, [activeCategory]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Form helpers
  function resetForm() {
    setEditingProduct(null);
    setFormNameEs("");
    setFormNameEn("");
    setFormDescEs("");
    setFormDescEn("");
    setFormSlug("");
    setFormCategoryId(activeCategory);
    setFormVariants([{ label: "", price: "", currency: "MXN" }]);
    setFormImages([]);
    setFormImagePreviews([]);
    setShowForm(false);
  }

  function openNewProduct() {
    resetForm();
    setFormCategoryId(activeCategory);
    setShowForm(true);
  }

  function openEditProduct(p: Product) {
    setEditingProduct(p);
    setFormNameEs(p.name_es);
    setFormNameEn(p.name_en);
    setFormDescEs(p.description_es ?? "");
    setFormDescEn(p.description_en ?? "");
    setFormSlug(p.slug);
    setFormCategoryId(p.category_id);
    setFormVariants(
      p.product_variants.map((v) => ({
        label: v.label,
        price: String(v.price),
        currency: v.currency,
      }))
    );
    setFormImages([]);
    setFormImagePreviews([]);
    setShowForm(true);
  }

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    setFormImages((prev) => [...prev, ...files]);
    const newPreviews = files.map((f) => URL.createObjectURL(f));
    setFormImagePreviews((prev) => [...prev, ...newPreviews]);
  }

  function removeNewImage(index: number) {
    setFormImages((prev) => prev.filter((_, i) => i !== index));
    setFormImagePreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  }

  function addVariantRow() {
    setFormVariants((prev) => [
      ...prev,
      { label: "", price: "", currency: "MXN" },
    ]);
  }

  function removeVariantRow(index: number) {
    setFormVariants((prev) => prev.filter((_, i) => i !== index));
  }

  function updateVariant(
    index: number,
    field: keyof NewVariant,
    value: string
  ) {
    setFormVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v))
    );
  }

  // Auto-slug from Spanish name
  useEffect(() => {
    if (!editingProduct && formName_es) {
      setFormSlug(slugify(formName_es));
    }
  }, [formName_es, editingProduct]);

  // Save product
  async function handleSave() {
    if (!formName_es || !formName_en || !formSlug || !formCategoryId) return;
    setSaving(true);

    const supabase = createClient();

    try {
      let productId: string;

      if (editingProduct) {
        // Update existing
        const { error } = await supabase
          .from("products")
          .update({
            name_es: formName_es,
            name_en: formName_en,
            description_es: formDesc_es || null,
            description_en: formDesc_en || null,
            slug: formSlug,
            category_id: formCategoryId,
          })
          .eq("id", editingProduct.id);

        if (error) throw error;
        productId = editingProduct.id;

        // Delete old variants and re-insert
        await supabase
          .from("product_variants")
          .delete()
          .eq("product_id", productId);
      } else {
        // Insert new product
        const maxSort = products.length > 0
          ? Math.max(...products.map((p) => p.sort_order))
          : 0;

        const { data, error } = await supabase
          .from("products")
          .insert({
            name_es: formName_es,
            name_en: formName_en,
            description_es: formDesc_es || null,
            description_en: formDesc_en || null,
            slug: formSlug,
            category_id: formCategoryId,
            sort_order: maxSort + 1,
          })
          .select("id")
          .single();

        if (error) throw error;
        productId = data.id;
      }

      // Insert variants
      const validVariants = formVariants.filter(
        (v) => v.label && v.price && Number(v.price) > 0
      );
      if (validVariants.length > 0) {
        const { error: vError } = await supabase
          .from("product_variants")
          .insert(
            validVariants.map((v, i) => ({
              product_id: productId,
              label: v.label,
              price: Number(v.price),
              currency: v.currency,
              sort_order: i,
            }))
          );
        if (vError) throw vError;
      }

      // Upload images
      if (formImages.length > 0) {
        const existingCount = editingProduct?.product_images?.length ?? 0;
        for (let i = 0; i < formImages.length; i++) {
          const file = formImages[i];
          const ext = file.name.split(".").pop();
          const storagePath = `products/${productId}/${Date.now()}-${i}.${ext}`;

          const { error: uploadErr } = await supabase.storage
            .from(BUCKET)
            .upload(storagePath, file);
          if (uploadErr) throw uploadErr;

          const { error: imgErr } = await supabase
            .from("product_images")
            .insert({
              product_id: productId,
              storage_path: storagePath,
              is_primary: existingCount === 0 && i === 0,
              sort_order: existingCount + i,
            });
          if (imgErr) throw imgErr;
        }
      }

      resetForm();
      loadProducts();
    } catch (err) {
      console.error("Save error:", err);
      alert(isEs ? "Error al guardar" : "Error saving");
    } finally {
      setSaving(false);
    }
  }

  // Toggle active / featured
  async function toggleField(
    productId: string,
    field: "is_active" | "is_featured",
    current: boolean
  ) {
    const supabase = createClient();
    await supabase
      .from("products")
      .update({ [field]: !current })
      .eq("id", productId);
    loadProducts();
  }

  // Delete product
  async function deleteProduct(p: Product) {
    if (!confirm(isEs ? `Eliminar "${p.name_es}"?` : `Delete "${p.name_en}"?`))
      return;

    const supabase = createClient();

    // Delete images from storage
    for (const img of p.product_images) {
      await supabase.storage.from(BUCKET).remove([img.storage_path]);
    }

    // Delete product (cascades variants/images via FK)
    await supabase.from("product_variants").delete().eq("product_id", p.id);
    await supabase.from("product_images").delete().eq("product_id", p.id);
    await supabase.from("products").delete().eq("id", p.id);
    loadProducts();
  }

  // Delete a single image
  async function deleteImage(productId: string, img: ProductImage) {
    const supabase = createClient();
    await supabase.storage.from(BUCKET).remove([img.storage_path]);
    await supabase.from("product_images").delete().eq("id", img.id);

    // If deleted image was primary, make the next one primary
    if (img.is_primary) {
      const remaining = products
        .find((p) => p.id === productId)
        ?.product_images.filter((i) => i.id !== img.id);
      if (remaining && remaining.length > 0) {
        await supabase
          .from("product_images")
          .update({ is_primary: true })
          .eq("id", remaining[0].id);
      }
    }
    loadProducts();
  }

  // Set primary image
  async function setPrimaryImage(productId: string, imageId: string) {
    const supabase = createClient();
    // Unset all
    await supabase
      .from("product_images")
      .update({ is_primary: false })
      .eq("product_id", productId);
    // Set the one
    await supabase
      .from("product_images")
      .update({ is_primary: true })
      .eq("id", imageId);
    loadProducts();
  }

  // ─── Guards ─────────────────────────────────────────
  if (authLoading || isAdmin === null) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-base-100">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  if (!isAdmin) return null;

  const catName = (c: Category) => (isEs ? c.name_es : c.name_en);

  // ─── Render ─────────────────────────────────────────
  return (
    <div className="min-h-dvh bg-base-100">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-base-100/80 backdrop-blur-xl border-b border-base-200">
        <div className="max-w-6xl mx-auto flex items-center gap-4 px-6 py-3">
          <Link
            href={`/${lang}/shop`}
            className="btn btn-ghost btn-sm btn-circle"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-sm tracking-widest uppercase font-semibold">
            {isEs ? "Panel de administracion" : "Admin dashboard"}
          </h1>
          <div className="flex-1" />
          <button onClick={openNewProduct} className="btn btn-primary btn-sm gap-2">
            <Plus className="h-4 w-4" />
            {isEs ? "Nuevo producto" : "New product"}
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Category tabs */}
        <div role="tablist" className="tabs tabs-border mb-8">
          {categories.map((cat) => (
            <button
              key={cat.id}
              role="tab"
              className={`tab text-sm tracking-widest uppercase ${
                activeCategory === cat.id ? "tab-active font-bold" : ""
              }`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {catName(cat)}
            </button>
          ))}
        </div>

        {/* Product form (collapsible) */}
        {showForm && (
          <div className="card bg-base-200 mb-8">
            <div className="card-body gap-6">
              <div className="flex items-center justify-between">
                <h2 className="card-title text-sm tracking-widest uppercase">
                  {editingProduct
                    ? isEs
                      ? "Editar producto"
                      : "Edit product"
                    : isEs
                      ? "Nuevo producto"
                      : "New product"}
                </h2>
                <button
                  onClick={resetForm}
                  className="btn btn-ghost btn-sm btn-circle"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Names */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <fieldset className="fieldset">
                  <legend className="fieldset-legend">
                    {isEs ? "Nombre (ES)" : "Name (ES)"}
                  </legend>
                  <input
                    type="text"
                    className="input w-full"
                    value={formName_es}
                    onChange={(e) => setFormNameEs(e.target.value)}
                    placeholder="Rosa Clasica"
                  />
                </fieldset>
                <fieldset className="fieldset">
                  <legend className="fieldset-legend">
                    {isEs ? "Nombre (EN)" : "Name (EN)"}
                  </legend>
                  <input
                    type="text"
                    className="input w-full"
                    value={formName_en}
                    onChange={(e) => setFormNameEn(e.target.value)}
                    placeholder="Classic Rose"
                  />
                </fieldset>
              </div>

              {/* Slug + Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <fieldset className="fieldset">
                  <legend className="fieldset-legend">Slug</legend>
                  <input
                    type="text"
                    className="input w-full"
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                  />
                </fieldset>
                <fieldset className="fieldset">
                  <legend className="fieldset-legend">
                    {isEs ? "Categoria" : "Category"}
                  </legend>
                  <select
                    className="select w-full"
                    value={formCategoryId}
                    onChange={(e) => setFormCategoryId(e.target.value)}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {catName(c)}
                      </option>
                    ))}
                  </select>
                </fieldset>
              </div>

              {/* Descriptions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <fieldset className="fieldset">
                  <legend className="fieldset-legend">
                    {isEs ? "Descripcion (ES)" : "Description (ES)"}
                  </legend>
                  <textarea
                    className="textarea w-full"
                    rows={3}
                    value={formDesc_es}
                    onChange={(e) => setFormDescEs(e.target.value)}
                  />
                </fieldset>
                <fieldset className="fieldset">
                  <legend className="fieldset-legend">
                    {isEs ? "Descripcion (EN)" : "Description (EN)"}
                  </legend>
                  <textarea
                    className="textarea w-full"
                    rows={3}
                    value={formDesc_en}
                    onChange={(e) => setFormDescEn(e.target.value)}
                  />
                </fieldset>
              </div>

              {/* Variants */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend">
                  {isEs ? "Variantes (precios)" : "Variants (pricing)"}
                </legend>
                <div className="space-y-3">
                  {formVariants.map((v, i) => (
                    <div key={i} className="flex gap-2 items-end">
                      <input
                        type="text"
                        className="input flex-1"
                        placeholder={isEs ? "Etiqueta (ej: Chico)" : "Label (e.g. Small)"}
                        value={v.label}
                        onChange={(e) =>
                          updateVariant(i, "label", e.target.value)
                        }
                      />
                      <input
                        type="number"
                        className="input w-28"
                        placeholder={isEs ? "Precio" : "Price"}
                        value={v.price}
                        onChange={(e) =>
                          updateVariant(i, "price", e.target.value)
                        }
                      />
                      <select
                        className="select w-24"
                        value={v.currency}
                        onChange={(e) =>
                          updateVariant(i, "currency", e.target.value)
                        }
                      >
                        <option value="MXN">MXN</option>
                        <option value="USD">USD</option>
                      </select>
                      {formVariants.length > 1 && (
                        <button
                          onClick={() => removeVariantRow(i)}
                          className="btn btn-ghost btn-sm btn-circle text-error"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addVariantRow}
                    className="btn btn-ghost btn-sm gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    {isEs ? "Agregar variante" : "Add variant"}
                  </button>
                </div>
              </fieldset>

              {/* Existing images (edit mode) */}
              {editingProduct &&
                editingProduct.product_images.length > 0 && (
                  <fieldset className="fieldset">
                    <legend className="fieldset-legend">
                      {isEs ? "Imagenes actuales" : "Current images"}
                    </legend>
                    <div className="flex gap-3 flex-wrap">
                      {editingProduct.product_images
                        .sort((a, b) => a.sort_order - b.sort_order)
                        .map((img) => {
                          const url = getImageUrl(BUCKET, img.storage_path, {
                            width: 200,
                            height: 200,
                            resize: "cover",
                          });
                          return (
                            <div
                              key={img.id}
                              className="relative w-24 h-24 rounded-lg overflow-hidden bg-base-300"
                            >
                              {url && (
                                <Image
                                  src={url}
                                  alt=""
                                  width={200}
                                  height={200}
                                  className="w-full h-full object-cover"
                                />
                              )}
                              {img.is_primary && (
                                <span className="absolute top-1 left-1 badge badge-primary badge-xs">
                                  <Star className="h-2.5 w-2.5" />
                                </span>
                              )}
                              <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors flex items-center justify-center gap-1 opacity-0 hover:opacity-100">
                                {!img.is_primary && (
                                  <button
                                    onClick={() =>
                                      setPrimaryImage(
                                        editingProduct.id,
                                        img.id
                                      )
                                    }
                                    className="btn btn-xs btn-circle bg-white/80"
                                    title={
                                      isEs
                                        ? "Hacer principal"
                                        : "Set as primary"
                                    }
                                  >
                                    <Star className="h-3 w-3" />
                                  </button>
                                )}
                                <button
                                  onClick={() =>
                                    deleteImage(editingProduct.id, img)
                                  }
                                  className="btn btn-xs btn-circle bg-white/80 text-error"
                                  title={isEs ? "Eliminar" : "Delete"}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </fieldset>
                )}

              {/* New image uploads */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend">
                  {editingProduct
                    ? isEs
                      ? "Agregar imagenes"
                      : "Add images"
                    : isEs
                      ? "Imagenes"
                      : "Images"}
                </legend>
                <div className="flex gap-3 flex-wrap items-center">
                  {formImagePreviews.map((preview, i) => (
                    <div
                      key={i}
                      className="relative w-24 h-24 rounded-lg overflow-hidden bg-base-300"
                    >
                      <img
                        src={preview}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => removeNewImage(i)}
                        className="absolute top-1 right-1 btn btn-xs btn-circle bg-black/50 text-white border-0"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-24 h-24 rounded-lg border-2 border-dashed border-base-300 hover:border-primary flex flex-col items-center justify-center gap-1 transition-colors text-base-content/40 hover:text-primary"
                  >
                    <Upload className="h-5 w-5" />
                    <span className="text-[10px]">
                      {isEs ? "Subir" : "Upload"}
                    </span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageSelect}
                  />
                </div>
              </fieldset>

              {/* Actions */}
              <div className="flex justify-end gap-3">
                <button onClick={resetForm} className="btn btn-ghost">
                  {isEs ? "Cancelar" : "Cancel"}
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !formName_es || !formName_en}
                  className="btn btn-primary gap-2"
                >
                  {saving && (
                    <span className="loading loading-spinner loading-xs" />
                  )}
                  {saving
                    ? isEs
                      ? "Guardando..."
                      : "Saving..."
                    : isEs
                      ? "Guardar"
                      : "Save"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Products table */}
        {loading ? (
          <div className="flex justify-center py-16">
            <span className="loading loading-spinner loading-lg text-primary" />
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Package className="h-12 w-12 text-base-content/15 mb-4" />
            <p className="text-base-content/50 mb-1">
              {isEs ? "Sin productos en esta categoria" : "No products in this category"}
            </p>
            <button onClick={openNewProduct} className="btn btn-ghost btn-sm gap-1 mt-4">
              <Plus className="h-4 w-4" />
              {isEs ? "Crear el primero" : "Create the first one"}
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th className="w-16"></th>
                  <th>{isEs ? "Producto" : "Product"}</th>
                  <th>{isEs ? "Variantes" : "Variants"}</th>
                  <th className="text-center">
                    {isEs ? "Activo" : "Active"}
                  </th>
                  <th className="text-center">
                    {isEs ? "Destacado" : "Featured"}
                  </th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const primaryImg = p.product_images.find(
                    (i) => i.is_primary
                  );
                  const imgUrl = primaryImg
                    ? getImageUrl(BUCKET, primaryImg.storage_path, {
                        width: 100,
                        height: 100,
                        resize: "cover",
                      })
                    : null;

                  return (
                    <tr key={p.id} className="hover">
                      {/* Thumbnail */}
                      <td>
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-base-200">
                          {imgUrl && (
                            <Image
                              src={imgUrl}
                              alt=""
                              width={100}
                              height={100}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                      </td>
                      {/* Name */}
                      <td>
                        <div>
                          <p className="font-medium text-sm">
                            {isEs ? p.name_es : p.name_en}
                          </p>
                          <p className="text-xs text-base-content/40">
                            /{p.slug}
                          </p>
                        </div>
                      </td>
                      {/* Variants summary */}
                      <td>
                        <div className="flex flex-col gap-0.5">
                          {p.product_variants
                            .sort((a, b) => a.sort_order - b.sort_order)
                            .slice(0, 3)
                            .map((v) => (
                              <span
                                key={v.id}
                                className="text-xs text-base-content/60"
                              >
                                {v.label} — ${v.price} {v.currency}
                              </span>
                            ))}
                          {p.product_variants.length > 3 && (
                            <span className="text-xs text-base-content/30">
                              +{p.product_variants.length - 3}{" "}
                              {isEs ? "mas" : "more"}
                            </span>
                          )}
                        </div>
                      </td>
                      {/* Active toggle */}
                      <td className="text-center">
                        <button
                          onClick={() =>
                            toggleField(p.id, "is_active", p.is_active)
                          }
                          className={`btn btn-ghost btn-sm btn-circle ${
                            p.is_active
                              ? "text-success"
                              : "text-base-content/20"
                          }`}
                          title={
                            p.is_active
                              ? isEs
                                ? "Desactivar"
                                : "Deactivate"
                              : isEs
                                ? "Activar"
                                : "Activate"
                          }
                        >
                          {p.is_active ? (
                            <Eye className="h-4 w-4" />
                          ) : (
                            <EyeOff className="h-4 w-4" />
                          )}
                        </button>
                      </td>
                      {/* Featured toggle */}
                      <td className="text-center">
                        <button
                          onClick={() =>
                            toggleField(p.id, "is_featured", p.is_featured)
                          }
                          className={`btn btn-ghost btn-sm btn-circle ${
                            p.is_featured
                              ? "text-warning"
                              : "text-base-content/20"
                          }`}
                          title={
                            p.is_featured
                              ? isEs
                                ? "Quitar destacado"
                                : "Unfeature"
                              : isEs
                                ? "Destacar"
                                : "Feature"
                          }
                        >
                          <Star
                            className={`h-4 w-4 ${
                              p.is_featured ? "fill-warning" : ""
                            }`}
                          />
                        </button>
                      </td>
                      {/* Actions */}
                      <td>
                        <div className="flex gap-1">
                          <button
                            onClick={() => openEditProduct(p)}
                            className="btn btn-ghost btn-xs"
                          >
                            {isEs ? "Editar" : "Edit"}
                          </button>
                          <button
                            onClick={() => deleteProduct(p)}
                            className="btn btn-ghost btn-xs text-error"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────── */

export default function AdminPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  return <AdminContent lang={lang} />;
}

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
  Sparkles,
  Wand2,
  ChevronDown,
  ImagePlus,
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

type AIResult = {
  name_es: string;
  name_en: string;
  description_es: string;
  description_en: string;
  slug: string;
  variants: { label: string; priceMXN: number; priceUSD: number }[];
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

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* ─── Product Form (Full-screen overlay / desktop modal) ── */

function ProductFormModal({
  isEs,
  categories,
  editingProduct,
  activeCategory,
  products,
  onClose,
  onSaved,
}: {
  isEs: boolean;
  categories: Category[];
  editingProduct: Product | null;
  activeCategory: string;
  products: Product[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const catName = (c: Category) => (isEs ? c.name_es : c.name_en);

  const [formNameEs, setFormNameEs] = useState(editingProduct?.name_es ?? "");
  const [formNameEn, setFormNameEn] = useState(editingProduct?.name_en ?? "");
  const [formDescEs, setFormDescEs] = useState(
    editingProduct?.description_es ?? ""
  );
  const [formDescEn, setFormDescEn] = useState(
    editingProduct?.description_en ?? ""
  );
  const [formSlug, setFormSlug] = useState(editingProduct?.slug ?? "");
  const [formCategoryId, setFormCategoryId] = useState(
    editingProduct?.category_id ?? activeCategory
  );
  const [formVariants, setFormVariants] = useState<NewVariant[]>(
    editingProduct
      ? editingProduct.product_variants.map((v) => ({
          label: v.label,
          price: String(v.price),
          currency: v.currency,
        }))
      : [{ label: "", price: "", currency: "MXN" }]
  );
  const [formImages, setFormImages] = useState<File[]>([]);
  const [formImagePreviews, setFormImagePreviews] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI generation state
  const [aiDescription, setAiDescription] = useState("");
  const [aiImage, setAiImage] = useState<File | null>(null);
  const [aiImagePreview, setAiImagePreview] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [showAi, setShowAi] = useState(!editingProduct);
  const aiFileRef = useRef<HTMLInputElement>(null);

  // Mount animation
  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Auto-slug
  useEffect(() => {
    if (!editingProduct && formNameEs) {
      setFormSlug(slugify(formNameEs));
    }
  }, [formNameEs, editingProduct]);

  // Close with animation
  function handleClose() {
    setMounted(false);
    setTimeout(onClose, 200);
  }

  // AI image select
  function handleAiImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAiImage(file);
    setAiImagePreview(URL.createObjectURL(file));
  }

  function removeAiImage() {
    if (aiImagePreview) URL.revokeObjectURL(aiImagePreview);
    setAiImage(null);
    setAiImagePreview(null);
  }

  // AI Generate
  async function handleAiGenerate() {
    if (!aiImage && !aiDescription.trim()) return;
    setAiLoading(true);

    try {
      let imageData: string | undefined;
      if (aiImage) {
        imageData = await fileToBase64(aiImage);
      }

      const catSlug = categories.find((c) => c.id === formCategoryId)?.slug;

      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: imageData,
          description: aiDescription.trim() || undefined,
          categorySlug: catSlug,
        }),
      });

      if (!res.ok) throw new Error("AI request failed");

      const data: AIResult = await res.json();

      // Fill form
      setFormNameEs(data.name_es);
      setFormNameEn(data.name_en);
      setFormDescEs(data.description_es);
      setFormDescEn(data.description_en);
      setFormSlug(data.slug);

      // Map variants (create MXN + USD for each size)
      const variants: NewVariant[] = [];
      for (const v of data.variants) {
        variants.push({
          label: v.label,
          price: String(v.priceMXN),
          currency: "MXN",
        });
        variants.push({
          label: v.label,
          price: String(v.priceUSD),
          currency: "USD",
        });
      }
      setFormVariants(variants);

      // If AI had an image, add it as a product image too
      if (aiImage) {
        setFormImages((prev) => [...prev, aiImage]);
        setFormImagePreviews((prev) => [
          ...prev,
          URL.createObjectURL(aiImage),
        ]);
      }

      setShowAi(false);
    } catch (err) {
      console.error("AI error:", err);
      alert(isEs ? "Error al generar con IA" : "AI generation error");
    } finally {
      setAiLoading(false);
    }
  }

  // Image management
  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    setFormImages((prev) => [...prev, ...files]);
    const previews = files.map((f) => URL.createObjectURL(f));
    setFormImagePreviews((prev) => [...prev, ...previews]);
  }

  function removeNewImage(index: number) {
    setFormImages((prev) => prev.filter((_, i) => i !== index));
    setFormImagePreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  }

  // Variants
  function addVariantRow() {
    setFormVariants((prev) => [
      ...prev,
      { label: "", price: "", currency: "MXN" },
    ]);
  }

  function removeVariantRow(index: number) {
    setFormVariants((prev) => prev.filter((_, i) => i !== index));
  }

  function updateVariant(i: number, field: keyof NewVariant, value: string) {
    setFormVariants((prev) =>
      prev.map((v, idx) => (idx === i ? { ...v, [field]: value } : v))
    );
  }

  // Existing image management (edit mode)
  async function deleteExistingImage(img: ProductImage) {
    if (!editingProduct) return;
    const supabase = createClient();
    await supabase.storage.from(BUCKET).remove([img.storage_path]);
    await supabase.from("product_images").delete().eq("id", img.id);
    if (img.is_primary) {
      const rest = editingProduct.product_images.filter(
        (i) => i.id !== img.id
      );
      if (rest.length > 0) {
        await supabase
          .from("product_images")
          .update({ is_primary: true })
          .eq("id", rest[0].id);
      }
    }
    onSaved();
  }

  async function setAsPrimary(imageId: string) {
    if (!editingProduct) return;
    const supabase = createClient();
    await supabase
      .from("product_images")
      .update({ is_primary: false })
      .eq("product_id", editingProduct.id);
    await supabase
      .from("product_images")
      .update({ is_primary: true })
      .eq("id", imageId);
    onSaved();
  }

  // Save
  async function handleSave() {
    if (!formNameEs || !formNameEn || !formSlug || !formCategoryId) return;
    setSaving(true);
    const supabase = createClient();

    try {
      let productId: string;

      // Ensure slug is unique before saving
      let finalSlug = formSlug;
      if (!editingProduct || editingProduct.slug !== formSlug) {
        const { count } = await supabase
          .from("products")
          .select("id", { count: "exact", head: true })
          .eq("slug", formSlug);
        if (count && count > 0) {
          let suffix = 2;
          let candidate = `${formSlug}-${suffix}`;
          while (true) {
            const { count: c } = await supabase
              .from("products")
              .select("id", { count: "exact", head: true })
              .eq("slug", candidate);
            if (!c || c === 0) break;
            suffix++;
            candidate = `${formSlug}-${suffix}`;
          }
          finalSlug = candidate;
        }
      }

      if (editingProduct) {
        const { error } = await supabase
          .from("products")
          .update({
            name_es: formNameEs,
            name_en: formNameEn,
            description_es: formDescEs || null,
            description_en: formDescEn || null,
            slug: finalSlug,
            category_id: formCategoryId,
          })
          .eq("id", editingProduct.id);
        if (error) throw error;
        productId = editingProduct.id;

        await supabase
          .from("product_variants")
          .delete()
          .eq("product_id", productId);
      } else {
        const maxSort =
          products.length > 0
            ? Math.max(...products.map((p) => p.sort_order))
            : 0;

        const { data, error } = await supabase
          .from("products")
          .insert({
            name_es: formNameEs,
            name_en: formNameEn,
            description_es: formDescEs || null,
            description_en: formDescEn || null,
            slug: finalSlug,
            category_id: formCategoryId,
            sort_order: maxSort + 1,
          })
          .select("id")
          .single();
        if (error) throw error;
        productId = data.id;
      }

      // Insert variants
      const valid = formVariants.filter(
        (v) => v.label && v.price && Number(v.price) > 0
      );
      if (valid.length > 0) {
        const { error } = await supabase.from("product_variants").insert(
          valid.map((v, i) => ({
            product_id: productId,
            label: v.label,
            price: Number(v.price),
            currency: v.currency,
            sort_order: i,
          }))
        );
        if (error) throw error;
      }

      // Upload images
      if (formImages.length > 0) {
        const existingCount = editingProduct?.product_images?.length ?? 0;
        for (let i = 0; i < formImages.length; i++) {
          const file = formImages[i];
          const ext = file.name.split(".").pop();
          const path = `products/${productId}/${Date.now()}-${i}.${ext}`;
          const { error: upErr } = await supabase.storage
            .from(BUCKET)
            .upload(path, file);
          if (upErr) throw upErr;
          const { error: imgErr } = await supabase
            .from("product_images")
            .insert({
              product_id: productId,
              storage_path: path,
              is_primary: existingCount === 0 && i === 0,
              sort_order: existingCount + i,
            });
          if (imgErr) throw imgErr;
        }
      }

      onSaved();
      handleClose();
    } catch (err: unknown) {
      console.error("Save error:", err);
      const supaErr = err as { code?: string; message?: string } | undefined;
      let msg: string;
      if (supaErr?.code === "23505") {
        msg = isEs
          ? "Ya existe un producto con ese slug. Cambia el nombre e intenta de nuevo."
          : "A product with that slug already exists. Change the name and try again.";
      } else if (supaErr?.code === "23503") {
        msg = isEs
          ? "La categoría seleccionada no es válida."
          : "The selected category is not valid.";
      } else if (supaErr?.message) {
        msg = isEs
          ? `Error al guardar: ${supaErr.message}`
          : `Error saving: ${supaErr.message}`;
      } else {
        msg = isEs ? "Error al guardar" : "Error saving";
      }
      alert(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-200 ${
        mounted ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Panel — full-screen on mobile, centered modal on lg */}
      <div
        className={`absolute inset-0 lg:inset-auto lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:w-[56rem] lg:max-h-[90vh] lg:rounded-2xl bg-base-100 flex flex-col transition-transform duration-200 ${
          mounted
            ? "translate-y-0 lg:scale-100"
            : "translate-y-full lg:translate-y-0 lg:scale-95"
        }`}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-base-200 shrink-0">
          <button onClick={handleClose} className="btn btn-ghost btn-sm btn-circle">
            <X className="h-4 w-4" />
          </button>
          <h2 className="text-sm tracking-widest uppercase font-semibold flex-1">
            {editingProduct
              ? isEs
                ? "Editar producto"
                : "Edit product"
              : isEs
                ? "Nuevo producto"
                : "New product"}
          </h2>
          <button
            onClick={handleSave}
            disabled={saving || !formNameEs || !formNameEn}
            className="btn btn-primary btn-sm gap-2"
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

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div className="p-5 space-y-6 max-w-3xl mx-auto">
            {/* ── AI Assistant Section ── */}
            {!editingProduct && (
              <div className="space-y-3">
                <button
                  onClick={() => setShowAi(!showAi)}
                  className="flex items-center gap-2 text-sm font-medium text-primary w-full"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>
                    {isEs
                      ? "Generar con inteligencia artificial"
                      : "Generate with AI"}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 ml-auto transition-transform ${
                      showAi ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    showAi ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-4">
                    <p className="text-xs text-base-content/50">
                      {isEs
                        ? "Sube una foto del arreglo o describe lo que incluye. La IA generara el nombre, descripcion y precios."
                        : "Upload a photo of the arrangement or describe what it includes. AI will generate the name, description, and prices."}
                    </p>

                    {/* AI image upload */}
                    <div className="flex gap-3 items-start">
                      {aiImagePreview ? (
                        <div className="relative w-28 h-28 rounded-xl overflow-hidden bg-base-200 shrink-0">
                          <img
                            src={aiImagePreview}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={removeAiImage}
                            className="absolute top-1.5 right-1.5 btn btn-xs btn-circle bg-black/60 text-white border-0 hover:bg-black/80"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => aiFileRef.current?.click()}
                          className="w-28 h-28 rounded-xl border-2 border-dashed border-primary/30 hover:border-primary flex flex-col items-center justify-center gap-1.5 transition-colors text-primary/40 hover:text-primary shrink-0"
                        >
                          <ImagePlus className="h-6 w-6" />
                          <span className="text-[10px] font-medium">
                            {isEs ? "Foto" : "Photo"}
                          </span>
                        </button>
                      )}
                      <input
                        ref={aiFileRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAiImageSelect}
                      />

                      {/* AI description */}
                      <div className="flex-1 space-y-2">
                        <textarea
                          className="textarea w-full text-sm"
                          rows={3}
                          placeholder={
                            isEs
                              ? "Ej: Arreglo con 12 rosas rojas, eucalipto y lirios blancos en base de ceramica..."
                              : "E.g.: Arrangement with 12 red roses, eucalyptus and white lilies in ceramic base..."
                          }
                          value={aiDescription}
                          onChange={(e) => setAiDescription(e.target.value)}
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleAiGenerate}
                      disabled={
                        aiLoading || (!aiImage && !aiDescription.trim())
                      }
                      className="btn btn-primary btn-sm w-full gap-2"
                    >
                      {aiLoading ? (
                        <>
                          <span className="loading loading-spinner loading-xs" />
                          {isEs ? "Generando..." : "Generating..."}
                        </>
                      ) : (
                        <>
                          <Wand2 className="h-4 w-4" />
                          {isEs ? "Generar producto" : "Generate product"}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── Category ── */}
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

            {/* ── Names ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <fieldset className="fieldset">
                <legend className="fieldset-legend">
                  {isEs ? "Nombre (ES) *" : "Name (ES) *"}
                </legend>
                <input
                  type="text"
                  className={`input w-full ${
                    !formNameEs ? "input-error" : ""
                  }`}
                  value={formNameEs}
                  onChange={(e) => setFormNameEs(e.target.value)}
                  placeholder="Rosa Clasica"
                />
              </fieldset>
              <fieldset className="fieldset">
                <legend className="fieldset-legend">
                  {isEs ? "Nombre (EN) *" : "Name (EN) *"}
                </legend>
                <input
                  type="text"
                  className={`input w-full ${
                    !formNameEn ? "input-error" : ""
                  }`}
                  value={formNameEn}
                  onChange={(e) => setFormNameEn(e.target.value)}
                  placeholder="Classic Rose"
                />
              </fieldset>
            </div>

            {/* ── Slug ── */}
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Slug</legend>
              <input
                type="text"
                className="input w-full font-mono text-sm"
                value={formSlug}
                onChange={(e) => setFormSlug(e.target.value)}
              />
              <p className="label text-xs text-base-content/40">
                {isEs ? "Se genera automaticamente del nombre" : "Auto-generated from name"}
              </p>
            </fieldset>

            {/* ── Descriptions ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <fieldset className="fieldset">
                <legend className="fieldset-legend">
                  {isEs ? "Descripcion (ES)" : "Description (ES)"}
                </legend>
                <textarea
                  className="textarea w-full"
                  rows={3}
                  value={formDescEs}
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
                  value={formDescEn}
                  onChange={(e) => setFormDescEn(e.target.value)}
                />
              </fieldset>
            </div>

            {/* ── Variants ── */}
            <fieldset className="fieldset">
              <legend className="fieldset-legend">
                {isEs ? "Variantes (precios)" : "Variants (pricing)"}
              </legend>
              <div className="space-y-2">
                {formVariants.map((v, i) => (
                  <div
                    key={i}
                    className="flex flex-wrap gap-2 items-center bg-base-200/50 rounded-lg p-2.5"
                  >
                    <input
                      type="text"
                      className="input input-sm flex-1 min-w-[120px]"
                      placeholder={
                        isEs ? "Etiqueta (ej: Chico)" : "Label (e.g. Small)"
                      }
                      value={v.label}
                      onChange={(e) => updateVariant(i, "label", e.target.value)}
                    />
                    <div className="flex gap-1.5 items-center">
                      <span className="text-xs text-base-content/40">$</span>
                      <input
                        type="number"
                        className="input input-sm w-24"
                        placeholder="0"
                        value={v.price}
                        onChange={(e) =>
                          updateVariant(i, "price", e.target.value)
                        }
                      />
                      <select
                        className="select select-sm w-20"
                        value={v.currency}
                        onChange={(e) =>
                          updateVariant(i, "currency", e.target.value)
                        }
                      >
                        <option value="MXN">MXN</option>
                        <option value="USD">USD</option>
                      </select>
                    </div>
                    {formVariants.length > 1 && (
                      <button
                        onClick={() => removeVariantRow(i)}
                        className="btn btn-ghost btn-xs btn-circle text-error/60 hover:text-error"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addVariantRow}
                  className="btn btn-ghost btn-sm gap-1.5 text-base-content/50"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {isEs ? "Agregar variante" : "Add variant"}
                </button>
              </div>
            </fieldset>

            {/* ── Existing images (edit mode) ── */}
            {editingProduct && editingProduct.product_images.length > 0 && (
              <fieldset className="fieldset">
                <legend className="fieldset-legend">
                  {isEs ? "Imagenes actuales" : "Current images"}
                </legend>
                <div className="flex gap-3 flex-wrap">
                  {[...editingProduct.product_images]
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
                          className="relative w-24 h-24 rounded-xl overflow-hidden bg-base-200 group/img"
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
                            <span className="absolute top-1.5 left-1.5 badge badge-primary badge-xs gap-0.5">
                              <Star className="h-2 w-2" />
                            </span>
                          )}
                          <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/40 transition-all flex items-center justify-center gap-1.5 opacity-0 group-hover/img:opacity-100">
                            {!img.is_primary && (
                              <button
                                onClick={() => setAsPrimary(img.id)}
                                className="btn btn-xs btn-circle bg-white/90 shadow-sm"
                                title={
                                  isEs ? "Hacer principal" : "Set as primary"
                                }
                              >
                                <Star className="h-3 w-3" />
                              </button>
                            )}
                            <button
                              onClick={() => deleteExistingImage(img)}
                              className="btn btn-xs btn-circle bg-white/90 text-error shadow-sm"
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

            {/* ── New images ── */}
            <fieldset className="fieldset">
              <legend className="fieldset-legend">
                {editingProduct
                  ? isEs
                    ? "Agregar imagenes"
                    : "Add images"
                  : isEs
                    ? "Imagenes del producto"
                    : "Product images"}
              </legend>
              <div className="flex gap-3 flex-wrap items-center">
                {formImagePreviews.map((preview, i) => (
                  <div
                    key={i}
                    className="relative w-24 h-24 rounded-xl overflow-hidden bg-base-200 animate-in fade-in duration-200"
                  >
                    <img
                      src={preview}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => removeNewImage(i)}
                      className="absolute top-1.5 right-1.5 btn btn-xs btn-circle bg-black/60 text-white border-0 hover:bg-black/80"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-24 h-24 rounded-xl border-2 border-dashed border-base-300 hover:border-primary flex flex-col items-center justify-center gap-1.5 transition-all text-base-content/30 hover:text-primary hover:scale-105 active:scale-95"
                >
                  <Upload className="h-5 w-5" />
                  <span className="text-[10px] font-medium">
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
          </div>

          {/* Bottom spacer for mobile safe area */}
          <div className="h-6" />
        </div>
      </div>
    </div>
  );
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

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

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

  function openNew() {
    setEditingProduct(null);
    setShowModal(true);
  }

  function openEdit(p: Product) {
    setEditingProduct(p);
    setShowModal(true);
  }

  async function toggleField(
    id: string,
    field: "is_active" | "is_featured",
    current: boolean
  ) {
    const supabase = createClient();
    await supabase
      .from("products")
      .update({ [field]: !current })
      .eq("id", id);
    loadProducts();
  }

  async function deleteProduct(p: Product) {
    if (
      !confirm(isEs ? `Eliminar "${p.name_es}"?` : `Delete "${p.name_en}"?`)
    )
      return;
    const supabase = createClient();
    for (const img of p.product_images) {
      await supabase.storage.from(BUCKET).remove([img.storage_path]);
    }
    await supabase.from("product_variants").delete().eq("product_id", p.id);
    await supabase.from("product_images").delete().eq("product_id", p.id);
    await supabase.from("products").delete().eq("id", p.id);
    loadProducts();
  }

  const catName = (c: Category) => (isEs ? c.name_es : c.name_en);

  // ─── Guards ─────────────────────────────────────────
  if (authLoading || isAdmin === null) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-base-100">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }
  if (!isAdmin) return null;

  return (
    <div className="min-h-dvh bg-base-100">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-base-100/80 backdrop-blur-xl border-b border-base-200">
        <div className="max-w-6xl mx-auto flex items-center gap-4 px-5 py-3">
          <Link
            href={`/${lang}/login`}
            className="btn btn-ghost btn-sm btn-circle"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-sm tracking-widest uppercase font-semibold">
            {isEs ? "Productos" : "Products"}
          </h1>
          <div className="flex-1" />
          <button onClick={openNew} className="btn btn-primary btn-sm gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">
              {isEs ? "Nuevo" : "New"}
            </span>
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-5 py-6">
        {/* Category tabs */}
        <div role="tablist" className="tabs tabs-box mb-6">
          {categories.map((cat) => (
            <button
              key={cat.id}
              role="tab"
              className={`tab text-xs tracking-widest uppercase ${
                activeCategory === cat.id ? "tab-active font-bold" : ""
              }`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {catName(cat)}
            </button>
          ))}
        </div>

        {/* Products */}
        {loading ? (
          <div className="flex justify-center py-20">
            <span className="loading loading-spinner loading-lg text-primary" />
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Package className="h-12 w-12 text-base-content/10 mb-4" />
            <p className="text-base-content/40 text-sm mb-1">
              {isEs
                ? "Sin productos en esta categoria"
                : "No products in this category"}
            </p>
            <button
              onClick={openNew}
              className="btn btn-ghost btn-sm gap-1.5 mt-4 text-primary"
            >
              <Plus className="h-4 w-4" />
              {isEs ? "Crear el primero" : "Create the first one"}
            </button>
          </div>
        ) : (
          /* Product cards grid (mobile-friendly, replaces table) */
          <div className="grid gap-3">
            {products.map((p) => {
              const primaryImg = p.product_images.find((i) => i.is_primary);
              const imgUrl = primaryImg
                ? getImageUrl(BUCKET, primaryImg.storage_path, {
                    width: 200,
                    height: 200,
                    resize: "cover",
                  })
                : null;

              return (
                <div
                  key={p.id}
                  className="flex items-center gap-4 p-3 rounded-xl bg-base-200/40 hover:bg-base-200/70 transition-colors group cursor-pointer"
                  onClick={() => openEdit(p)}
                >
                  {/* Thumbnail */}
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-base-200 shrink-0">
                    {imgUrl ? (
                      <Image
                        src={imgUrl}
                        alt=""
                        width={200}
                        height={200}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-5 w-5 text-base-content/15" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {isEs ? p.name_es : p.name_en}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-base-content/40">
                        /{p.slug}
                      </span>
                      {p.product_variants.length > 0 && (
                        <span className="text-xs text-base-content/40">
                          · {p.product_variants.length}{" "}
                          {isEs ? "var" : "var"}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status badges */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleField(p.id, "is_active", p.is_active);
                      }}
                      className={`btn btn-ghost btn-xs btn-circle ${
                        p.is_active
                          ? "text-success"
                          : "text-base-content/15"
                      }`}
                      title={p.is_active ? "Active" : "Inactive"}
                    >
                      {p.is_active ? (
                        <Eye className="h-3.5 w-3.5" />
                      ) : (
                        <EyeOff className="h-3.5 w-3.5" />
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleField(p.id, "is_featured", p.is_featured);
                      }}
                      className={`btn btn-ghost btn-xs btn-circle ${
                        p.is_featured
                          ? "text-warning"
                          : "text-base-content/15"
                      }`}
                      title={p.is_featured ? "Featured" : "Not featured"}
                    >
                      <Star
                        className={`h-3.5 w-3.5 ${
                          p.is_featured ? "fill-warning" : ""
                        }`}
                      />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteProduct(p);
                      }}
                      className="btn btn-ghost btn-xs btn-circle text-base-content/15 hover:text-error opacity-0 group-hover:opacity-100 transition-opacity"
                      title={isEs ? "Eliminar" : "Delete"}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Product form modal */}
      {showModal && (
        <ProductFormModal
          isEs={isEs}
          categories={categories}
          editingProduct={editingProduct}
          activeCategory={activeCategory}
          products={products}
          onClose={() => setShowModal(false)}
          onSaved={loadProducts}
        />
      )}
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

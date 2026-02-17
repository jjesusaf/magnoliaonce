"use client";

import { useState, useEffect } from "react";
import { formatPrice, currencyForLang } from "@/lib/i18n-helpers";
import { useCart } from "@/lib/cart-context";

type Variant = {
  id: string;
  label: string;
  price: number;
  currency: string;
  is_available: boolean;
};

type Props = {
  variants: Variant[];
  lang: string;
  dict: {
    selectVariant: string;
    addToCart: string;
    soldOut: string;
  };
  addedLabel?: string;
  productId: string;
  productName: string;
  imageUrl: string;
  categorySlug: string;
};

export function VariantPicker({
  variants,
  lang,
  dict,
  addedLabel,
  productId,
  productName,
  imageUrl,
  categorySlug,
}: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAdded, setShowAdded] = useState(false);
  const { addItem } = useCart();

  const currency = currencyForLang(lang);
  const filtered = variants.filter((v) => v.currency === currency);

  const selected = filtered.find((v) => v.id === selectedId);
  const allSoldOut = filtered.every((v) => !v.is_available);
  const hideCart = categorySlug === "events";

  // Reset feedback when selection changes
  useEffect(() => {
    setShowAdded(false);
  }, [selectedId]);

  function handleAdd() {
    if (!selected || !selected.is_available) return;
    addItem({
      productId,
      variantId: selected.id,
      productName,
      variantLabel: selected.label,
      price: selected.price,
      currency: selected.currency,
      imageUrl,
    });
    setShowAdded(true);
    setTimeout(() => setShowAdded(false), 1500);
  }

  if (filtered.length === 0) return null;

  return (
    <div className="space-y-6">
      <p className="text-sm tracking-widest uppercase text-base-content/60">
        {dict.selectVariant}
      </p>

      <div className="flex flex-wrap gap-2">
        {filtered.map((v) => {
          const isSelected = v.id === selectedId;
          const disabled = !v.is_available;
          return (
            <button
              key={v.id}
              disabled={disabled}
              onClick={() => setSelectedId(v.id)}
              className={`btn btn-sm ${
                isSelected ? "btn-primary" : "btn-outline"
              } ${disabled ? "btn-disabled line-through opacity-50" : ""}`}
            >
              {v.label} — {formatPrice(v.price, v.currency)}
            </button>
          );
        })}
      </div>

      {!hideCart && (
        <button
          disabled={!selected || !selected.is_available || allSoldOut}
          onClick={handleAdd}
          className="btn btn-primary btn-block tracking-widest uppercase"
        >
          {allSoldOut
            ? dict.soldOut
            : showAdded
              ? addedLabel ?? "✓"
              : dict.addToCart}
        </button>
      )}
    </div>
  );
}

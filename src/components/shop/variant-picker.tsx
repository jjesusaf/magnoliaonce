"use client";

import { useState, useEffect } from "react";
import { formatPrice, currencyForLang } from "@/lib/i18n-helpers";
import { useCart } from "@/lib/cart-context";
import { ShoppingBag, Check } from "lucide-react";

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
    <div className="flex flex-col gap-5">
      {/* Price display */}
      {selected && (
        <p className="text-xl tracking-wide">
          {formatPrice(selected.price, selected.currency)}
        </p>
      )}

      {/* Variant label */}
      <p className="text-sm tracking-widest uppercase text-base-content/50">
        {dict.selectVariant}
      </p>

      {/* Variant buttons */}
      <div className="flex flex-wrap gap-2">
        {filtered.map((v) => {
          const isSelected = v.id === selectedId;
          const disabled = !v.is_available;
          return (
            <button
              key={v.id}
              disabled={disabled}
              onClick={() => setSelectedId(v.id)}
              className={`px-4 py-2 text-sm tracking-wide border transition-colors ${
                isSelected
                  ? "border-base-content bg-base-content text-base-100"
                  : "border-base-content/20 hover:border-base-content/50"
              } ${disabled ? "opacity-30 line-through cursor-not-allowed" : ""}`}
            >
              {v.label} — {formatPrice(v.price, v.currency)}
            </button>
          );
        })}
      </div>

      {/* Add to cart */}
      {!hideCart && (
        <button
          disabled={!selected || !selected.is_available || allSoldOut}
          onClick={handleAdd}
          className="flex items-center justify-center gap-2 w-full py-3.5 text-sm tracking-widest uppercase border border-base-content bg-base-content text-base-100 hover:bg-base-content/90 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          {allSoldOut ? (
            dict.soldOut
          ) : showAdded ? (
            <>
              <Check className="h-4 w-4" />
              {addedLabel ?? "Added"}
            </>
          ) : (
            <>
              <ShoppingBag className="h-4 w-4" />
              {dict.addToCart}
            </>
          )}
        </button>
      )}
    </div>
  );
}

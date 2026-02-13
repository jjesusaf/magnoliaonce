"use client";

import { useState } from "react";
import { formatPrice, currencyForLang } from "@/lib/i18n-helpers";

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
};

export function VariantPicker({ variants, lang, dict }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const currency = currencyForLang(lang);
  const filtered = variants.filter((v) => v.currency === currency);

  const selected = filtered.find((v) => v.id === selectedId);
  const allSoldOut = filtered.every((v) => !v.is_available);

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

      <button
        disabled={!selected || !selected.is_available || allSoldOut}
        className="btn btn-primary btn-block tracking-widest uppercase"
      >
        {allSoldOut ? dict.soldOut : dict.addToCart}
      </button>
    </div>
  );
}

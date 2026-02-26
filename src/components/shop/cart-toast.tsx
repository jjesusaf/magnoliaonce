"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Check, X } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/i18n-helpers";

export function CartToast() {
  const { lastAdded, dismissLastAdded, toggleCart } = useCart();
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();
  const isEs = pathname.startsWith("/es");

  useEffect(() => {
    if (lastAdded) {
      const frame = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(frame);
    } else {
      setVisible(false);
    }
  }, [lastAdded]);

  function handleViewCart() {
    dismissLastAdded();
    toggleCart();
  }

  if (!lastAdded) return null;

  return (
    <div className="fixed top-20 right-4 z-80 pointer-events-none">
      <div
        className={`pointer-events-auto w-80 sm:w-90 bg-base-100 border border-base-content/10 shadow-lg transition-all duration-300 ease-out ${
          visible
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-2"
        }`}
        role="alert"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-base-content/10">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4" strokeWidth={2} />
            <span className="text-xs tracking-widest uppercase">
              {isEs ? "Agregado al carrito" : "Added to cart"}
            </span>
          </div>
          <button
            onClick={dismissLastAdded}
            className="p-0.5 hover:opacity-60 transition-opacity"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>

        {/* Product info */}
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="relative w-14 h-14 shrink-0 overflow-hidden bg-base-200">
            {lastAdded.imageUrl ? (
              <Image
                src={lastAdded.imageUrl}
                alt={lastAdded.productName}
                fill
                className="object-cover"
                sizes="56px"
              />
            ) : (
              <div className="w-full h-full bg-base-200" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm tracking-wide uppercase truncate">
              {lastAdded.productName}
            </p>
            <p className="text-xs text-base-content/50 mt-0.5">
              {lastAdded.variantLabel}
            </p>
            <p className="text-sm mt-0.5">
              {formatPrice(lastAdded.price, lastAdded.currency)}
            </p>
          </div>
        </div>

        {/* Action */}
        <div className="px-4 pb-4">
          <button
            onClick={handleViewCart}
            className="w-full py-2.5 text-xs tracking-widest uppercase border border-base-content bg-base-content text-base-100 hover:bg-base-content/90 transition-colors"
          >
            {isEs ? "Ver carrito" : "View cart"}
          </button>
        </div>
      </div>
    </div>
  );
}

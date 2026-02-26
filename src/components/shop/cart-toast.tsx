"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Check, ShoppingBag, X } from "lucide-react";
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
    <div className="toast toast-top toast-end z-[80] pointer-events-none px-4 pt-20">
      <div
        className={`pointer-events-auto w-80 sm:w-[22rem] bg-base-100 border border-base-200 rounded-xl shadow-xl transition-all duration-300 ease-out ${
          visible
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 -translate-y-2 scale-95"
        }`}
        role="alert"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-5 h-5 rounded-full bg-success/15">
              <Check className="h-3 w-3 text-success" strokeWidth={3} />
            </div>
            <span className="text-xs tracking-wider uppercase text-base-content/50 font-semibold">
              {isEs ? "Agregado al carrito" : "Added to cart"}
            </span>
          </div>
          <button
            onClick={dismissLastAdded}
            className="btn btn-ghost btn-xs btn-circle text-base-content/30 hover:text-base-content/60"
            aria-label="Dismiss"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Product info */}
        <div className="flex items-center gap-3 px-4 pb-3">
          <div className="relative w-12 h-14 shrink-0 rounded-lg overflow-hidden bg-base-200">
            {lastAdded.imageUrl ? (
              <Image
                src={lastAdded.imageUrl}
                alt={lastAdded.productName}
                fill
                className="object-cover"
                sizes="48px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ShoppingBag className="h-4 w-4 text-base-content/30" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-base-content truncate">
              {lastAdded.productName}
            </p>
            <p className="text-xs text-base-content/50 truncate">
              {lastAdded.variantLabel}
            </p>
            <p className="text-xs font-semibold text-primary mt-0.5">
              {formatPrice(lastAdded.price, lastAdded.currency)}
            </p>
          </div>
        </div>

        {/* Action */}
        <div className="px-4 pb-3">
          <button
            onClick={handleViewCart}
            className="btn btn-primary btn-sm btn-block tracking-wider uppercase"
          >
            {isEs ? "Ver carrito" : "View cart"}
          </button>
        </div>
      </div>
    </div>
  );
}

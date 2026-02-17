"use client";

import Image from "next/image";
import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/i18n-helpers";

type CartDict = {
  title: string;
  empty: string;
  remove: string;
  total: string;
  checkout: string;
  continueShopping: string;
};

type Props = {
  lang: string;
  dict: CartDict;
};

export function CartDrawer({ lang, dict }: Props) {
  const { items, isOpen, closeCart, removeItem, updateQty, totalPrice } =
    useCart();

  const currency = lang === "es" ? "MXN" : "USD";

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-[60] transition-opacity"
          onClick={closeCart}
        />
      )}

      {/* Drawer panel */}
      <div
        className={`fixed top-0 right-0 h-full w-80 sm:w-96 bg-base-100 z-[70] shadow-xl flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-base-200">
          <h2 className="text-sm tracking-widest uppercase font-bold">
            {dict.title}
          </h2>
          <button
            onClick={closeCart}
            className="btn btn-ghost btn-circle btn-sm"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Items list */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-base-content/60">
            <ShoppingBag className="h-12 w-12 stroke-[1]" />
            <p className="text-sm tracking-widest uppercase">{dict.empty}</p>
            <button
              onClick={closeCart}
              className="btn btn-outline btn-sm tracking-widest uppercase"
            >
              {dict.continueShopping}
            </button>
          </div>
        ) : (
          <>
            <ul className="flex-1 overflow-y-auto divide-y divide-base-200">
              {items.map((item) => (
                <li key={item.variantId} className="flex gap-3 p-4">
                  {/* Thumbnail */}
                  <div className="relative w-16 h-20 shrink-0 rounded overflow-hidden bg-base-200">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.productName}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="h-6 w-6 text-base-content/30" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <p className="text-sm font-semibold tracking-wide uppercase truncate">
                        {item.productName}
                      </p>
                      <p className="text-xs text-base-content/60 truncate">
                        {item.variantLabel}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      {/* Qty controls */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() =>
                            updateQty(item.variantId, item.quantity - 1)
                          }
                          className="btn btn-ghost btn-xs btn-circle"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center text-sm tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQty(item.variantId, item.quantity + 1)
                          }
                          className="btn btn-ghost btn-xs btn-circle"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      {/* Price */}
                      <span className="text-sm font-semibold">
                        {formatPrice(item.price * item.quantity, item.currency)}
                      </span>
                    </div>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeItem(item.variantId)}
                    className="btn btn-ghost btn-xs btn-circle self-start shrink-0"
                    aria-label={dict.remove}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>

            {/* Footer */}
            <div className="border-t border-base-200 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm tracking-widest uppercase font-bold">
                  {dict.total}
                </span>
                <span className="text-lg font-bold">
                  {formatPrice(totalPrice, currency)}
                </span>
              </div>
              <button className="btn btn-primary btn-block tracking-widest uppercase">
                {dict.checkout}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { X, Minus, Plus, Trash2 } from "lucide-react";
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
  const router = useRouter();

  const currency = lang === "es" ? "MXN" : "USD";
  const isEs = lang === "es";
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-60 transition-opacity"
          onClick={closeCart}
        />
      )}

      {/* Drawer panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-105 bg-base-100 z-70 shadow-xl flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 h-15 shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-lg tracking-widest uppercase">
              {dict.title}
            </h2>
            {itemCount > 0 && (
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-base-content text-base-100 text-xs">
                {itemCount}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="p-1 hover:opacity-60 transition-opacity"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Items list */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6 text-base-content/50">
            <p className="text-sm tracking-widest uppercase">{dict.empty}</p>
            <button
              onClick={closeCart}
              className="px-6 py-2.5 text-sm tracking-widest uppercase border border-base-content/20 hover:border-base-content/50 transition-colors"
            >
              {dict.continueShopping}
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto">
              <div className="divide-y divide-base-200">
                {items.map((item) => (
                  <div key={item.variantId} className="flex gap-4 px-6 py-5">
                    {/* Thumbnail — square like Midi */}
                    <div className="relative w-18 h-18 shrink-0 overflow-hidden bg-base-200">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.productName}
                          fill
                          className="object-cover"
                          sizes="72px"
                        />
                      ) : (
                        <div className="w-full h-full bg-base-200" />
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 flex flex-col gap-1">
                      <p className="text-sm tracking-wide uppercase truncate">
                        {item.productName}
                      </p>
                      <p className="text-sm text-base-content/50">
                        {item.variantLabel}
                      </p>
                      <p className="text-sm">
                        {formatPrice(item.price, item.currency)}
                      </p>

                      {/* Quantity + remove */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-base-content/15">
                          <button
                            onClick={() =>
                              updateQty(item.variantId, item.quantity - 1)
                            }
                            className="w-8 h-8 flex items-center justify-center hover:bg-base-200 transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-8 h-8 flex items-center justify-center text-sm tabular-nums border-x border-base-content/15">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQty(item.variantId, item.quantity + 1)
                            }
                            className="w-8 h-8 flex items-center justify-center hover:bg-base-200 transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(item.variantId)}
                          className="p-1.5 hover:opacity-60 transition-opacity"
                          aria-label={dict.remove}
                        >
                          <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                        </button>
                      </div>
                    </div>

                    {/* Line total */}
                    <span className="text-sm shrink-0">
                      {formatPrice(item.price * item.quantity, item.currency)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="shrink-0 px-6 py-5 border-t border-base-200 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm tracking-widest uppercase">
                  {isEs ? "Total estimado" : "Estimated total"}
                </span>
                <span className="text-base">
                  {formatPrice(totalPrice, currency)} {currency}
                </span>
              </div>
              <p className="text-xs text-base-content/40">
                {isEs
                  ? "Impuestos incluidos. Envío calculado al finalizar la compra."
                  : "Duties and taxes included. Shipping is calculated at checkout."}
              </p>
              <button
                onClick={() => {
                  closeCart();
                  router.push(`/${lang}/checkout`);
                }}
                className="w-full py-3.5 text-sm tracking-widest uppercase bg-base-content text-base-100 hover:bg-base-content/90 transition-colors"
              >
                {dict.checkout}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { initMercadoPago, Payment, StatusScreen } from "@mercadopago/sdk-react";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { formatPrice } from "@/lib/i18n-helpers";
import { ShoppingBag, Tag, Loader2, CheckCircle, Clock, XCircle } from "lucide-react";

// Initialize MercadoPago SDK
if (typeof window !== "undefined") {
  initMercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY!, { locale: "es-MX" });
}

type CheckoutDict = {
  title: string;
  orderSummary: string;
  couponPlaceholder: string;
  applyCoupon: string;
  couponApplied: string;
  couponInvalid: string;
  discount: string;
  subtotal: string;
  total: string;
  continueToPay: string;
  processing: string;
  paymentSuccess: string;
  paymentPending: string;
  paymentFailed: string;
  successMessage: string;
  pendingMessage: string;
  failedMessage: string;
  orderLabel: string;
  backToShop: string;
  viewOrders: string;
  guestEmail: string;
  emptyCart: string;
  couponAvailable: string;
  couponUse: string;
  taxLabel: string;
  subtotalBeforeTax: string;
};

type Props = {
  lang: string;
  dict: CheckoutDict;
};

type Step = "summary" | "payment" | "status";

export function CheckoutClient({ lang, dict }: Props) {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();

  const [step, setStep] = useState<Step>("summary");
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [discount, setDiscount] = useState(0);
  const [guestEmail, setGuestEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [brickLoading, setBrickLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Payment state
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [amount, setAmount] = useState(0);
  const [externalRef, setExternalRef] = useState("");
  const [paymentId, setPaymentId] = useState<number | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);

  // Auto-detected coupon & tax rate
  const [availableCoupon, setAvailableCoupon] = useState<{
    code: string;
    discount_percent: number;
  } | null>(null);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [taxRate, setTaxRate] = useState(0.16);
  const [couponValidating, setCouponValidating] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetch("/api/coupons")
      .then((r) => r.json())
      .then((d) => {
        if (d.coupon) setAvailableCoupon(d.coupon);
        if (d.taxRate != null) setTaxRate(d.taxRate);
      })
      .catch(() => {});
  }, [user]);

  const currency = "MXN";
  const subtotal = totalPrice;
  const discountAmount = discountPercent > 0
    ? Math.round(subtotal * (discountPercent / 100) * 100) / 100
    : discount;
  const afterDiscount = subtotal - discountAmount;
  const taxAmount = Math.round((afterDiscount * taxRate / (1 + taxRate)) * 100) / 100;
  const baseAmount = afterDiscount - taxAmount;
  const total = afterDiscount;

  async function applyCouponCode(code: string, percent?: number) {
    setCouponError(null);
    setCouponCode("");

    if (percent) {
      // Already know the percent (from auto-detect)
      setCouponApplied(code.toUpperCase());
      setDiscountPercent(percent);
      setAvailableCoupon(null);
      return;
    }

    // Validate server-side
    setCouponValidating(true);
    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (data.valid) {
        setCouponApplied(data.code);
        setDiscountPercent(data.discount_percent);
        setAvailableCoupon(null);
      } else {
        setCouponError(dict.couponInvalid);
      }
    } catch {
      setCouponError(dict.couponInvalid);
    } finally {
      setCouponValidating(false);
    }
  }

  const handleApplyCoupon = useCallback(() => {
    if (!couponCode.trim()) return;
    applyCouponCode(couponCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [couponCode]);

  const handleContinueToPay = useCallback(async () => {
    if (items.length === 0) return;
    if (!user && !guestEmail.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            quantity: i.quantity,
          })),
          couponCode: couponApplied || undefined,
          email: user?.email || guestEmail || undefined,
          userId: user?.id || undefined,
          lang,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // If coupon error, show it specifically
        if (data.error?.includes("coupon") || data.error?.includes("Coupon")) {
          setCouponError(dict.couponInvalid);
          setCouponApplied(null);
          setDiscount(0);
          setDiscountPercent(0);
        }
        setError(data.error || "Checkout failed");
        setLoading(false);
        return;
      }

      setPreferenceId(data.preferenceId);
      setAmount(data.amount);
      setExternalRef(data.externalReference);
      setDiscount(subtotal - data.amount);
      setStep("payment");
      setBrickLoading(true);
    } catch {
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  }, [items, user, guestEmail, couponApplied, lang, dict.couponInvalid, subtotal]);

  const handlePaymentSubmit = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (param: any) => {
      const formData = param.formData ?? param;
      try {
        const res = await fetch("/api/checkout/process", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            external_reference: externalRef,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Payment failed");
          return;
        }

        setPaymentId(data.paymentId);
        setPaymentStatus(data.status);
        setStep("status");

        if (data.status === "approved") {
          clearCart();
        }
      } catch {
        setError("Payment processing error");
      }
    },
    [externalRef, clearCart]
  );

  // Empty cart state
  if (items.length === 0 && step === "summary") {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-20">
        <ShoppingBag className="h-12 w-12 text-base-content/20" strokeWidth={1} />
        <p className="text-sm tracking-widest uppercase text-base-content/50">
          {dict.emptyCart}
        </p>
        <Link
          href={`/${lang}/shop`}
          className="px-6 py-2.5 text-sm tracking-widest uppercase border border-base-content/20 hover:border-base-content/50 transition-colors"
        >
          {dict.backToShop}
        </Link>
      </div>
    );
  }

  // Status screen after payment
  if (step === "status" && paymentId) {
    const isApproved = paymentStatus === "approved";
    const isPending =
      paymentStatus === "pending" || paymentStatus === "in_process";

    return (
      <div className="flex flex-col items-center gap-6 py-10">
        {isApproved && (
          <>
            <CheckCircle className="h-16 w-16 text-success" strokeWidth={1} />
            <h2 className="text-xl tracking-widest uppercase">
              {dict.paymentSuccess}
            </h2>
            <p className="text-sm text-base-content/60 text-center max-w-md">
              {dict.successMessage}
            </p>
          </>
        )}
        {isPending && (
          <>
            <Clock className="h-16 w-16 text-warning" strokeWidth={1} />
            <h2 className="text-xl tracking-widest uppercase">
              {dict.paymentPending}
            </h2>
            <p className="text-sm text-base-content/60 text-center max-w-md">
              {dict.pendingMessage}
            </p>
          </>
        )}
        {!isApproved && !isPending && (
          <>
            <XCircle className="h-16 w-16 text-error" strokeWidth={1} />
            <h2 className="text-xl tracking-widest uppercase">
              {dict.paymentFailed}
            </h2>
            <p className="text-sm text-base-content/60 text-center max-w-md">
              {dict.failedMessage}
            </p>
          </>
        )}

        <p className="text-xs text-base-content/40 tracking-widest">
          {dict.orderLabel}: {externalRef}
        </p>

        {/* StatusScreen Brick */}
        <div className="w-full max-w-lg mt-4">
          <StatusScreen
            initialization={{ paymentId: String(paymentId) }}
            onReady={() => {}}
            onError={() => {}}
          />
        </div>

        {user && (
          <Link
            href={`/${lang}/orders`}
            className="mt-4 px-8 py-3 text-sm tracking-widest uppercase bg-base-content text-base-100 hover:bg-base-content/90 transition-colors"
          >
            {dict.viewOrders}
          </Link>
        )}

        <Link
          href={`/${lang}/shop`}
          className={`${user ? "mt-2" : "mt-4"} px-8 py-3 text-sm tracking-widest uppercase border border-base-content/20 hover:border-base-content/50 transition-colors`}
        >
          {dict.backToShop}
        </Link>
      </div>
    );
  }

  // Payment step - show Payment Brick
  if (step === "payment" && preferenceId) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl tracking-widest uppercase">{dict.title}</h1>

        {/* Order reference */}
        <p className="text-xs text-base-content/40 tracking-widest">
          {dict.orderLabel}: {externalRef}
        </p>

        {/* Total */}
        <div className="flex items-center justify-between py-4 border-y border-base-content/10">
          <span className="text-sm tracking-widest uppercase">{dict.total}</span>
          <span className="text-lg">{formatPrice(amount, currency)}</span>
        </div>

        {/* Payment Brick */}
        {brickLoading && (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-base-content/40" />
          </div>
        )}

        <div className={brickLoading ? "opacity-0 h-0 overflow-hidden" : ""}>
          <Payment
            initialization={{ amount, preferenceId }}
            customization={{
              paymentMethods: {
                atm: "all",
                ticket: "all",
                creditCard: "all",
                debitCard: "all",
                prepaidCard: "all",
                mercadoPago: "all",
              },
            }}
            onSubmit={handlePaymentSubmit}
            onReady={() => setBrickLoading(false)}
            onError={(err: unknown) => {
              console.error("Payment Brick error:", err);
              setBrickLoading(false);
              setError("Payment form error");
            }}
          />
        </div>

        {error && (
          <p className="text-sm text-error text-center">{error}</p>
        )}
      </div>
    );
  }

  // Summary step
  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl tracking-widest uppercase">{dict.title}</h1>

      {/* Order summary */}
      <div>
        <h2 className="text-sm tracking-widest uppercase text-base-content/50 mb-4">
          {dict.orderSummary}
        </h2>

        <div className="divide-y divide-base-200">
          {items.map((item) => (
            <div key={item.variantId} className="flex gap-4 py-4">
              <div className="relative w-16 h-16 shrink-0 overflow-hidden bg-base-200">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.productName}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                ) : (
                  <div className="w-full h-full bg-base-200" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm tracking-wide uppercase truncate">
                  {item.productName}
                </p>
                <p className="text-sm text-base-content/50">
                  {item.variantLabel}
                </p>
                <p className="text-xs text-base-content/40">
                  x{item.quantity}
                </p>
              </div>
              <span className="text-sm shrink-0">
                {formatPrice(item.price * item.quantity, currency)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Coupon — only for logged-in users (welcome discounts are per-user) */}
      {user && <div className="space-y-2">
        {couponApplied ? (
          <div className="flex items-center gap-2 px-4 py-3 bg-base-200/50 text-sm">
            <Tag className="h-4 w-4 text-success" strokeWidth={1.5} />
            <span className="text-success">{dict.couponApplied}:</span>
            <span className="font-medium">{couponApplied}</span>
            <button
              onClick={() => {
                setCouponApplied(null);
                setDiscount(0);
                setDiscountPercent(0);
              }}
              className="ml-auto text-xs text-base-content/40 hover:text-base-content/70 transition-colors"
            >
              &times;
            </button>
          </div>
        ) : (
          <>
            {/* Auto-detected coupon suggestion */}
            {availableCoupon && (
              <div className="flex items-center gap-3 px-4 py-3 border border-success/30 bg-success/5">
                <Tag className="h-4 w-4 text-success shrink-0" strokeWidth={1.5} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-success">
                    {dict.couponAvailable}
                  </p>
                  <p className="text-xs text-base-content/50 font-mono mt-0.5">
                    {availableCoupon.code} &middot; {availableCoupon.discount_percent}% OFF
                  </p>
                </div>
                <button
                  onClick={() => applyCouponCode(availableCoupon.code, availableCoupon.discount_percent)}
                  className="btn btn-sm btn-outline btn-success text-xs tracking-widest uppercase shrink-0"
                >
                  {dict.couponUse}
                </button>
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder={dict.couponPlaceholder}
                className="flex-1 px-4 py-3 text-sm bg-base-200/50 border-none outline-none placeholder:text-base-content/30 uppercase tracking-widest"
                onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
              />
              <button
                onClick={handleApplyCoupon}
                disabled={couponValidating}
                className="px-5 py-3 text-sm tracking-widest uppercase bg-base-200 hover:bg-base-300 transition-colors disabled:opacity-40"
              >
                {couponValidating ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : (
                  dict.applyCoupon
                )}
              </button>
            </div>
          </>
        )}
        {couponError && (
          <p className="text-sm text-error mt-2">{couponError}</p>
        )}
      </div>}

      {/* Totals */}
      <div className="space-y-2.5 py-4 border-t border-base-content/10">
        <div className="flex items-center justify-between">
          <span className="text-sm text-base-content/60">{dict.subtotal}</span>
          <span className="text-sm">{formatPrice(subtotal, currency)}</span>
        </div>
        {discountAmount > 0 && (
          <div className="flex items-center justify-between text-success">
            <span className="text-sm">{dict.discount} ({discountPercent}%)</span>
            <span className="text-sm">-{formatPrice(discountAmount, currency)}</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-xs text-base-content/40">{dict.subtotalBeforeTax}</span>
          <span className="text-xs text-base-content/40">{formatPrice(baseAmount, currency)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-base-content/40">{dict.taxLabel}</span>
          <span className="text-xs text-base-content/40">{formatPrice(taxAmount, currency)}</span>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-base-content/10">
          <span className="text-sm tracking-widest uppercase">{dict.total}</span>
          <span className="text-lg">{formatPrice(total, currency)}</span>
        </div>
      </div>

      {/* Guest email */}
      {!user && (
        <div>
          <input
            type="email"
            value={guestEmail}
            onChange={(e) => setGuestEmail(e.target.value)}
            placeholder={dict.guestEmail}
            className="w-full px-4 py-3 text-sm bg-base-200/50 border-none outline-none placeholder:text-base-content/30"
          />
        </div>
      )}

      {error && (
        <p className="text-sm text-error text-center">{error}</p>
      )}

      {/* Continue button */}
      <button
        onClick={handleContinueToPay}
        disabled={loading || (items.length === 0) || (!user && !guestEmail.trim())}
        className="w-full py-3.5 text-sm tracking-widest uppercase bg-base-content text-base-100 hover:bg-base-content/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {dict.processing}
          </>
        ) : (
          dict.continueToPay
        )}
      </button>
    </div>
  );
}

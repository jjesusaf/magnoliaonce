/**
 * Unified tracking helpers for Meta Pixel + Google Analytics 4.
 *
 * Client-side: fires browser pixels (fbq / gtag).
 * Server-side: call `serverTrack()` from API routes for Meta Conversions API.
 */

/* ─────────────── Types ─────────────── */

type ProductData = {
  id: string;
  name: string;
  price: number;
  currency: string;
  category?: string;
  variant?: string;
  quantity?: number;
};

type PurchaseData = {
  orderId: string;
  total: number;
  currency: string;
  items: ProductData[];
  coupon?: string;
};

/* ─────────────── Client-side helpers ─────────────── */

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
  }
}

function fbq(...args: unknown[]) {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq(...args);
  }
}

function gtag(...args: unknown[]) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag(...args);
  }
}

/* ── EnterShop: user navigated to shop from home ── */
export function trackEnterShop() {
  fbq("trackCustom", "EnterShop");

  gtag("event", "enter_shop", {
    event_category: "navigation",
  });
}

/* ── ViewContent: user viewed a product ── */
export function trackViewContent(product: ProductData) {
  fbq("track", "ViewContent", {
    content_ids: [product.id],
    content_name: product.name,
    content_type: "product",
    value: product.price,
    currency: product.currency,
  });

  gtag("event", "view_item", {
    currency: product.currency,
    value: product.price,
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        item_category: product.category,
        item_variant: product.variant,
        price: product.price,
        quantity: 1,
      },
    ],
  });
}

/* ── AddToCart ── */
export function trackAddToCart(product: ProductData) {
  fbq("track", "AddToCart", {
    content_ids: [product.id],
    content_name: product.name,
    content_type: "product",
    value: product.price * (product.quantity ?? 1),
    currency: product.currency,
  });

  gtag("event", "add_to_cart", {
    currency: product.currency,
    value: product.price * (product.quantity ?? 1),
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        item_variant: product.variant,
        price: product.price,
        quantity: product.quantity ?? 1,
      },
    ],
  });
}

/* ── InitiateCheckout ── */
export function trackInitiateCheckout(
  total: number,
  currency: string,
  items: ProductData[]
) {
  fbq("track", "InitiateCheckout", {
    content_ids: items.map((i) => i.id),
    num_items: items.length,
    value: total,
    currency,
  });

  gtag("event", "begin_checkout", {
    currency,
    value: total,
    items: items.map((i) => ({
      item_id: i.id,
      item_name: i.name,
      item_variant: i.variant,
      price: i.price,
      quantity: i.quantity ?? 1,
    })),
  });
}

/* ── Purchase ── */
export function trackPurchase(data: PurchaseData) {
  fbq("track", "Purchase", {
    content_ids: data.items.map((i) => i.id),
    content_type: "product",
    num_items: data.items.length,
    value: data.total,
    currency: data.currency,
  });

  gtag("event", "purchase", {
    transaction_id: data.orderId,
    value: data.total,
    currency: data.currency,
    coupon: data.coupon,
    items: data.items.map((i) => ({
      item_id: i.id,
      item_name: i.name,
      item_variant: i.variant,
      price: i.price,
      quantity: i.quantity ?? 1,
    })),
  });
}

/* ─────────────── Server-side: Meta Conversions API ─────────────── */

const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const META_ACCESS_TOKEN = process.env.META_CONVERSIONS_API_TOKEN;

type ServerEventData = {
  eventName: string;
  eventId?: string;
  email?: string;
  value?: number;
  currency?: string;
  contentIds?: string[];
  contentType?: string;
  userAgent?: string;
  sourceUrl?: string;
  clientIpAddress?: string;
};

export async function serverTrack(data: ServerEventData) {
  if (!META_PIXEL_ID || !META_ACCESS_TOKEN) return;

  const hashedEmail = data.email
    ? await hashSha256(data.email.toLowerCase().trim())
    : undefined;

  const event = {
    event_name: data.eventName,
    event_time: Math.floor(Date.now() / 1000),
    event_id: data.eventId,
    action_source: "website",
    event_source_url: data.sourceUrl,
    user_data: {
      em: hashedEmail ? [hashedEmail] : undefined,
      client_ip_address: data.clientIpAddress,
      client_user_agent: data.userAgent,
    },
    custom_data: {
      value: data.value,
      currency: data.currency,
      content_ids: data.contentIds,
      content_type: data.contentType,
    },
  };

  try {
    await fetch(
      `https://graph.facebook.com/v21.0/${META_PIXEL_ID}/events?access_token=${META_ACCESS_TOKEN}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: [event] }),
      }
    );
  } catch {
    // Silently fail — tracking should never break the app
  }
}

async function hashSha256(value: string): Promise<string> {
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const buf = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(value)
    );
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
  // Node.js fallback
  const { createHash } = await import("crypto");
  return createHash("sha256").update(value).digest("hex");
}

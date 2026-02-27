import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { supabaseAdmin, insertOrderEvent } from "@/lib/supabase/admin";
import { preferenceClient } from "@/lib/mercadopago";
import { getImageUrl } from "@/lib/storage";

const BUCKET = "magnolia";

type CartItemPayload = {
  productId: string;
  variantId: string;
  quantity: number;
};

type CheckoutBody = {
  items: CartItemPayload[];
  couponCode?: string;
  email?: string;
  lang?: string;
  userId?: string;
};

function generateRef() {
  const d = new Date();
  const ymd =
    d.getFullYear().toString() +
    String(d.getMonth() + 1).padStart(2, "0") +
    String(d.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `MO-${ymd}-${rand}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CheckoutBody;
    const { items, couponCode, email, lang = "es", userId } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const supabase = getSupabase();

    // 1. Re-fetch prices from DB to prevent tampering
    const variantIds = items.map((i) => i.variantId);
    const { data: variants, error: variantsError } = await supabase
      .from("product_variants")
      .select("id, product_id, label, price, currency, is_available")
      .in("id", variantIds);

    if (variantsError || !variants) {
      return NextResponse.json(
        { error: "Failed to validate items" },
        { status: 500 }
      );
    }

    // Build variant map
    const variantMap = new Map(variants.map((v) => [v.id, v]));

    // Validate all items exist, are available, and are MXN
    for (const item of items) {
      const v = variantMap.get(item.variantId);
      if (!v) {
        return NextResponse.json(
          { error: `Variant ${item.variantId} not found` },
          { status: 400 }
        );
      }
      if (!v.is_available) {
        return NextResponse.json(
          { error: `Variant ${v.label} is not available` },
          { status: 400 }
        );
      }
      if (v.currency !== "MXN") {
        return NextResponse.json(
          { error: `Only MXN payments are supported at this time` },
          { status: 400 }
        );
      }
    }

    // Fetch product names and primary images for order items
    const productIds = [...new Set(variants.map((v) => v.product_id))];
    const { data: products } = await supabase
      .from("products")
      .select("id, name_es, name_en")
      .in("id", productIds);

    const productMap = new Map(products?.map((p) => [p.id, p]) ?? []);

    const { data: images } = await supabase
      .from("product_images")
      .select("product_id, storage_path")
      .in("product_id", productIds)
      .eq("is_primary", true);

    const imageMap = new Map(
      images?.map((img) => [
        img.product_id,
        getImageUrl(BUCKET, img.storage_path, { width: 200, height: 200, resize: "cover" }),
      ]) ?? []
    );

    // 2. Calculate subtotal server-side
    let subtotal = 0;
    const orderItems = items.map((item) => {
      const v = variantMap.get(item.variantId)!;
      const p = productMap.get(v.product_id);
      const lineTotal = v.price * item.quantity;
      subtotal += lineTotal;
      return {
        product_id: v.product_id,
        variant_id: item.variantId,
        product_name: lang === "en" ? (p?.name_en ?? "") : (p?.name_es ?? ""),
        variant_label: v.label,
        unit_price: v.price,
        quantity: item.quantity,
        image_url: imageMap.get(v.product_id) ?? null,
      };
    });

    // 3. Handle coupon
    let discountAmount = 0;
    let couponId: string | null = null;

    if (couponCode) {
      // Coupons are welcome discounts tied to a user — guests can't use them
      if (!userId) {
        return NextResponse.json(
          { error: "Login required to use coupons" },
          { status: 400 }
        );
      }

      const { data: coupon } = await supabaseAdmin
        .from("coupons")
        .select("*")
        .eq("code", couponCode.toUpperCase())
        .eq("is_redeemed", false)
        .single();

      if (!coupon) {
        return NextResponse.json(
          { error: "Invalid or expired coupon" },
          { status: 400 }
        );
      }

      // Validate coupon belongs to this user
      if (coupon.user_id !== userId) {
        return NextResponse.json(
          { error: "Invalid or expired coupon" },
          { status: 400 }
        );
      }

      // Check expiry
      if (new Date(coupon.expires_at) < new Date()) {
        return NextResponse.json(
          { error: "Coupon has expired" },
          { status: 400 }
        );
      }

      discountAmount = Math.round(subtotal * (coupon.discount_percent / 100) * 100) / 100;
      couponId = coupon.id;
    }

    const total = subtotal - discountAmount;

    // 3b. Compute tax (IVA inclusive — extract from total)
    const { data: taxSetting } = await supabaseAdmin
      .from("store_settings")
      .select("value")
      .eq("key", "tax_rate")
      .single();

    const taxRate = taxSetting ? Number(taxSetting.value) : 0.16;
    const taxAmount = Math.round((total * taxRate / (1 + taxRate)) * 100) / 100;

    const externalReference = generateRef();

    // 4. Insert order (admin client to bypass RLS)
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        user_id: userId ?? null,
        email: email ?? null,
        lang,
        currency: "MXN",
        subtotal,
        discount_amount: discountAmount,
        tax_amount: taxAmount,
        total,
        coupon_id: couponId,
        status: "pending",
        external_reference: externalReference,
      })
      .select("id")
      .single();

    if (orderError || !order) {
      console.error("Order insert error:", orderError);
      return NextResponse.json(
        { error: "Failed to create order" },
        { status: 500 }
      );
    }

    // 5. Insert order items (admin client to bypass RLS)
    const { error: itemsError } = await supabaseAdmin
      .from("order_items")
      .insert(orderItems.map((oi) => ({ ...oi, order_id: order.id })));

    if (itemsError) {
      console.error("Order items insert error:", itemsError);
      return NextResponse.json(
        { error: "Failed to create order items" },
        { status: 500 }
      );
    }

    // 6. Insert order_created event
    await insertOrderEvent(order.id, "order_created", {
      total,
      items_count: orderItems.length,
    });

    // 7. Create MercadoPago Preference
    const preference = await preferenceClient.create({
      body: {
        items: orderItems.map((oi) => ({
          id: oi.variant_id,
          title: `${oi.product_name} – ${oi.variant_label}`,
          quantity: oi.quantity,
          unit_price: oi.unit_price,
          currency_id: "MXN",
        })),
        external_reference: externalReference,
      },
    });

    // Update order with preference id
    await supabaseAdmin
      .from("orders")
      .update({ mp_preference_id: preference.id })
      .eq("id", order.id);

    return NextResponse.json({
      preferenceId: preference.id,
      orderId: order.id,
      amount: total,
      subtotal,
      discountAmount,
      taxAmount,
      taxRate,
      externalReference,
    });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

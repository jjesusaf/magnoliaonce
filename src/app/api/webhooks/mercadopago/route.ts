import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { paymentClient } from "@/lib/mercadopago";
import { supabaseAdmin, insertOrderEvent } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 1. Validate HMAC signature (only when both header and secret are present)
    const xSignature = request.headers.get("x-signature");
    const xRequestId = request.headers.get("x-request-id");
    const secret = process.env.MP_WEBHOOK_SECRET;

    if (secret && xSignature && xRequestId) {
      const parts = xSignature.split(",");
      let ts = "";
      let hash = "";
      for (const part of parts) {
        const [key, value] = part.trim().split("=");
        if (key === "ts") ts = value;
        if (key === "v1") hash = value;
      }

      if (ts && hash) {
        const dataId = body.data?.id ?? "";
        const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
        const computed = createHmac("sha256", secret)
          .update(manifest)
          .digest("hex");

        if (computed !== hash) {
          console.warn("Webhook signature mismatch");
          return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
        }
      }
    }

    // 2. Determine if this is a payment notification
    // MP can send: { type: "payment" } or { action: "payment.updated" }
    const isPayment =
      body.type === "payment" ||
      body.action?.startsWith("payment.");

    if (!isPayment) {
      return NextResponse.json({ received: true });
    }

    const paymentId = body.data?.id;
    if (!paymentId) {
      return NextResponse.json({ error: "Missing payment id" }, { status: 400 });
    }

    // 3. Fetch full payment from MP
    let payment;
    try {
      payment = await paymentClient.get({ id: Number(paymentId) });
    } catch (err) {
      // Test simulation sends fake id "123456" — just acknowledge it
      console.warn("Could not fetch payment (likely test simulation):", paymentId, err);
      return NextResponse.json({ received: true });
    }

    if (!payment.external_reference) {
      return NextResponse.json({ received: true });
    }

    // 4. Map status and update order
    const orderStatus = mapMpStatus(payment.status ?? "");

    const { data: order } = await supabaseAdmin
      .from("orders")
      .update({
        mp_payment_id: String(payment.id),
        mp_status: payment.status ?? null,
        mp_status_detail: payment.status_detail ?? null,
        status: orderStatus,
      })
      .eq("external_reference", payment.external_reference)
      .select("id, coupon_id")
      .single();

    // 5. Insert order event (skip if already exists to avoid duplicates)
    if (order) {
      const eventMap: Record<string, string> = {
        paid: "payment_approved",
        pending: "payment_pending",
        failed: "payment_failed",
        cancelled: "payment_cancelled",
      };
      const eventType = eventMap[orderStatus] ?? "payment_pending";

      const { data: existing } = await supabaseAdmin
        .from("order_events")
        .select("id")
        .eq("order_id", order.id)
        .eq("event_type", eventType)
        .limit(1);

      if (!existing?.length) {
        await insertOrderEvent(order.id, eventType, {
          mp_payment_id: String(payment.id),
        });
      }
    }

    // 6. If approved and has coupon, mark coupon as redeemed
    if (orderStatus === "paid" && order?.coupon_id) {
      await supabaseAdmin
        .from("coupons")
        .update({
          is_redeemed: true,
          redeemed_at: new Date().toISOString(),
        })
        .eq("id", order.coupon_id);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

function mapMpStatus(mpStatus: string): string {
  switch (mpStatus) {
    case "approved":
      return "paid";
    case "in_process":
    case "pending":
      return "pending";
    case "rejected":
      return "failed";
    case "cancelled":
      return "cancelled";
    default:
      return "pending";
  }
}

import { NextRequest, NextResponse } from "next/server";
import { paymentClient } from "@/lib/mercadopago";
import { supabaseAdmin, insertOrderEvent } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { external_reference, ...formData } = body;

    if (!external_reference) {
      return NextResponse.json(
        { error: "Missing external_reference" },
        { status: 400 }
      );
    }

    // Build payment body
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
    const isPublicUrl = appUrl.startsWith("https://");

    // Create payment via MercadoPago API
    const payment = await paymentClient.create({
      body: {
        ...formData,
        external_reference,
        ...(isPublicUrl && {
          notification_url: `${appUrl}/api/webhooks/mercadopago`,
        }),
      },
    });

    // Update order with payment info
    const { data: updatedOrder } = await supabaseAdmin
      .from("orders")
      .update({
        mp_payment_id: String(payment.id),
        mp_status: payment.status ?? null,
        mp_status_detail: payment.status_detail ?? null,
        status: mapMpStatus(payment.status ?? ""),
      })
      .eq("external_reference", external_reference)
      .select("id")
      .single();

    // Insert payment event
    if (updatedOrder) {
      const eventType =
        payment.status === "approved"
          ? "payment_approved"
          : payment.status === "rejected"
            ? "payment_failed"
            : "payment_pending";
      await insertOrderEvent(updatedOrder.id, eventType, {
        mp_payment_id: String(payment.id),
      });
    }

    return NextResponse.json({
      paymentId: payment.id,
      status: payment.status,
      statusDetail: payment.status_detail,
    });
  } catch (err) {
    console.error("Process payment error:", err);
    return NextResponse.json(
      { error: "Payment processing failed" },
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

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin, insertOrderEvent } from "@/lib/supabase/admin";

async function verifyAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabaseAdmin
    .from("profiles")
    .select("is_admin")
    .eq("user_id", user.id)
    .single();

  return data?.is_admin ? user : null;
}

export async function GET() {
  const user = await verifyAdmin();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("orders")
    .select(
      "id, external_reference, total, currency, created_at, email, order_items(id), order_events(id, event_type, metadata, created_at)"
    )
    .eq("status", "paid")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

const VALID_EVENTS = ["preparing", "ready", "delivered"] as const;

export async function POST(request: NextRequest) {
  const user = await verifyAdmin();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { orderId, eventType } = await request.json();

  if (!orderId || !VALID_EVENTS.includes(eventType)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { data: order } = await supabaseAdmin
    .from("orders")
    .select("id")
    .eq("id", orderId)
    .single();

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  await insertOrderEvent(orderId, eventType);

  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ coupon: null, taxRate: 0.16 });
  }

  const [{ data: coupon }, { data: taxSetting }] = await Promise.all([
    supabaseAdmin
      .from("coupons")
      .select("code, discount_percent, expires_at")
      .eq("user_id", user.id)
      .eq("is_redeemed", false)
      .gt("expires_at", new Date().toISOString())
      .limit(1)
      .single(),
    supabaseAdmin
      .from("store_settings")
      .select("value")
      .eq("key", "tax_rate")
      .single(),
  ]);

  const taxRate = taxSetting ? Number(taxSetting.value) : 0.16;

  return NextResponse.json({ coupon: coupon ?? null, taxRate });
}

// POST: validate a specific coupon code
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ valid: false });
  }

  const { code } = await request.json();
  if (!code) {
    return NextResponse.json({ valid: false });
  }

  const { data: coupon } = await supabaseAdmin
    .from("coupons")
    .select("code, discount_percent, expires_at, user_id")
    .eq("code", code.toUpperCase())
    .eq("is_redeemed", false)
    .single();

  if (!coupon || coupon.user_id !== user.id) {
    return NextResponse.json({ valid: false });
  }

  if (new Date(coupon.expires_at) < new Date()) {
    return NextResponse.json({ valid: false });
  }

  return NextResponse.json({
    valid: true,
    discount_percent: coupon.discount_percent,
    code: coupon.code,
  });
}

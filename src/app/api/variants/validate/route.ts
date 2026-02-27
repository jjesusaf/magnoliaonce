import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const ids = request.nextUrl.searchParams.get("ids");
  if (!ids) {
    return NextResponse.json({ validIds: [] });
  }

  const variantIds = ids.split(",").filter(Boolean);
  if (variantIds.length === 0) {
    return NextResponse.json({ validIds: [] });
  }

  const supabase = getSupabase();
  const { data } = await supabase
    .from("product_variants")
    .select("id")
    .in("id", variantIds)
    .eq("is_available", true);

  const validIds = data?.map((v) => v.id) ?? [];
  return NextResponse.json({ validIds });
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin, insertOrderEvent } from "@/lib/supabase/admin";

const BUCKET = "magnolia";

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

export async function POST(request: NextRequest) {
  const user = await verifyAdmin();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const orderId = formData.get("orderId") as string;
  const files = formData.getAll("photos") as File[];

  if (!orderId || files.length === 0) {
    return NextResponse.json({ error: "Missing orderId or photos" }, { status: 400 });
  }

  // Verify order exists
  const { data: order } = await supabaseAdmin
    .from("orders")
    .select("id")
    .eq("id", orderId)
    .single();

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // Upload each photo to storage
  const imageUrls: string[] = [];
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

  for (const file of files) {
    const ext = file.name.split(".").pop() ?? "jpg";
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`;
    const storagePath = `orders/${orderId}/${fileName}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      continue;
    }

    imageUrls.push(
      `${baseUrl}/storage/v1/object/public/${BUCKET}/${storagePath}`
    );
  }

  if (imageUrls.length === 0) {
    return NextResponse.json({ error: "All uploads failed" }, { status: 500 });
  }

  // Insert order event with photo URLs
  await insertOrderEvent(orderId, "photo_added", {
    image_urls: imageUrls,
  });

  return NextResponse.json({ ok: true, imageUrls });
}

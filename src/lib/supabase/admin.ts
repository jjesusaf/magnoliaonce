import { createClient } from "@supabase/supabase-js";
import { Database, Json } from "../database.types";

export const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { db: { schema: "magnolia" } }
);

export async function insertOrderEvent(
  orderId: string,
  eventType: string,
  metadata: Record<string, Json> = {}
) {
  await supabaseAdmin
    .from("order_events")
    .insert({ order_id: orderId, event_type: eventType, metadata });
}

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Database, Json } from "../database.types";

let _admin: SupabaseClient<Database, "magnolia"> | null = null;

export function getSupabaseAdmin() {
  if (!_admin) {
    _admin = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { db: { schema: "magnolia" } }
    );
  }
  return _admin;
}

/** @deprecated Use getSupabaseAdmin() instead */
export const supabaseAdmin = new Proxy({} as SupabaseClient<Database, "magnolia">, {
  get(_, prop) {
    return (getSupabaseAdmin() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export async function insertOrderEvent(
  orderId: string,
  eventType: string,
  metadata: Record<string, Json> = {}
) {
  await supabaseAdmin
    .from("order_events")
    .insert({ order_id: orderId, event_type: eventType, metadata });
}

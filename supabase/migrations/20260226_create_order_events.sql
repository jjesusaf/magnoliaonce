-- Order events for tracking timeline
CREATE TABLE magnolia.order_events (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    uuid NOT NULL REFERENCES magnolia.orders(id) ON DELETE CASCADE,
  event_type  text NOT NULL,
  metadata    jsonb DEFAULT '{}',
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_order_events_order_id ON magnolia.order_events(order_id);

ALTER TABLE magnolia.order_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own order events" ON magnolia.order_events
  FOR SELECT USING (
    order_id IN (SELECT id FROM magnolia.orders WHERE user_id = auth.uid())
  );

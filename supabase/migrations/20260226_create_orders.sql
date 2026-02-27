-- Orders table
CREATE TABLE magnolia.orders (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            uuid REFERENCES auth.users(id),
  email              text,
  lang               text NOT NULL DEFAULT 'es',
  currency           text NOT NULL DEFAULT 'MXN',
  subtotal           numeric(10,2) NOT NULL,
  discount_amount    numeric(10,2) NOT NULL DEFAULT 0,
  total              numeric(10,2) NOT NULL,
  coupon_id          uuid REFERENCES magnolia.coupons(id),
  status             text NOT NULL DEFAULT 'pending',
  mp_preference_id   text,
  mp_payment_id      text,
  mp_status          text,
  mp_status_detail   text,
  external_reference text UNIQUE NOT NULL,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);

-- Order items table
CREATE TABLE magnolia.order_items (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      uuid NOT NULL REFERENCES magnolia.orders(id) ON DELETE CASCADE,
  product_id    uuid NOT NULL REFERENCES magnolia.products(id),
  variant_id    uuid NOT NULL REFERENCES magnolia.product_variants(id),
  product_name  text NOT NULL,
  variant_label text NOT NULL,
  unit_price    numeric(10,2) NOT NULL,
  quantity      integer NOT NULL CHECK (quantity > 0),
  image_url     text
);

-- Indexes
CREATE INDEX idx_orders_user_id ON magnolia.orders(user_id);
CREATE INDEX idx_orders_status ON magnolia.orders(status);
CREATE INDEX idx_orders_external_ref ON magnolia.orders(external_reference);
CREATE INDEX idx_order_items_order_id ON magnolia.order_items(order_id);

-- RLS
ALTER TABLE magnolia.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own orders" ON magnolia.orders
  FOR SELECT USING (auth.uid() = user_id);

ALTER TABLE magnolia.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own order items" ON magnolia.order_items
  FOR SELECT USING (
    order_id IN (SELECT id FROM magnolia.orders WHERE user_id = auth.uid())
  );

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION magnolia.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON magnolia.orders
  FOR EACH ROW EXECUTE FUNCTION magnolia.update_updated_at();

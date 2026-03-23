import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Img,
  Row,
  Column,
  Hr,
  Link,
} from "@react-email/components";

type OrderItem = {
  product_name: string;
  variant_label: string;
  quantity: number;
  unit_price: number;
  image_url: string | null;
};

type Props = {
  orderRef: string;
  recipientName: string;
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  currency: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string | null;
  shippingZip: string | null;
  giftMessage: string | null;
  deliveryDate: string | null;
  deliverySlot: string | null;
  lang: string;
  orderUrl: string;
};

function formatPrice(amount: number, currency: string) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency,
  }).format(amount);
}

export function OrderConfirmationEmail({
  orderRef,
  recipientName,
  items,
  subtotal,
  discountAmount,
  total,
  currency,
  shippingAddress,
  shippingCity,
  shippingState,
  shippingZip,
  giftMessage,
  deliveryDate,
  deliverySlot,
  lang,
  orderUrl,
}: Props) {
  const isEs = lang === "es";

  const slotLabels: Record<string, string> = {
    morning: isEs ? "Mañana (9am - 1pm)" : "Morning (9am - 1pm)",
    afternoon: isEs ? "Tarde (1pm - 5pm)" : "Afternoon (1pm - 5pm)",
    evening: isEs ? "Noche (5pm - 8pm)" : "Evening (5pm - 8pm)",
  };

  const formattedDeliveryDate = deliveryDate
    ? new Date(deliveryDate + "T12:00:00").toLocaleDateString(
        isEs ? "es-MX" : "en-US",
        { weekday: "long", day: "numeric", month: "long" }
      )
    : null;

  return (
    <Html lang={lang}>
      <Head />
      <Body style={body}>
        <Container style={container}>
          {/* Logo */}
          <Section style={logoSection}>
            <Img
              src="https://magnoliaonce.com/images/logo.svg"
              alt="Magnolia Once"
              width={160}
              height={32}
              style={logo}
            />
          </Section>

          {/* Header */}
          <Section style={header}>
            <Text style={heading}>
              {isEs ? "Pedido confirmado" : "Order confirmed"}
            </Text>
            <Text style={subheading}>
              {isEs
                ? `Gracias por tu compra, ${recipientName}. Tu pedido ha sido recibido y confirmado.`
                : `Thank you for your purchase, ${recipientName}. Your order has been received and confirmed.`}
            </Text>
            <Text style={refText}>
              {isEs ? "Referencia" : "Reference"}: {orderRef}
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Items */}
          <Section>
            <Text style={sectionTitle}>
              {isEs ? "Resumen del pedido" : "Order summary"}
            </Text>
            {items.map((item, i) => (
              <Row key={i} style={itemRow}>
                <Column style={itemImageCol}>
                  {item.image_url ? (
                    <Img
                      src={item.image_url}
                      alt={item.product_name}
                      width={60}
                      height={60}
                      style={itemImage}
                    />
                  ) : (
                    <div style={itemImagePlaceholder} />
                  )}
                </Column>
                <Column style={itemDetailsCol}>
                  <Text style={itemName}>{item.product_name}</Text>
                  <Text style={itemVariant}>{item.variant_label}</Text>
                  <Text style={itemQty}>x{item.quantity}</Text>
                </Column>
                <Column style={itemPriceCol}>
                  <Text style={itemPrice}>
                    {formatPrice(item.unit_price * item.quantity, currency)}
                  </Text>
                </Column>
              </Row>
            ))}
          </Section>

          <Hr style={divider} />

          {/* Totals */}
          <Section>
            <Row style={totalRow}>
              <Column>
                <Text style={totalLabel}>Subtotal</Text>
              </Column>
              <Column>
                <Text style={totalValue}>
                  {formatPrice(subtotal, currency)}
                </Text>
              </Column>
            </Row>
            {discountAmount > 0 && (
              <Row style={totalRow}>
                <Column>
                  <Text style={{ ...totalLabel, color: "#22c55e" }}>
                    {isEs ? "Descuento" : "Discount"}
                  </Text>
                </Column>
                <Column>
                  <Text style={{ ...totalValue, color: "#22c55e" }}>
                    -{formatPrice(discountAmount, currency)}
                  </Text>
                </Column>
              </Row>
            )}
            <Row style={totalRow}>
              <Column>
                <Text style={grandTotalLabel}>Total</Text>
              </Column>
              <Column>
                <Text style={grandTotalValue}>
                  {formatPrice(total, currency)}
                </Text>
              </Column>
            </Row>
          </Section>

          <Hr style={divider} />

          {/* Shipping */}
          {/* Delivery date */}
          {formattedDeliveryDate && (
            <>
              <Hr style={divider} />
              <Section>
                <Text style={sectionTitle}>
                  {isEs ? "Fecha de entrega" : "Delivery date"}
                </Text>
                <Text style={shippingText}>
                  {formattedDeliveryDate}
                  {deliverySlot ? ` — ${slotLabels[deliverySlot] ?? deliverySlot}` : ""}
                </Text>
              </Section>
            </>
          )}

          <Hr style={divider} />

          <Section>
            <Text style={sectionTitle}>
              {isEs ? "Datos de envio" : "Shipping details"}
            </Text>
            <Text style={shippingText}>{recipientName}</Text>
            <Text style={shippingText}>{shippingAddress}</Text>
            <Text style={shippingText}>
              {shippingCity}
              {shippingState ? `, ${shippingState}` : ""}
              {shippingZip ? ` ${shippingZip}` : ""}
            </Text>
          </Section>

          {/* Gift message */}
          {giftMessage && (
            <>
              <Hr style={divider} />
              <Section>
                <Text style={sectionTitle}>
                  {isEs ? "Mensaje de regalo" : "Gift message"}
                </Text>
                <Text style={giftText}>{giftMessage}</Text>
              </Section>
            </>
          )}

          <Hr style={divider} />

          {/* CTA */}
          <Section style={ctaSection}>
            <Link href={orderUrl} style={ctaButton}>
              {isEs ? "Ver mi pedido" : "View my order"}
            </Link>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Magnolia Once — {isEs ? "Estudio Floral Contemporaneo" : "Contemporary Floral Studio"}
            </Text>
            <Text style={footerText}>magnoliaonce.com</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

/* ── Styles ── */

const body: React.CSSProperties = {
  backgroundColor: "#F4F0EB",
  fontFamily: "'Georgia', 'Times New Roman', serif",
  margin: 0,
  padding: 0,
};

const container: React.CSSProperties = {
  maxWidth: "560px",
  margin: "0 auto",
  backgroundColor: "#ffffff",
};

const logoSection: React.CSSProperties = {
  padding: "32px 40px 24px",
  textAlign: "center",
};

const logo: React.CSSProperties = {
  margin: "0 auto",
};

const header: React.CSSProperties = {
  padding: "0 40px 24px",
  textAlign: "center",
};

const heading: React.CSSProperties = {
  fontSize: "22px",
  letterSpacing: "0.15em",
  textTransform: "uppercase" as const,
  color: "#1a1a1a",
  margin: "0 0 12px",
};

const subheading: React.CSSProperties = {
  fontSize: "14px",
  color: "#666",
  lineHeight: "1.6",
  margin: "0 0 8px",
};

const refText: React.CSSProperties = {
  fontSize: "12px",
  color: "#999",
  letterSpacing: "0.1em",
  textTransform: "uppercase" as const,
  margin: 0,
};

const divider: React.CSSProperties = {
  borderColor: "#eee",
  margin: "0 40px",
};

const sectionTitle: React.CSSProperties = {
  fontSize: "11px",
  letterSpacing: "0.15em",
  textTransform: "uppercase" as const,
  color: "#999",
  padding: "20px 40px 12px",
  margin: 0,
};

const itemRow: React.CSSProperties = {
  padding: "8px 40px",
};

const itemImageCol: React.CSSProperties = {
  width: "60px",
  verticalAlign: "top",
};

const itemImage: React.CSSProperties = {
  objectFit: "cover" as const,
  borderRadius: "0",
};

const itemImagePlaceholder: React.CSSProperties = {
  width: "60px",
  height: "60px",
  backgroundColor: "#f0f0f0",
};

const itemDetailsCol: React.CSSProperties = {
  verticalAlign: "top",
  paddingLeft: "12px",
};

const itemName: React.CSSProperties = {
  fontSize: "13px",
  letterSpacing: "0.05em",
  textTransform: "uppercase" as const,
  color: "#1a1a1a",
  margin: "0 0 2px",
};

const itemVariant: React.CSSProperties = {
  fontSize: "12px",
  color: "#999",
  margin: "0 0 2px",
};

const itemQty: React.CSSProperties = {
  fontSize: "12px",
  color: "#999",
  margin: 0,
};

const itemPriceCol: React.CSSProperties = {
  verticalAlign: "top",
  textAlign: "right" as const,
};

const itemPrice: React.CSSProperties = {
  fontSize: "13px",
  color: "#1a1a1a",
  margin: 0,
};

const totalRow: React.CSSProperties = {
  padding: "4px 40px",
};

const totalLabel: React.CSSProperties = {
  fontSize: "13px",
  color: "#666",
  margin: 0,
};

const totalValue: React.CSSProperties = {
  fontSize: "13px",
  color: "#1a1a1a",
  textAlign: "right" as const,
  margin: 0,
};

const grandTotalLabel: React.CSSProperties = {
  fontSize: "14px",
  letterSpacing: "0.1em",
  textTransform: "uppercase" as const,
  color: "#1a1a1a",
  margin: "8px 0 0",
};

const grandTotalValue: React.CSSProperties = {
  fontSize: "16px",
  color: "#1a1a1a",
  textAlign: "right" as const,
  margin: "8px 0 0",
  fontWeight: "bold" as const,
};

const shippingText: React.CSSProperties = {
  fontSize: "13px",
  color: "#1a1a1a",
  padding: "0 40px",
  margin: "0 0 2px",
  lineHeight: "1.5",
};

const giftText: React.CSSProperties = {
  fontSize: "13px",
  color: "#666",
  fontStyle: "italic" as const,
  padding: "0 40px",
  margin: 0,
  lineHeight: "1.5",
};

const ctaSection: React.CSSProperties = {
  padding: "24px 40px",
  textAlign: "center",
};

const ctaButton: React.CSSProperties = {
  display: "inline-block",
  backgroundColor: "#1a1a1a",
  color: "#ffffff",
  fontSize: "12px",
  letterSpacing: "0.15em",
  textTransform: "uppercase" as const,
  textDecoration: "none",
  padding: "14px 32px",
};

const footer: React.CSSProperties = {
  padding: "24px 40px 32px",
  textAlign: "center",
  backgroundColor: "#F4F0EB",
};

const footerText: React.CSSProperties = {
  fontSize: "11px",
  color: "#999",
  margin: "0 0 4px",
};

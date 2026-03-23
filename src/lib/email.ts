import { Resend } from "resend";
import { OrderConfirmationEmail } from "@/components/emails/order-confirmation";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "Magnolia Once <pedidos@magnoliaonce.com>";
const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://magnoliaonce.com";

type OrderEmailData = {
  to: string;
  orderRef: string;
  recipientName: string;
  items: {
    product_name: string;
    variant_label: string;
    quantity: number;
    unit_price: number;
    image_url: string | null;
  }[];
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
  lang: string;
};

export async function sendOrderConfirmation(data: OrderEmailData) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not configured — skipping order email");
    return;
  }

  const isEs = data.lang === "es";
  const orderUrl = `${SITE_URL}/${data.lang}/orders/${data.orderRef}`;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: data.to,
      subject: isEs
        ? `Pedido confirmado — ${data.orderRef}`
        : `Order confirmed — ${data.orderRef}`,
      react: OrderConfirmationEmail({
        ...data,
        orderUrl,
      }),
    });
  } catch (err) {
    // Email should never break the payment flow
    console.error("Failed to send order confirmation email:", err);
  }
}

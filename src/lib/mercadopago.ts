import { MercadoPagoConfig, Preference, Payment } from "mercadopago";

export const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

export const preferenceClient = new Preference(mpClient);
export const paymentClient = new Payment(mpClient);

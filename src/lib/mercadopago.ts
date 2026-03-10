import { MercadoPagoConfig, Preference, Payment } from "mercadopago";

let _client: MercadoPagoConfig | null = null;

function getClient() {
  if (!_client) {
    _client = new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN!,
    });
  }
  return _client;
}

export const preferenceClient = new Proxy({} as Preference, {
  get(_, prop) {
    return (new Preference(getClient()) as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export const paymentClient = new Proxy({} as Payment, {
  get(_, prop) {
    return (new Payment(getClient()) as unknown as Record<string | symbol, unknown>)[prop];
  },
});

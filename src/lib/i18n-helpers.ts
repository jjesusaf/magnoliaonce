/**
 * Return the localized value of a bilingual DB row field.
 * Example: localized(product, "name", "en") → product.name_en
 */
export function localized<
  T extends Record<string, unknown>,
>(row: T, field: string, lang: string): string {
  const key = `${field}_${lang}` as keyof T;
  const fallback = `${field}_es` as keyof T;
  return (row[key] as string) ?? (row[fallback] as string) ?? "";
}

/**
 * Map language to display currency: es → MXN, en → USD.
 */
export function currencyForLang(lang: string): string {
  return lang === "es" ? "MXN" : "USD";
}

/**
 * Format a price for display. Returns e.g. "$40 USD" or "$700 MXN".
 */
export function formatPrice(amount: number, currency: string): string {
  const locale = currency === "MXN" ? "es-MX" : "en-US";
  const formatted = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
  return `${formatted} ${currency}`;
}

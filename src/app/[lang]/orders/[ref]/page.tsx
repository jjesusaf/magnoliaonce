"use client";

import { use, useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Package } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/i18n-helpers";
import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/i18n";

type OrderItem = {
  id: string;
  product_name: string;
  variant_label: string;
  quantity: number;
  unit_price: number;
  image_url: string | null;
};

type Order = {
  id: string;
  external_reference: string;
  status: string;
  subtotal: number;
  discount_amount: number;
  total: number;
  currency: string;
  created_at: string;
  order_items: OrderItem[];
};

type OrderEvent = {
  id: string;
  event_type: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

type OrdersDict = {
  orderDetail: string;
  timeline: string;
  itemsSection: string;
  subtotal: string;
  discount: string;
  total: string;
  backToOrders: string;
  orderNotFound: string;
  eventOrderCreated: string;
  eventPaymentPending: string;
  eventPaymentApproved: string;
  eventPaymentFailed: string;
  eventPaymentCancelled: string;
  eventPreparing: string;
  eventReady: string;
  eventPhotoAdded: string;
  eventDelivered: string;
  photoSection: string;
};

const EVENT_LABELS: Record<string, keyof OrdersDict> = {
  order_created: "eventOrderCreated",
  payment_pending: "eventPaymentPending",
  payment_approved: "eventPaymentApproved",
  payment_failed: "eventPaymentFailed",
  payment_cancelled: "eventPaymentCancelled",
  preparing: "eventPreparing",
  ready: "eventReady",
  photo_added: "eventPhotoAdded",
  delivered: "eventDelivered",
};

/* ─── Timeline ─── */
function Timeline({
  events,
  dict,
  lang,
}: {
  events: OrderEvent[];
  dict: OrdersDict;
  lang: string;
}) {
  const isEs = lang === "es";

  return (
    <div className="relative pl-6">
      {/* Vertical line */}
      <div className="absolute left-[7px] top-2 bottom-2 w-px bg-base-content/10" />

      {events.map((event, i) => {
        const isLast = i === events.length - 1;
        const label =
          dict[EVENT_LABELS[event.event_type] ?? "eventOrderCreated"];
        const dateStr = new Date(event.created_at).toLocaleDateString(
          isEs ? "es-MX" : "en-US",
          { day: "numeric", month: "short" }
        );
        const timeStr = new Date(event.created_at).toLocaleTimeString(
          isEs ? "es-MX" : "en-US",
          { hour: "2-digit", minute: "2-digit" }
        );

        return (
          <div key={event.id} className="relative flex items-start gap-4 pb-6 last:pb-0">
            {/* Dot */}
            <div
              className={`absolute -left-6 top-0.5 size-[15px] rounded-full border-2 ${
                isLast
                  ? "bg-primary border-primary"
                  : "bg-base-100 border-base-content/20"
              }`}
            />
            {/* Text */}
            <div className="flex-1 flex items-baseline justify-between gap-2">
              <span
                className={`text-xs sm:text-sm tracking-wide ${
                  isLast ? "text-base-content" : "text-base-content/50"
                }`}
              >
                {label}
              </span>
              <span className="text-[10px] sm:text-xs text-base-content/40 shrink-0">
                {dateStr} {timeStr}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Main content ─── */
function OrderDetailContent({ lang, orderRef }: { lang: string; orderRef: string }) {
  const { user, loading: authLoading } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [events, setEvents] = useState<OrderEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [dict, setDict] = useState<OrdersDict | null>(null);
  const isEs = lang === "es";

  useEffect(() => {
    getDictionary(lang as Locale).then((d) => setDict(d.orders));
  }, [lang]);

  const orderIdRef = useRef<string | null>(null);

  // Fetch events for a known order id
  const refreshEvents = useCallback(() => {
    const oid = orderIdRef.current;
    if (!oid) return;
    const supabase = createClient();
    supabase
      .from("order_events")
      .select("id, event_type, metadata, created_at")
      .eq("order_id", oid)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        if (data) setEvents(data as OrderEvent[]);
      });
  }, []);

  // Initial load: order + events
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }

    const supabase = createClient();

    supabase
      .from("orders")
      .select(
        "id, external_reference, status, subtotal, discount_amount, total, currency, created_at, order_items(id, product_name, variant_label, quantity, unit_price, image_url)"
      )
      .eq("external_reference", orderRef)
      .single()
      .then(({ data: orderData }) => {
        if (!orderData) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        setOrder(orderData as unknown as Order);
        orderIdRef.current = orderData.id;

        supabase
          .from("order_events")
          .select("id, event_type, metadata, created_at")
          .eq("order_id", orderData.id)
          .order("created_at", { ascending: true })
          .then(({ data: eventsData }) => {
            if (eventsData) setEvents(eventsData as OrderEvent[]);
            setLoading(false);
          });
      });
  }, [user, authLoading, orderRef]);

  // Poll for new events every 15s while order is not delivered
  useEffect(() => {
    const lastEvent = events[events.length - 1];
    if (!orderIdRef.current || lastEvent?.event_type === "delivered") return;

    const interval = setInterval(refreshEvents, 15_000);
    return () => clearInterval(interval);
  }, [events, refreshEvents]);

  if (!dict) return null;

  /* ─── Loading ─── */
  if (authLoading || loading) {
    return (
      <div className="min-h-dvh bg-base-100 flex flex-col">
        <header className="sticky top-0 z-40 bg-base-100/80 backdrop-blur-xl border-b border-base-content/10">
          <div className="max-w-2xl mx-auto flex items-center gap-4 px-4 sm:px-6 py-3">
            <div className="p-1.5">
              <ArrowLeft className="h-4 w-4 text-transparent" strokeWidth={1.5} />
            </div>
            <div className="logo-stack grid">
              <Image src="/images/logo.svg" alt="Magnolia Once" width={120} height={24} className="logo-dark h-5 w-auto" />
              <Image src="/images/logo-light.svg" alt="Magnolia Once" width={120} height={24} className="logo-light h-5 w-auto" />
            </div>
          </div>
        </header>
        <main className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-10">
          {/* Reference + date */}
          <div className="mb-8 space-y-2">
            <div className="skeleton h-4 sm:h-5 w-48" />
            <div className="skeleton h-3 w-32" />
          </div>

          {/* Timeline section */}
          <div className="mb-8">
            <div className="skeleton h-3 w-24 mb-4" />
            <div className="relative pl-6 space-y-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between gap-2">
                  <div className="skeleton h-3.5 w-32" />
                  <div className="skeleton h-3 w-20" />
                </div>
              ))}
            </div>
          </div>

          {/* Items section */}
          <div className="mb-8">
            <div className="skeleton h-3 w-20 mb-4" />
            <div className="border border-base-content/10 divide-y divide-base-content/5">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 py-3 px-4 sm:px-5">
                  <div className="skeleton size-10 sm:size-12 rounded-box shrink-0" />
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="skeleton h-3 w-3/4" />
                    <div className="skeleton h-3 w-1/3" />
                  </div>
                  <div className="skeleton h-3 w-14 shrink-0" />
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="border-t border-base-content/10 pt-4 space-y-2">
            <div className="flex justify-between">
              <div className="skeleton h-3 w-16" />
              <div className="skeleton h-3 w-20" />
            </div>
            <div className="flex justify-between pt-1">
              <div className="skeleton h-4 w-12" />
              <div className="skeleton h-4 w-20" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  /* ─── Not found ─── */
  if (notFound || !order) {
    return (
      <div className="min-h-dvh bg-base-100 flex flex-col items-center justify-center px-6 text-center">
        <p className="text-base-content/50 text-sm mb-6">
          {dict.orderNotFound}
        </p>
        <Link
          href={`/${lang}/orders`}
          className="btn btn-primary btn-sm gap-2 px-6"
        >
          <ArrowLeft className="h-4 w-4" />
          {dict.backToOrders}
        </Link>
      </div>
    );
  }

  const dateStr = new Date(order.created_at).toLocaleDateString(
    isEs ? "es-MX" : "en-US",
    { day: "numeric", month: "long", year: "numeric" }
  );

  return (
    <div className="min-h-dvh bg-base-100 flex flex-col">
      {/* Sticky header */}
      <header className="sticky top-0 z-40 bg-base-100/80 backdrop-blur-xl border-b border-base-content/10">
        <div className="max-w-2xl mx-auto flex items-center gap-4 px-4 sm:px-6 py-3">
          <Link
            href={`/${lang}/orders`}
            className="p-1.5 hover:opacity-60 transition-opacity"
            aria-label={dict.backToOrders}
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
          </Link>
          <span className="text-xs tracking-widest uppercase text-base-content/50">
            {dict.backToOrders}
          </span>
          <div className="ml-auto logo-stack grid">
            <Image src="/images/logo.svg" alt="Magnolia Once" width={120} height={24} className="logo-dark h-5 w-auto" />
            <Image src="/images/logo-light.svg" alt="Magnolia Once" width={120} height={24} className="logo-light h-5 w-auto" />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {/* Reference + date */}
        <div className="mb-8">
          <h1 className="text-sm sm:text-base tracking-widest uppercase font-mono">
            {order.external_reference}
          </h1>
          <p className="text-xs text-base-content/40 mt-1">{dateStr}</p>
        </div>

        {/* Timeline */}
        {events.length > 0 && (
          <section className="mb-8">
            <h2 className="text-[10px] sm:text-xs tracking-widest uppercase text-base-content/40 mb-4">
              {dict.timeline}
            </h2>
            <Timeline events={events} dict={dict} lang={lang} />
          </section>
        )}

        {/* Photo gallery — "Así quedó tu pedido" */}
        {(() => {
          const photoUrls: string[] = [];
          for (const e of events) {
            if (e.event_type === "photo_added" && e.metadata) {
              const imgs = e.metadata.image_urls;
              if (Array.isArray(imgs)) photoUrls.push(...(imgs as string[]));
            }
          }
          if (photoUrls.length === 0) return null;
          return (
            <section className="mb-8">
              <h2 className="text-[10px] sm:text-xs tracking-widest uppercase text-base-content/40 mb-4">
                {dict.photoSection}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {photoUrls.map((url, i) => (
                  <div
                    key={i}
                    className="relative aspect-square rounded-box overflow-hidden border border-base-content/10"
                  >
                    <Image
                      src={url}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, 33vw"
                    />
                  </div>
                ))}
              </div>
            </section>
          );
        })()}

        {/* Items */}
        <section className="mb-8">
          <h2 className="text-[10px] sm:text-xs tracking-widest uppercase text-base-content/40 mb-4">
            {dict.itemsSection}
          </h2>
          <ul className="list border border-base-content/10 divide-y divide-base-content/5">
            {order.order_items.map((item) => (
              <li key={item.id} className="list-row py-3 px-4 sm:px-5">
                <div>
                  {item.image_url ? (
                    <div className="avatar">
                      <div className="size-10 sm:size-12 rounded-box">
                        <Image
                          src={item.image_url}
                          alt={item.product_name}
                          width={48}
                          height={48}
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="avatar avatar-placeholder">
                      <div className="bg-base-200 text-base-content/20 size-10 sm:size-12 rounded-box">
                        <Package className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={1} />
                      </div>
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-xs tracking-wide uppercase truncate">
                    {item.product_name}
                  </div>
                  <div className="text-xs uppercase font-semibold opacity-60">
                    {item.variant_label} &times; {item.quantity}
                  </div>
                </div>
                <span className="text-xs text-base-content/60 shrink-0">
                  {formatPrice(item.unit_price * item.quantity, order.currency)}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Summary */}
        <section className="border-t border-base-content/10 pt-4 space-y-2">
          <div className="flex justify-between text-xs text-base-content/50">
            <span>{dict.subtotal}</span>
            <span>{formatPrice(order.subtotal, order.currency)}</span>
          </div>
          {order.discount_amount > 0 && (
            <div className="flex justify-between text-xs text-success">
              <span>{dict.discount}</span>
              <span>-{formatPrice(order.discount_amount, order.currency)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm pt-1">
            <span className="tracking-widest uppercase">{dict.total}</span>
            <span>{formatPrice(order.total, order.currency)}</span>
          </div>
        </section>
      </main>
    </div>
  );
}

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ lang: string; ref: string }>;
}) {
  const { lang, ref } = use(params);
  return <OrderDetailContent lang={lang} orderRef={ref} />;
}

"use client";

import { use, useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Package, Camera } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/i18n-helpers";
import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/i18n";

/* ─── Types ──────────────────────────────────────────────── */

type OrderEvent = {
  id: string;
  event_type: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

type OrderRow = {
  id: string;
  external_reference: string;
  total: number;
  currency: string;
  created_at: string;
  email: string | null;
  order_items: { id: string }[];
  order_events: OrderEvent[];
};

type Stage = "new" | "preparing" | "ready" | "delivered";

type Dict = {
  title: string;
  stageNew: string;
  stagePreparing: string;
  stageReady: string;
  stageDelivered: string;
  actionPrepare: string;
  actionReady: string;
  actionDeliver: string;
  items: string;
  empty: string;
  errorUpdate: string;
  backToAdmin: string;
  addPhotos: string;
  uploading: string;
  photosAdded: string;
};

/* ─── Helpers ────────────────────────────────────────────── */

function getStage(events: OrderEvent[]): Stage {
  const types = new Set(events.map((e) => e.event_type));
  if (types.has("delivered")) return "delivered";
  if (types.has("ready")) return "ready";
  if (types.has("preparing")) return "preparing";
  return "new";
}

function hasPhotos(events: OrderEvent[]): boolean {
  return events.some((e) => e.event_type === "photo_added");
}

function getPhotoUrls(events: OrderEvent[]): string[] {
  const urls: string[] = [];
  for (const e of events) {
    if (e.event_type === "photo_added" && e.metadata) {
      const imgs = e.metadata.image_urls;
      if (Array.isArray(imgs)) urls.push(...(imgs as string[]));
    }
  }
  return urls;
}

const STAGE_ORDER: Stage[] = ["new", "preparing", "ready", "delivered"];

const NEXT_EVENT: Record<Stage, string | null> = {
  new: "preparing",
  preparing: "ready",
  ready: "delivered",
  delivered: null,
};

function stageLabel(stage: Stage, t: Dict) {
  const map: Record<Stage, string> = {
    new: t.stageNew,
    preparing: t.stagePreparing,
    ready: t.stageReady,
    delivered: t.stageDelivered,
  };
  return map[stage];
}

function actionLabel(stage: Stage, t: Dict): string | null {
  const map: Record<Stage, string | null> = {
    new: t.actionPrepare,
    preparing: t.actionReady,
    ready: t.actionDeliver,
    delivered: null,
  };
  return map[stage];
}

function formatDate(iso: string, lang: string) {
  return new Date(iso).toLocaleDateString(lang === "es" ? "es-MX" : "en-US", {
    day: "numeric",
    month: "short",
  });
}

/* ─── Order Card ─────────────────────────────────────────── */

function OrderCard({
  order,
  stage,
  t,
  lang,
  onAdvance,
  onPhotosUploaded,
}: {
  order: OrderRow;
  stage: Stage;
  t: Dict;
  lang: string;
  onAdvance: (orderId: string, eventType: string) => void;
  onPhotosUploaded: (orderId: string, urls: string[]) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const nextEvent = NEXT_EVENT[stage];
  const action = actionLabel(stage, t);
  const photos = getPhotoUrls(order.order_events);
  const showPhotoBtn = stage === "preparing" || stage === "ready";

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("orderId", order.id);
      for (const file of Array.from(files)) {
        formData.append("photos", file);
      }
      const res = await fetch("/api/admin/orders/photos", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      onPhotosUploaded(order.id, data.imageUrls);
    } catch {
      // silently fail — user can retry
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className="border border-base-content/10 p-4 space-y-3">
      <div className="flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-mono font-semibold truncate">
            {order.external_reference}
          </p>
          <p className="text-xs text-base-content/50 mt-0.5">
            {formatDate(order.created_at, lang)}
            {" · "}
            {order.order_items.length} {t.items}
            {" · "}
            {formatPrice(order.total, order.currency)}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {showPhotoBtn && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handlePhotoUpload}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="btn btn-ghost btn-sm btn-circle"
                title={t.addPhotos}
              >
                {uploading ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
              </button>
            </>
          )}
          {nextEvent && action && (
            <button
              onClick={() => onAdvance(order.id, nextEvent)}
              className="btn btn-outline btn-sm text-xs tracking-wider uppercase"
            >
              {action}
            </button>
          )}
        </div>
      </div>

      {/* Photo thumbnails */}
      {photos.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pt-1">
          {photos.map((url, i) => (
            <div
              key={i}
              className="relative size-16 shrink-0 rounded-box overflow-hidden border border-base-content/10"
            >
              <Image
                src={url}
                alt=""
                fill
                className="object-cover"
                sizes="64px"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Main Content ───────────────────────────────────────── */

function AdminOrdersContent({ lang }: { lang: string }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [t, setT] = useState<Dict | null>(null);

  // Load dictionary
  useEffect(() => {
    getDictionary(lang as Locale).then((d) =>
      setT((d as Record<string, unknown>).adminOrders as Dict)
    );
  }, [lang]);

  // Check admin
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace(`/${lang}/login`);
      return;
    }
    const supabase = createClient();
    supabase
      .from("profiles")
      .select("is_admin")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (!data?.is_admin) {
          router.replace(`/${lang}/shop`);
          return;
        }
        setIsAdmin(true);
      });
  }, [user, authLoading, router, lang]);

  // Load orders
  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/orders");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setOrders(data);
    } catch {
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) loadOrders();
  }, [isAdmin, loadOrders]);

  // Advance stage (optimistic)
  async function advanceOrder(orderId: string, eventType: string) {
    setError(null);

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              order_events: [
                ...o.order_events,
                {
                  id: `temp-${Date.now()}`,
                  event_type: eventType,
                  metadata: null,
                  created_at: new Date().toISOString(),
                },
              ],
            }
          : o
      )
    );

    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, eventType }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? {
                ...o,
                order_events: o.order_events.filter(
                  (e) => !e.id.startsWith("temp-")
                ),
              }
            : o
        )
      );
      setError(t?.errorUpdate ?? "Update failed");
    }
  }

  // Handle photos uploaded (add event locally)
  function handlePhotosUploaded(orderId: string, urls: string[]) {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              order_events: [
                ...o.order_events,
                {
                  id: `photo-${Date.now()}`,
                  event_type: "photo_added",
                  metadata: { image_urls: urls },
                  created_at: new Date().toISOString(),
                },
              ],
            }
          : o
      )
    );
  }

  // Group orders by stage
  const grouped: Record<Stage, OrderRow[]> = {
    new: [],
    preparing: [],
    ready: [],
    delivered: [],
  };
  for (const o of orders) {
    grouped[getStage(o.order_events)].push(o);
  }

  // Guards
  if (authLoading || isAdmin === null || !t) {
    return (
      <div className="min-h-dvh bg-base-100">
        <header className="sticky top-0 z-40 bg-base-100/80 backdrop-blur-xl border-b border-base-200">
          <div className="max-w-2xl mx-auto flex items-center gap-4 px-5 py-3">
            <div className="skeleton h-8 w-28" />
            <div className="flex-1" />
            <div className="skeleton h-4 w-20" />
          </div>
        </header>
        <div className="max-w-2xl mx-auto px-5 py-6 space-y-8">
          {Array.from({ length: 2 }).map((_, s) => (
            <section key={s}>
              <div className="skeleton h-3 w-24 mb-3" />
              <div className="space-y-3">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="border border-base-content/10 p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1.5">
                        <div className="skeleton h-3.5 w-40" />
                        <div className="skeleton h-3 w-52" />
                      </div>
                      <div className="skeleton h-8 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    );
  }
  if (!isAdmin) return null;

  return (
    <div className="min-h-dvh bg-base-100">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-base-100/80 backdrop-blur-xl border-b border-base-200">
        <div className="max-w-2xl mx-auto flex items-center gap-4 px-5 py-3">
          <Link
            href={`/${lang}/admin`}
            className="btn btn-ghost btn-sm gap-2 text-xs tracking-widest uppercase"
          >
            <ArrowLeft className="h-4 w-4" />
            {t.backToAdmin}
          </Link>
          <div className="flex-1" />
          <h1 className="text-sm tracking-widest uppercase font-semibold">
            {t.title}
          </h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-5 py-6 space-y-8">
        {error && (
          <div className="border border-error/30 bg-error/5 text-error text-sm px-4 py-2">
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-8">
            {Array.from({ length: 3 }).map((_, s) => (
              <section key={s}>
                <div className="skeleton h-3 w-28 mb-3" />
                <div className="space-y-3">
                  {Array.from({ length: s === 0 ? 3 : 1 }).map((_, i) => (
                    <div key={i} className="border border-base-content/10 p-4 space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1.5">
                          <div className="skeleton h-3.5 w-40" />
                          <div className="skeleton h-3 w-52" />
                        </div>
                        <div className="skeleton h-8 w-20" />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Package className="h-12 w-12 text-base-content/10 mb-4" />
            <p className="text-base-content/40 text-sm">{t.empty}</p>
          </div>
        ) : (
          STAGE_ORDER.map((stage) => {
            const stageOrders = grouped[stage];
            if (stageOrders.length === 0) return null;

            return (
              <section key={stage}>
                <h2 className="text-xs tracking-widest uppercase font-semibold text-base-content/50 mb-3">
                  {stageLabel(stage, t)} ({stageOrders.length})
                </h2>
                <div className="space-y-3">
                  {stageOrders.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      stage={stage}
                      t={t}
                      lang={lang}
                      onAdvance={advanceOrder}
                      onPhotosUploaded={handlePhotosUploaded}
                    />
                  ))}
                </div>
              </section>
            );
          })
        )}
      </div>
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────── */

export default function AdminOrdersPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  return <AdminOrdersContent lang={lang} />;
}

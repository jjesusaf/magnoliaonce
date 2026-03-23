"use client";

import { useMemo } from "react";
import { CalendarDays } from "lucide-react";

type DeliveryDict = {
  deliveryTitle: string;
  deliveryDate: string;
  deliverySlot: string;
  slotMorning: string;
  slotAfternoon: string;
  slotEvening: string;
};

type Props = {
  date: string;
  slot: string;
  onDateChange: (date: string) => void;
  onSlotChange: (slot: string) => void;
  dict: DeliveryDict;
  lang: string;
};

const SLOTS = ["morning", "afternoon", "evening"] as const;

export function DeliveryPicker({
  date,
  slot,
  onDateChange,
  onSlotChange,
  dict,
  lang,
}: Props) {
  // Generate available dates: tomorrow through 14 days out, skip Sundays
  const availableDates = useMemo(() => {
    const dates: { value: string; label: string }[] = [];
    const today = new Date();

    for (let i = 1; i <= 21 && dates.length < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);

      // Skip Sundays (0 = Sunday)
      if (d.getDay() === 0) continue;

      const value = d.toISOString().split("T")[0];
      const label = d.toLocaleDateString(lang === "es" ? "es-MX" : "en-US", {
        weekday: "short",
        day: "numeric",
        month: "short",
      });

      dates.push({ value, label });
    }

    return dates;
  }, [lang]);

  const slotLabels: Record<string, string> = {
    morning: dict.slotMorning,
    afternoon: dict.slotAfternoon,
    evening: dict.slotEvening,
  };

  return (
    <div>
      <h2 className="text-sm tracking-widest uppercase text-base-content/50 mb-4 flex items-center gap-2">
        <CalendarDays className="h-4 w-4" strokeWidth={1.5} />
        {dict.deliveryTitle}
      </h2>

      <div className="flex flex-col gap-4">
        {/* Date selector */}
        <div>
          <p className="text-xs text-base-content/40 mb-2">{dict.deliveryDate}</p>
          <div className="flex flex-wrap gap-2">
            {availableDates.map((d) => (
              <button
                key={d.value}
                type="button"
                onClick={() => onDateChange(d.value)}
                className={`px-3 py-2 text-xs tracking-wide uppercase border transition-colors ${
                  date === d.value
                    ? "border-base-content bg-base-content text-base-100"
                    : "border-base-content/15 hover:border-base-content/40 text-base-content/70"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Slot selector */}
        <div>
          <p className="text-xs text-base-content/40 mb-2">{dict.deliverySlot}</p>
          <div className="flex flex-wrap gap-2">
            {SLOTS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onSlotChange(s)}
                className={`px-4 py-2.5 text-xs tracking-wide uppercase border transition-colors flex-1 min-w-[120px] ${
                  slot === s
                    ? "border-base-content bg-base-content text-base-100"
                    : "border-base-content/15 hover:border-base-content/40 text-base-content/70"
                }`}
              >
                {slotLabels[s]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";

export function PromoMarquee() {
  const pathname = usePathname();
  const isEs = pathname.startsWith("/es");
  const lang = isEs ? "es" : "en";

  const text = isEs
    ? "Regístrate y obtén 30% de descuento en tu primera compra"
    : "Sign up and get 30% off your first purchase";

  const separator = " ✦ ";

  // Repeat text enough times to fill the marquee seamlessly
  const repeatedText = Array(8)
    .fill(`${text}${separator}`)
    .join("");

  return (
    <Link
      href={`/${lang}/login`}
      className="block bg-primary text-primary-content overflow-hidden whitespace-nowrap relative group"
    >
      <div className="flex items-center h-8 animate-marquee">
        <div className="flex items-center gap-1.5 shrink-0 pr-4">
          <Sparkles className="h-3 w-3" />
        </div>
        <span className="text-[11px] tracking-wider uppercase font-medium shrink-0">
          {repeatedText}
        </span>
      </div>
    </Link>
  );
}

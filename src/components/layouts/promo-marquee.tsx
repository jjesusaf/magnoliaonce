"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function PromoMarquee() {
  const pathname = usePathname();
  const isEs = pathname.startsWith("/es");
  const lang = isEs ? "es" : "en";

  const text = isEs
    ? "REGÍSTRATE Y OBTÉN 30% DE DESCUENTO EN TU PRIMERA COMPRA"
    : "SIGN UP AND GET 30% OFF YOUR FIRST PURCHASE";

  const separator = " ✦ ";
  const chunk = `${text}${separator}`;

  return (
    <Link
      href={`/${lang}/login`}
      className="block bg-neutral text-neutral-content overflow-hidden whitespace-nowrap h-9"
    >
      <div className="flex items-center h-full animate-marquee">
        {/* Two identical halves for seamless loop */}
        <span className="text-[11px] tracking-[0.15em] font-semibold shrink-0">
          {chunk.repeat(10)}
        </span>
        <span className="text-[11px] tracking-[0.15em] font-semibold shrink-0">
          {chunk.repeat(10)}
        </span>
      </div>
    </Link>
  );
}

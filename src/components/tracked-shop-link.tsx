"use client";

import Link from "next/link";
import { trackEnterShop } from "@/lib/tracking";

type Props = {
  href: string;
  className?: string;
  children: React.ReactNode;
};

export function TrackedShopLink({ href, className, children }: Props) {
  return (
    <Link href={href} className={className} onClick={() => trackEnterShop()}>
      {children}
    </Link>
  );
}

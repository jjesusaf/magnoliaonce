"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { User, ShoppingBag, Menu } from "lucide-react";
import { useRef } from "react";
import type { Locale } from "@/lib/i18n";
import { ThemeToggle } from "@/components/theme-toggle";
import { useCart } from "@/lib/cart-context";
import { CartDrawer } from "@/components/shop/cart-drawer";

const DRAWER_ID = "shop-drawer";

const LANG_LABELS: Record<Locale, string> = {
  es: "Español",
  en: "English",
};

type NavDict = {
  studio: string;
  shop: string;
  florals: string;
  workshops: string;
  goods: string;
};

type CartDict = {
  title: string;
  empty: string;
  remove: string;
  total: string;
  checkout: string;
  continueShopping: string;
};

type Props = {
  lang: string;
  nav: NavDict;
  cartDict: CartDict;
  children: React.ReactNode;
};

export function ShopNavbar({ lang, nav, cartDict, children }: Props) {
  const pathname = usePathname();
  const otherLang = lang === "es" ? "en" : "es";
  const switchedPath = pathname.replace(`/${lang}`, `/${otherLang}`);
  const drawerRef = useRef<HTMLInputElement>(null);
  const { totalItems, toggleCart } = useCart();

  const links = [
    { label: nav.studio, href: `/${lang}/studio`, enabled: false },
    { label: nav.shop, href: `/${lang}/shop`, enabled: true },
    { label: nav.florals, href: `/${lang}/florals`, enabled: false },
    { label: nav.workshops, href: `/${lang}/workshops`, enabled: false },
    { label: nav.goods, href: `/${lang}/goods`, enabled: false },
  ];

  function closeDrawer() {
    if (drawerRef.current) drawerRef.current.checked = false;
  }

  return (
    <div className="drawer drawer-end">
      <input
        id={DRAWER_ID}
        type="checkbox"
        className="drawer-toggle"
        ref={drawerRef}
      />

      {/* Main content: navbar + page */}
      <div className="drawer-content flex flex-col">
        {/* Navbar */}
        <div className="navbar fixed top-0 left-0 right-0 z-40 bg-base-100/80 backdrop-blur-xl border-b border-base-200 px-6 py-3 lg:px-10 lg:py-4 justify-evenly">
          {/* Logo */}
          <div className="navbar-start items-center">
            <Link href={`/${lang}/shop`} className="shrink-0 flex items-center">
              {/* Mobile: mini logo */}
              <div className="logo-stack grid lg:hidden">
                <Image
                  src="/images/logo-mini-dark.svg"
                  alt="Magnolia Once"
                  width={40}
                  height={28}
                  className="logo-dark h-7 w-auto"
                  priority
                />
                <Image
                  src="/images/logo-mini-light.svg"
                  alt="Magnolia Once"
                  width={40}
                  height={28}
                  className="logo-light h-7 w-auto"
                  priority
                />
              </div>
              {/* Desktop: full logo */}
              <div className="logo-stack hidden lg:grid">
                <Image
                  src="/images/logo.svg"
                  alt="Magnolia Once"
                  width={80}
                  height={28}
                  className="logo-dark h-7 w-auto"
                  priority
                />
                <Image
                  src="/images/logo-light.svg"
                  alt="Magnolia Once"
                  width={80}
                  height={28}
                  className="logo-light h-7 w-auto"
                  priority
                />
              </div>
            </Link>
          </div>

          {/* Desktop links */}
          <div className="navbar-center hidden lg:flex">
            <ul className="menu menu-horizontal gap-1 px-1">
              {links.map((link) => {
                const isActive = link.enabled && pathname === link.href;
                return (
                  <li key={link.href}>
                    {link.enabled ? (
                      <Link
                        href={link.href}
                        className={`text-sm tracking-widest uppercase bg-transparent hover:bg-transparent focus:bg-transparent ${
                          isActive
                            ? "font-bold text-base-content"
                            : "font-normal text-base-content/60 hover:text-base-content"
                        }`}
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <span className="text-sm tracking-widest uppercase text-base-content/30 cursor-default">
                        {link.label}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Icons + controls */}
          <div className="navbar-end gap-1">
            {/* Language — dropdown desktop */}
            <div className="dropdown dropdown-end hidden md:block">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost btn-sm gap-1"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5a17.92 17.92 0 01-8.716-2.247m0 0A8.966 8.966 0 013 12c0-1.97.633-3.793 1.708-5.272"
                  />
                </svg>
                <span className="uppercase text-xs font-bold">{lang}</span>
              </div>
              <ul
                tabIndex={0}
                className="dropdown-content menu bg-base-100 text-base-content rounded-box z-50 w-40 p-2 shadow-lg"
              >
                <li>
                  <Link href={pathname} className="font-semibold text-primary">
                    {LANG_LABELS[lang as Locale]}
                  </Link>
                </li>
                <li>
                  <Link href={switchedPath}>
                    {LANG_LABELS[otherLang as Locale]}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Theme toggle */}
            <ThemeToggle />

            {/* Account */}
            <button className="btn btn-ghost btn-circle" aria-label="Account">
              <User className="h-5 w-5 stroke-[1.5]" />
            </button>

            {/* Cart */}
            <button
              className="btn btn-ghost btn-circle relative"
              aria-label="Cart"
              onClick={toggleCart}
            >
              <ShoppingBag className="h-5 w-5 stroke-[1.5]" />
              {totalItems > 0 && (
                <span className="badge badge-primary badge-xs absolute -top-0.5 -right-0.5 text-[10px] min-w-[18px] h-[18px] p-0 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Hamburger — mobile */}
            <label
              htmlFor={DRAWER_ID}
              className="btn btn-ghost btn-circle lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </label>
          </div>
        </div>

        {/* Page content */}
        {children}
      </div>

      {/* Drawer sidebar — mobile only */}
      <div className="drawer-side z-50">
        <label
          htmlFor={DRAWER_ID}
          aria-label="close sidebar"
          className="drawer-overlay"
        />
        <div className="menu bg-base-100 min-h-full w-72 p-0 flex flex-col">
          {/* Sidebar header */}
          <div className="flex items-center p-4 border-b border-base-200">
            <Link href={`/${lang}`} onClick={closeDrawer} className="shrink-0 flex items-center">
              <div className="logo-stack grid">
                <Image
                  src="/images/logo.svg"
                  alt="Magnolia Once"
                  width={80}
                  height={28}
                  className="logo-dark h-7 w-auto"
                />
                <Image
                  src="/images/logo-light.svg"
                  alt="Magnolia Once"
                  width={80}
                  height={28}
                  className="logo-light h-7 w-auto"
                />
              </div>
            </Link>
          </div>

          {/* Nav links */}
          <ul className="flex-1 p-4 gap-1">
            {links.map((link) => {
              const isActive = link.enabled && pathname === link.href;
              return (
                <li key={link.href}>
                  {link.enabled ? (
                    <Link
                      href={link.href}
                      className={`text-base tracking-widest uppercase py-3 ${
                        isActive
                          ? "font-bold text-base-content"
                          : "font-normal text-base-content/60 hover:text-base-content"
                      }`}
                      onClick={closeDrawer}
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <span className="text-base tracking-widest uppercase py-3 text-base-content/30 cursor-default">
                      {link.label}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>

          {/* Sidebar footer */}
          <div className="p-4 border-t border-base-200 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button className="btn btn-ghost btn-circle" aria-label="Account">
                <User className="h-5 w-5 stroke-[1.5]" />
              </button>
              <button
                className="btn btn-ghost btn-circle relative"
                aria-label="Cart"
                onClick={() => { closeDrawer(); toggleCart(); }}
              >
                <ShoppingBag className="h-5 w-5 stroke-[1.5]" />
                {totalItems > 0 && (
                  <span className="badge badge-primary badge-xs absolute -top-0.5 -right-0.5 text-[10px] min-w-[18px] h-[18px] p-0 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
            <div className="flex items-center gap-1">
              <Link
                href={switchedPath}
                onClick={closeDrawer}
                className="btn btn-ghost btn-sm uppercase font-bold text-xs"
              >
                {otherLang}
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      {/* Cart drawer */}
      <CartDrawer lang={lang} dict={cartDict} />
    </div>
  );
}

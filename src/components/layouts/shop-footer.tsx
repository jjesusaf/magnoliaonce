import Link from "next/link";
import { Mail, CircleHelp, Shield, FileText, Instagram } from "lucide-react";

type FooterDict = {
  contact: string;
  faq: string;
  privacy: string;
  terms: string;
  copyright: string;
};

type Props = {
  lang: string;
  dict: FooterDict;
};

export function ShopFooter({ lang, dict }: Props) {
  const footerLinks = [
    { label: dict.contact, href: `/${lang}/contact`, icon: Mail, enabled: false },
    { label: dict.faq, href: `/${lang}/faq`, icon: CircleHelp, enabled: false },
    { label: dict.privacy, href: `/${lang}/privacy`, icon: Shield, enabled: false },
    { label: dict.terms, href: `/${lang}/terms`, icon: FileText, enabled: false },
  ];

  return (
    <footer className="border-t border-base-200 fixed bottom-0 left-0 right-0 bg-base-100/80 backdrop-blur-xl z-30 lg:static lg:bg-base-100 lg:backdrop-blur-none lg:shrink-0">
      {/* Desktop: text links */}
      <div className="hidden lg:flex flex-wrap justify-center gap-6 px-6 py-4">
        {footerLinks.map((link) =>
          link.enabled ? (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm tracking-widest uppercase text-base-content/60 hover:text-base-content transition-colors"
            >
              {link.label}
            </Link>
          ) : (
            <span
              key={link.href}
              className="text-sm tracking-widest uppercase text-base-content/30 cursor-default"
            >
              {link.label}
            </span>
          )
        )}
      </div>

      {/* Bottom bar — single row on mobile */}
      <div className="flex items-center justify-between px-4 py-3 lg:px-16 lg:py-4 lg:border-t lg:border-base-200">
        <span className="text-xs text-base-content/40">
          {dict.copyright}
        </span>

        <div className="flex items-center gap-2">
          {/* Mobile: icon links */}
          {footerLinks.map((link) => {
            const Icon = link.icon;
            return link.enabled ? (
              <Link
                key={link.href}
                href={link.href}
                className="btn btn-ghost btn-xs btn-circle lg:hidden text-base-content/40 hover:text-base-content"
                aria-label={link.label}
              >
                <Icon className="h-4 w-4" />
              </Link>
            ) : (
              <span
                key={link.href}
                className="btn btn-ghost btn-xs btn-circle lg:hidden text-base-content/20 cursor-default"
                aria-label={link.label}
              >
                <Icon className="h-4 w-4" />
              </span>
            );
          })}

          {/* Instagram */}
          <a
            href="https://www.instagram.com/magnoliaonce"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost btn-xs btn-circle text-base-content/40 hover:text-base-content"
            aria-label="Instagram"
          >
            <Instagram className="h-4 w-4 lg:h-5 lg:w-5" />
          </a>
        </div>
      </div>
    </footer>
  );
}

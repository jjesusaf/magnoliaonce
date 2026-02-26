import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Shield, FileText, CircleHelp, Mail } from "lucide-react";

type InfoPage = "privacy" | "terms" | "faq" | "contact";

type Props = {
  lang: string;
  current: InfoPage;
  children: React.ReactNode;
};

const navItems = (lang: string, isEs: boolean) => [
  { id: "privacy" as const, label: isEs ? "Privacidad" : "Privacy", href: `/${lang}/privacy`, icon: Shield },
  { id: "terms" as const, label: isEs ? "Términos" : "Terms", href: `/${lang}/terms`, icon: FileText },
  { id: "faq" as const, label: "FAQ", href: `/${lang}/faq`, icon: CircleHelp },
  { id: "contact" as const, label: isEs ? "Contacto" : "Contact", href: `/${lang}/contact`, icon: Mail },
];

export function InfoPageShell({ lang, current, children }: Props) {
  const isEs = lang === "es";
  const links = navItems(lang, isEs);

  return (
    <div className="min-h-dvh bg-base-100 flex flex-col">
      {/* Sticky header */}
      <header className="sticky top-0 z-40 bg-base-100/80 backdrop-blur-xl border-b border-base-200">
        <div className="max-w-3xl mx-auto flex items-center gap-4 px-6 py-3">
          <Link
            href={`/${lang}/shop`}
            className="btn btn-ghost btn-sm btn-circle"
            aria-label={isEs ? "Volver a la tienda" : "Back to shop"}
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="logo-stack grid">
            <Image
              src="/images/logo.svg"
              alt="Magnolia Once"
              width={120}
              height={24}
              className="logo-dark h-5 w-auto"
            />
            <Image
              src="/images/logo-light.svg"
              alt="Magnolia Once"
              width={120}
              height={24}
              className="logo-light h-5 w-auto"
            />
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-10 md:py-14">
        {children}
      </main>

      {/* Footer cross-navigation */}
      <footer className="border-t border-base-200 mt-auto">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <nav className="flex flex-wrap justify-center gap-x-8 gap-y-3">
            {links.map((link) => {
              const Icon = link.icon;
              const isCurrent = link.id === current;
              return (
                <Link
                  key={link.id}
                  href={link.href}
                  aria-current={isCurrent ? "page" : undefined}
                  className={`flex items-center gap-1.5 text-xs tracking-wider uppercase transition-colors ${
                    isCurrent
                      ? "text-primary font-semibold"
                      : "text-base-content/40 hover:text-base-content/70"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <p className="text-center text-xs text-base-content/30 mt-5">
            © 2026 Magnolia Once
          </p>
        </div>
      </footer>
    </div>
  );
}

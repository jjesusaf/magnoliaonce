import Link from "next/link";
import Image from "next/image";
import type { Locale } from "@/lib/i18n";
import { getImageUrl } from "@/lib/storage";
import { TopControls } from "@/components/top-controls";

type Dictionary = {
  hero: {
    description1: string;
    description2: string;
    imageAlt: string;
  };
  nav: {
    studio: string;
    shop: string;
    florals: string;
    workshops: string;
    goods: string;
    about: string;
    clients: string;
    services: string;
    contact: string;
  };
};

type Props = {
  dict: Dictionary;
  lang: Locale;
};

const BUCKET = "magnolia";
const HERO_IMAGE = "hero/IMG_9196.jpeg";

export function MidiHero({ dict, lang }: Props) {
  const heroImageUrl = getImageUrl(BUCKET, HERO_IMAGE);

  const navLinks = [
    { label: dict.nav.shop, href: `/${lang}/shop`, enabled: true },
    { label: dict.nav.about, href: `/${lang}/about`, enabled: false },
    { label: dict.nav.clients, href: `/${lang}/clients`, enabled: false },
    { label: dict.nav.services, href: `/${lang}/services`, enabled: false },
    { label: dict.nav.contact, href: `/${lang}/contact`, enabled: false },
  ];

  return (
    <div className="h-dvh bg-primary relative overflow-hidden flex flex-col">
      {/* Top bar: Controls */}
      <div className="flex justify-end px-5 pt-5 md:px-10 md:pt-8 z-10">
        <TopControls lang={lang} colorClass="text-primary-content" />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col justify-between px-5 pb-5 md:px-10 md:pb-10 relative">
        {/* Description text — more room on mobile */}
        <div className="max-w-[85%] md:max-w-lg lg:max-w-xl xl:max-w-2xl mt-2 md:mt-4">
          <p className="text-primary-content text-base md:text-lg lg:text-xl font-bold uppercase leading-snug tracking-tight">
            {dict.hero.description1}
          </p>
          <p className="text-primary-content text-base md:text-lg lg:text-xl font-bold uppercase leading-snug tracking-tight mt-3 md:mt-4">
            {dict.hero.description2}
          </p>
        </div>

        {/* Flower image — positioned right, vertically centered on mobile */}
        {heroImageUrl && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 w-36 md:right-[5%] md:top-auto md:bottom-[10%] md:translate-y-0 md:w-52 lg:w-64 xl:w-72">
            <Image
              src={heroImageUrl}
              alt={dict.hero.imageAlt}
              width={400}
              height={500}
              className="object-cover w-full h-auto"
              priority
            />
          </div>
        )}

        {/* Navigation — bottom left */}
        <nav>
          <ul className="menu p-0 gap-0">
            {navLinks.map((link) => (
              <li key={link.href}>
                {link.enabled ? (
                  <Link
                    href={link.href}
                    className="link link-hover text-primary-content/60 hover:text-primary-content text-xl md:text-3xl lg:text-4xl uppercase tracking-tight px-0 py-0.5 leading-tight bg-transparent"
                  >
                    {link.label}
                  </Link>
                ) : (
                  <span className="text-primary-content/30 text-xl md:text-3xl lg:text-4xl uppercase tracking-tight px-0 py-0.5 leading-tight cursor-default">
                    {link.label}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Upload button */}
      <Link
        href={`/${lang}/upload`}
        className="btn btn-sm btn-ghost text-primary-content/30 hover:text-primary-content absolute bottom-4 right-4"
      >
        Upload
      </Link>
    </div>
  );
}

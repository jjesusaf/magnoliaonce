import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { ThemeToggle } from "@/components/theme-toggle";

const LANG_LABELS: Record<Locale, string> = {
  es: "Español",
  en: "English",
};

type Props = {
  lang: Locale;
  colorClass?: string;
};

export function TopControls({ lang, colorClass = "text-base-content" }: Props) {
  const otherLang = lang === "es" ? "en" : "es";

  return (
    <div className="flex items-center gap-1">
      {/* Lang switcher - Dropdown on desktop */}
      <div className="dropdown dropdown-end hidden md:block">
        <div
          tabIndex={0}
          role="button"
          className={`btn btn-sm btn-ghost ${colorClass} gap-1`}
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
            <Link href={`/${lang}`} className="font-semibold text-primary">
              {LANG_LABELS[lang]}
            </Link>
          </li>
          <li>
            <Link href={`/${otherLang}`}>{LANG_LABELS[otherLang]}</Link>
          </li>
        </ul>
      </div>

      {/* Lang switcher - Button on mobile */}
      <Link
        href={`/${otherLang}`}
        className={`btn btn-sm btn-ghost ${colorClass} uppercase font-bold text-xs md:hidden`}
      >
        {otherLang}
      </Link>

      {/* Theme toggle */}
      <ThemeToggle colorClass={colorClass} />
    </div>
  );
}

import type { Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";
import { MidiHero } from "@/components/layouts/midi-hero";
import { HomeWithSplash } from "@/components/home-with-splash";

export default async function Home({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  return (
    <HomeWithSplash>
      <MidiHero dict={dict} lang={lang as Locale} />
    </HomeWithSplash>
  );
}

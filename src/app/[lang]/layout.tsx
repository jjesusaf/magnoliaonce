import { locales } from "@/lib/i18n";
import { PageTransition } from "@/components/page-transition";

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return (
    <div lang={lang}>
      <PageTransition>{children}</PageTransition>
    </div>
  );
}

import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import { CartProvider } from "@/lib/cart-context";
import { AuthProvider } from "@/lib/auth-context";
import { FavoritesProvider } from "@/lib/favorites-context";
import { CartToast } from "@/components/shop/cart-toast";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://magnoliaonce.com";

export const metadata: Metadata = {
  title: {
    default: "Magnolia Once — Estudio Floral Contemporáneo",
    template: "%s | Magnolia Once",
  },
  description:
    "Estudio floral contemporáneo y tienda en línea. Arreglos florales únicos, ramos artísticos y diseño floral para eventos.",
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: "website",
    siteName: "Magnolia Once",
    title: "Magnolia Once — Estudio Floral Contemporáneo",
    description:
      "Arreglos florales únicos, ramos artísticos y diseño floral para eventos.",
    images: [
      {
        url: "/assets-site/arreglo1.jpeg",
        width: 1200,
        height: 630,
        alt: "Arreglo floral Magnolia Once",
      },
    ],
    locale: "es_MX",
    alternateLocale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Magnolia Once — Estudio Floral Contemporáneo",
    description:
      "Arreglos florales únicos, ramos artísticos y diseño floral para eventos.",
    images: ["/assets-site/arreglo1.jpeg"],
  },
  icons: {
    icon: "/images/logo-mini-dark.svg",
    apple: "/images/logo-mini-dark.svg",
  },
};

const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <FavoritesProvider>
            <CartProvider>
              {children}
              <CartToast />
            </CartProvider>
          </FavoritesProvider>
        </AuthProvider>

        {/* ── Meta Pixel (Facebook/Instagram) ── */}
        {META_PIXEL_ID && (
          <Script id="meta-pixel" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${META_PIXEL_ID}');
              fbq('track', 'PageView');
            `}
          </Script>
        )}

        {/* ── Google Analytics 4 ── */}
        {GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}', {
                  send_page_view: true
                });
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}

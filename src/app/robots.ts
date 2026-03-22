import type { MetadataRoute } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://magnoliaonce.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/auth/", "/*/admin", "/*/upload"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}

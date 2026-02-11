import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
let supabaseHostname = "*.supabase.co";
try {
  if (supabaseUrl.startsWith("https://")) {
    supabaseHostname = new URL(supabaseUrl).hostname;
  }
} catch {
  // fallback to wildcard if URL is invalid
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: supabaseHostname,
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;

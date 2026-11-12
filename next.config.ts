import type { NextConfig } from "next";
import { legacyRedirects } from "./src/data/redirects";

const nextConfig: NextConfig = {
  trailingSlash: true,
  images: { unoptimized: true },
  // Photos uploaded in /admin go through server actions (Supabase Storage limit is 4 MB).
  experimental: { serverActions: { bodySizeLimit: "4mb" } },
  async redirects() {
    return legacyRedirects;
  }
};

export default nextConfig;

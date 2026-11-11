import type { NextConfig } from "next";
import { legacyRedirects } from "./src/data/redirects";

const nextConfig: NextConfig = {
  trailingSlash: true,
  images: { unoptimized: true },
  async redirects() {
    return legacyRedirects;
  }
};

export default nextConfig;

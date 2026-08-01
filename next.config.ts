import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: {optimizePackageImports: ["lucide-react", "recharts"]},
};

export default createNextIntlPlugin("./src/i18n/request.ts")(nextConfig);

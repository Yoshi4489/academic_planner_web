import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: {optimizePackageImports: ["lucide-react", "recharts"]},
  async headers(){return [{source:"/sw.js",headers:[{key:"Cache-Control",value:"no-cache, no-store, must-revalidate"},{key:"Service-Worker-Allowed",value:"/"}]}];},
};

export default createNextIntlPlugin("./src/i18n/request.ts")(nextConfig);

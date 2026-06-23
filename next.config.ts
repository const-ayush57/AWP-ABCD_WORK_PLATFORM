import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true, // Exports routes as /admin/index.html instead of /admin.html
  // No serverExternalPackages needed for static export
  images: {
    unoptimized: true, // Required for next export
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "@tremor/react", "date-fns", "recharts"],
  },
};

export default nextConfig;

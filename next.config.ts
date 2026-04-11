import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "bcryptjs"],
  experimental: {
    optimizePackageImports: ["lucide-react", "@tremor/react", "date-fns", "recharts"],
  },
};

export default nextConfig;

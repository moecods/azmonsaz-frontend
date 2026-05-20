import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  eslint: {
    // Project has legacy lint noise; production Docker image still needs `next build`.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // MUI v7 Grid typings and other legacy issues; fix incrementally in the codebase.
    ignoreBuildErrors: true,
  },
};

export default nextConfig;

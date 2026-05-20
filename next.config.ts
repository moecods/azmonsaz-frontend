import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Smaller dev/prod bundles for MUI — faster compile of heavy pages like /exams/create
  experimental: {
    optimizePackageImports: ["@mui/material", "@mui/icons-material", "@mui/lab"],
    // Persist Turbopack cache under .next (keep on Docker volume, not bind mount)
    turbopackFileSystemCacheForDev: true,
  },
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

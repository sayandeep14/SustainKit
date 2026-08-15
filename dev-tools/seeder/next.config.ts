import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This app has its own package-lock.json nested inside the main repo;
  // pin the workspace root so Next.js doesn't infer the parent repo's root.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Transpile the db package
  transpilePackages: ["@bugable/db"],
};

export default nextConfig;

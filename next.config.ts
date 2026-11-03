import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3"],
  basePath: "/needs",
  distDir: ".next-needs",
  env: { NEXT_PUBLIC_BASE_PATH: "/needs" },
};

export default nextConfig;

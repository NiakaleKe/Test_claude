// next.config.ts
import type { NextConfig } from "next";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
require("./node-compat.cjs");

const nextConfig: NextConfig = {
  devIndicators: false,
};

export default nextConfig;
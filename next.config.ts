import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  // Pin the workspace root: a stray lockfile in a parent dir otherwise makes
  // Next infer the wrong root and emit a build warning.
  turbopack: {
    root: __dirname,
  },
};

// Wires next-intl's request config (src/i18n/request.ts) into the build.
const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);

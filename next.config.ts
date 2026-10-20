import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fully static site, served from Cloudflare Workers static assets (wrangler.jsonc).
  // `/` -> `/en` lives in public/_redirects, since export mode has no redirects().
  output: "export",
  turbopack: {
    rules: {
      "*.css": { loaders: ["@tailwindcss/turbopack"], as: "*.css" },
    },
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
    unoptimized: true,
  },
};

export default nextConfig;

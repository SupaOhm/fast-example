import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fully static site, served from Cloudflare Workers static assets (wrangler.jsonc).
  // `/` is a language chooser (app/(choose)); returning visitors skip it client-side.
  output: "export",
  turbopack: {
    rules: {
      "*.css": { loaders: ["@tailwindcss/turbopack"], as: "*.css" },
    },
  },
  images: {
    // Static export has no image server: lib/image-loader.ts asks Unsplash for each srcset width.
    loader: "custom",
    loaderFile: "./lib/image-loader.ts",
    // 480 first, so a two-column grid on a phone doesn't jump straight to 640.
    deviceSizes: [480, 640, 750, 828, 1080, 1200, 1920, 2048],
  },
};

export default nextConfig;

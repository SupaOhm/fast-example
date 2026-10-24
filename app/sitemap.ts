import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n/config";
import { packages } from "@/lib/packages";
import { SITE_URL } from "@/lib/site";

// Static export needs this to write the file at build time.
export const dynamic = "force-static";

// The hub pages in both languages, plus each demo's front page. Demo admin screens are left out.
export default function sitemap(): MetadataRoute.Sitemap {
  const hub = ["", "/compare"].map((path) => ({
    url: `${SITE_URL}/en${path}`,
    alternates: { languages: Object.fromEntries(locales.map((l) => [l, `${SITE_URL}/${l}${path}`])) },
  }));
  return [
    { url: SITE_URL },
    ...hub,
    ...hub.map((entry) => ({ ...entry, url: entry.alternates.languages.th })),
    ...packages.map((pkg) => ({ url: `${SITE_URL}${pkg.demoPath}` })),
  ];
}

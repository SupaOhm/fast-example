import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n/config";

/** The live site. Metadata and the sitemap need absolute URLs (hreflang links must be absolute). */
export const SITE_URL = "https://devbyohm.com";

// The picture on shared links, one per language (scripts/capture-share.mjs, 1200×630).
const SHARE_ALT: Record<Locale, string> = {
  en: "SupaOhm: See exactly what you're paying for. Websites and web apps, each with a live demo.",
  th: "SupaOhm: เห็นชัดๆ ว่าจ่ายแล้วได้อะไร รับทำเว็บไซต์และเว็บแอป ทุกแพ็กเกจมีเว็บตัวอย่างให้ลอง",
};

/** The preview card LINE, Facebook and chat apps show for a shared link. */
export function shareMetadata({
  title,
  description,
  path,
  locale,
}: {
  title: string;
  description: string;
  path: string;
  locale: Locale;
}): Pick<Metadata, "openGraph" | "twitter"> {
  const image = { url: `/share/${locale}.jpg`, width: 1200, height: 630, alt: SHARE_ALT[locale] };
  return {
    openGraph: {
      type: "website",
      siteName: "SupaOhm",
      url: path,
      title,
      description,
      locale: locale === "th" ? "th_TH" : "en_US",
      images: [image],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

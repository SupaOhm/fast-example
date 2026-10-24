import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n/config";

/** The live site. Metadata and the sitemap need absolute URLs (hreflang links must be absolute). */
export const SITE_URL = "https://devbyohm.com";

// The resort demo's screenshot (scripts/capture-thumbs.mjs, 1440×900) is the picture on shared links.
const SHARE_IMAGE = { url: "/thumbs/web-premium.jpg", width: 1440, height: 900 };
const SHARE_ALT: Record<Locale, string> = {
  en: "Saeng Chan Resort, one of the live demos",
  th: "แสงจันทร์ รีสอร์ท หนึ่งในเดโมที่ลองใช้ได้",
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
  const image = { ...SHARE_IMAGE, alt: SHARE_ALT[locale] };
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

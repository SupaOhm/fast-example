import "../globals.css";
import { Anuphan, Bricolage_Grotesque, Itim, Kalam } from "next/font/google";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, locales } from "@/lib/i18n/config";
import { SITE_URL } from "@/lib/site";

const anuphan = Anuphan({ subsets: ["thai", "latin"], variable: "--font-anuphan" });
const bricolage = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage" });
// Hero accent word only. Kalam has no Thai glyphs; .scribble:lang(th) in globals.css switches to Itim.
const kalam = Kalam({ weight: "700", subsets: ["latin"], variable: "--font-kalam" });
const itim = Itim({ weight: "400", subsets: ["thai"], variable: "--font-itim", preload: false });

export const metadata: Metadata = { metadataBase: new URL(SITE_URL) };

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function HubLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <html
      lang={locale}
      data-scroll-behavior="smooth"
      className={`${anuphan.variable} ${bricolage.variable} ${kalam.variable} ${itim.variable}`}
    >
      <body className="bg-forest font-sans text-cream antialiased">{children}</body>
    </html>
  );
}

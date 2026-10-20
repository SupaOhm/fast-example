import "../globals.css";
import { Anuphan, Bricolage_Grotesque, Itim, Kalam } from "next/font/google";
import { notFound } from "next/navigation";
import { isLocale, locales } from "@/lib/i18n/config";

const anuphan = Anuphan({ subsets: ["thai", "latin"], variable: "--font-anuphan" });
const bricolage = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage" });
// Hero accent word only. No metric-adjusted fallback for Kalam, so Thai glyphs fall through to Itim.
const kalam = Kalam({ weight: "700", subsets: ["latin"], variable: "--font-kalam", adjustFontFallback: false });
const itim = Itim({ weight: "400", subsets: ["thai"], variable: "--font-itim", preload: false });

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

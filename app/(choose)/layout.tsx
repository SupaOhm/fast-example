import "../globals.css";
import type { Metadata } from "next";
import { Anuphan, Bricolage_Grotesque } from "next/font/google";
import { LOCALE_STORAGE_KEY, locales } from "@/lib/i18n/config";
import { SITE_URL } from "@/lib/site";

const anuphan = Anuphan({ subsets: ["thai", "latin"], variable: "--font-anuphan" });
const bricolage = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage" });

export const metadata: Metadata = { metadataBase: new URL(SITE_URL) };

// Returning visitors skip the chooser: the hub stores the language on every visit (RememberLocale),
// and this runs before first paint, so they never see the card.
const skipIfChosen = `try{var l=localStorage.getItem(${JSON.stringify(LOCALE_STORAGE_KEY)});if(${JSON.stringify(locales)}.indexOf(l)>-1)location.replace("/"+l)}catch(e){}`;

export default function ChooseLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${anuphan.variable} ${bricolage.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: skipIfChosen }} />
      </head>
      <body className="bg-forest font-sans text-cream antialiased">{children}</body>
    </html>
  );
}

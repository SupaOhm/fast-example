import type { Metadata } from "next";
import { IBM_Plex_Sans_Thai } from "next/font/google";
import { DemoPill } from "@/components/demo/demo-pill";
import { LangScope } from "@/components/demo/lang";
import { company } from "@/lib/demos/company/content";
import { SiteFooter } from "./_components/site-footer";
import { SiteHeader } from "./_components/site-header";

const plex = IBM_Plex_Sans_Thai({ weight: ["400", "500", "700"], subsets: ["thai", "latin"] });

export const metadata: Metadata = {
  title: {
    template: "%s | Siam Precision",
    default: "Siam Precision Engineering · สยามพรีซิชั่น",
  },
  description: company.intro.en,
};

const palette = {
  "--navy": "#14213d",
  "--navy-2": "#1d2e52",
  "--steel": "#e7ebf0",
  "--orange": "#f28c28",
  "--orange-ink": "#a34f00",
  "--ink": "#1b1f27",
  "--muted": "#4d5868",
  "--line": "#cdd4dd",
} as React.CSSProperties;

export default function CompanyLayout({ children }: { children: React.ReactNode }) {
  return (
    <LangScope style={palette} className={`${plex.className} flex min-h-screen flex-col bg-white text-(--ink)`}>
      <SiteHeader />
      <div className="flex-1">{children}</div>
      <SiteFooter />
      <DemoPill packageId="web-standard" />
    </LangScope>
  );
}

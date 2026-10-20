import type { Metadata } from "next";
import { Anuphan, Mitr } from "next/font/google";
import { DemoPill } from "@/components/demo/demo-pill";
import { ResortFooter } from "./_components/resort-footer";
import { ResortHeader } from "./_components/resort-header";
import { LangScope } from "./_components/t";

// Display face ships one weight, so every --font-display heading renders Medium.
const display = Mitr({
  weight: "500",
  subsets: ["thai", "latin"],
  variable: "--font-display",
});
const body = Anuphan({ subsets: ["thai", "latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: {
    template: "%s | Saeng Chan Resort",
    default: "Saeng Chan Resort | Ao Nang, Krabi",
  },
  description: "A 24-key boutique resort in Ao Nang, Krabi. Fictional business for a demo site.",
};

const palette = {
  "--sand": "#f3ece0",
  "--sand-2": "#e9dfcd",
  "--paper": "#fbf8f2",
  "--sea": "#1f5f5b",
  "--sea-deep": "#123b39",
  "--night": "#0c2928",
  "--sun": "#d9a441",
  "--sun-ink": "#7d5a12",
  "--ink": "#1d2321",
  "--muted": "#55605c",
  "--line": "#d8ccb6",
  "--field": "#8f8676",
  "--error": "#a3261b",
} as React.CSSProperties;

export default function ResortLayout({ children }: { children: React.ReactNode }) {
  return (
    <LangScope
      style={palette}
      className={`${display.variable} ${body.variable} ${body.className} flex min-h-screen flex-col bg-(--sand) text-(--ink) selection:bg-(--sun)/40`}
    >
      <ResortHeader />
      <div className="flex-1">{children}</div>
      <ResortFooter />
      <DemoPill packageId="web-premium" />
    </LangScope>
  );
}

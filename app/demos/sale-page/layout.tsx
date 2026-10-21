import type { Metadata } from "next";
import { Prompt } from "next/font/google";
import { DemoPill } from "@/components/demo/demo-pill";
import { LangScope } from "@/components/demo/lang";

const prompt = Prompt({ weight: ["400", "600", "800"], subsets: ["thai", "latin"] });

export const metadata: Metadata = {
  title: "Mali Botanics — Jasmine Rice Milk Serum",
  description: "Mali Botanics jasmine rice milk serum. A fictional business for a demo site.",
};

const palette = {
  "--green-deep": "#17331f",
  "--gold": "#f2d16b",
  "--gold-ink": "#7a5c0f",
  "--red": "#d7263d",
  "--cream": "#f6f1e4",
  "--ink": "#17331f",
  "--muted": "#4b5a4e",
  "--mint": "#dfe9d6",
  "--line-green": "#04913e",
  // Supporting surfaces, all checked for AA with the text set on them:
  // gold on --green-2 7.36, mint on --green-2 8.74, gold-ink on --paper 6.08, muted on --paper 7.13.
  "--green-2": "#1f4429",
  "--paper": "#fffcf3",
  // The LINE buttons' solid offset shadow.
  "--line-deep": "#03602a",
} as React.CSSProperties;

export default function SalePageLayout({ children }: { children: React.ReactNode }) {
  return (
    <LangScope
      style={palette}
      className={`${prompt.className} min-h-screen bg-(--cream) text-(--ink) selection:bg-(--gold) selection:text-(--green-deep)`}
    >
      {children}
      <DemoPill packageId="web-basic" />
    </LangScope>
  );
}

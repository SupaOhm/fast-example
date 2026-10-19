import type { Metadata } from "next";
import { Prompt } from "next/font/google";
import { DemoPill } from "@/components/demo/demo-pill";
import { product } from "@/lib/demos/sale-page/content";

const prompt = Prompt({ weight: ["300", "400", "600"], subsets: ["thai", "latin"] });

export const metadata: Metadata = {
  title: "Mali Botanics — เซรั่มน้ำนมข้าวมะลิ",
  description: product.sub,
};

const palette = {
  "--cream": "#f7f1e6",
  "--leaf": "#3f5b3a",
  "--leaf-soft": "#dfe7d4",
  "--ink": "#2a2620",
  "--gold": "#b8893b",
  // Darker gold for TEXT (and small-text backgrounds): 5.0:1 on cream; --gold is 2.8:1.
  "--gold-ink": "#86602a",
  "--muted": "#6a6257",
  "--line": "#e4dac8",
} as React.CSSProperties;

export default function SalePageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={palette} className={`${prompt.className} min-h-screen bg-(--cream) text-(--ink)`}>
      {children}
      <DemoPill packageId="web-basic" />
    </div>
  );
}

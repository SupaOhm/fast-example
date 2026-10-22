import type { Metadata } from "next";
import { Anuphan, JetBrains_Mono } from "next/font/google";
import { DemoPill } from "@/components/demo/demo-pill";
import { LangScope } from "@/components/demo/lang";

const ui = Anuphan({ weight: ["400", "500", "600"], subsets: ["thai", "latin"], variable: "--font-ui" });
const mono = JetBrains_Mono({ weight: ["400", "500", "700"], subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Orders API · Raan Dee",
  description:
    "Raan Dee's Orders API: a small REST API that takes orders and pings the shop on LINE. A fictional business for a demo site.",
};

const palette = {
  "--bg": "#f6f7f4",
  "--panel": "#ffffff",
  "--panel-2": "#eef1ec",
  "--line": "#d9ded6",
  "--text": "#15201a",
  "--muted": "#55615a",
  "--get": "#1a7f37",
  "--post": "#0969da",
  "--patch": "#9a6700",
  "--err": "#cf222e",
  "--line-green": "#06c755",
  "--line-green-ink": "#067a37",
  "--code-bg": "#0e1116",
  "--code-text": "#e6edf3",
  "--code-muted": "#8b949e",
} as React.CSSProperties;

export default function OrdersApiLayout({ children }: { children: React.ReactNode }) {
  return (
    <LangScope
      style={palette}
      className={`${ui.variable} ${mono.variable} ${ui.className} min-h-screen bg-(--bg) text-(--text) selection:bg-(--post)/20`}
    >
      {children}
      <DemoPill packageId="app-basic" />
    </LangScope>
  );
}

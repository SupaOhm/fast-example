import type { Metadata } from "next";
import { Anuphan, JetBrains_Mono } from "next/font/google";
import { DemoPill } from "@/components/demo/demo-pill";

const ui = Anuphan({ weight: ["400", "500", "600"], subsets: ["thai", "latin"], variable: "--font-ui" });
const mono = JetBrains_Mono({ weight: ["400", "500", "700"], subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Orders API — เอกสาร API",
  description:
    "เอกสาร Orders API ของร้านดี (ร้านสมมติ) พร้อมลองยิงคำขอได้ในเบราว์เซอร์ และดูตัวอย่างแจ้งเตือนเข้า LINE",
};

const palette = {
  "--bg": "#0e1116",
  "--panel": "#161b22",
  "--panel-2": "#1c222b",
  "--line": "#2a313c",
  "--text": "#e6edf3",
  "--muted": "#8b949e",
  "--get": "#3fb950",
  "--post": "#58a6ff",
  "--patch": "#d29922",
  "--err": "#f85149",
  "--line-green": "#06c755",
} as React.CSSProperties;

export default function OrdersApiLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={palette}
      className={`${ui.variable} ${mono.variable} ${ui.className} min-h-screen bg-(--bg) text-(--text) selection:bg-(--post)/30`}
    >
      {children}
      <DemoPill packageId="app-basic" />
    </div>
  );
}

import type { Metadata } from "next";
import { Bai_Jamjuree, JetBrains_Mono } from "next/font/google";
import { DemoPill } from "@/components/demo/demo-pill";
import { LangScope } from "@/components/demo/lang";
import { SHOP_CSS } from "./_components/shop-css";

const ui = Bai_Jamjuree({ weight: ["400", "500", "600", "700"], subsets: ["thai", "latin"], variable: "--font-ui" });
const mono = JetBrains_Mono({ weight: ["400", "600"], subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: {
    template: "%s | Raan Dee Back Office",
    default: "Raan Dee Back Office · ร้านดี ระบบหลังร้าน",
  },
  description:
    "Raan Dee's back office, a fictional Chiang Mai souvenir shop: today's packing, orders, stock and sales.",
};

// Kraft paper fibres: a faint, fixed noise over the page colour.
const FIBRES =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='f'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .43 0 0 0 0 .33 0 0 0 0 .2 0 0 0 .5 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23f)' opacity='.22'/%3E%3C/svg%3E\")";

const palette = {
  "--bg": "#f1e6d2",
  "--paper": "#fbf7ef",
  "--line": "#d8c6a3",
  "--ink": "#2b2217",
  "--muted": "#665540",
  "--wood": "#2b2217",
  "--mustard": "#e2b04a",
  "--mustard-ink": "#8a5a00",
  "--warn": "#a3361f",
  "--ok": "#3d6b2f",
  backgroundImage: FIBRES,
} as React.CSSProperties;

export default function ShopAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <LangScope
      style={palette}
      className={`rd-shop ${ui.variable} ${mono.variable} ${ui.className} min-h-screen bg-(--bg) text-(--ink) selection:bg-(--mustard)/60`}
    >
      <style>{SHOP_CSS}</style>
      {children}
      <DemoPill packageId="app-standard" />
    </LangScope>
  );
}

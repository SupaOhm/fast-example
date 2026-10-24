import type { Metadata } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import { DemoPill } from "@/components/demo/demo-pill";
import { LangScope } from "@/components/demo/lang";
import { SHOP_CSS } from "./_components/shop-css";

const font = Noto_Sans_Thai({ weight: ["400", "500", "600"], subsets: ["thai", "latin"] });

export const metadata: Metadata = {
  title: {
    template: "%s | Raan Dee Back Office",
    default: "Raan Dee Back Office · ร้านดี ระบบหลังร้าน",
  },
  description:
    "Raan Dee's back office, a fictional Chiang Mai souvenir shop: today's packing, orders, stock and sales.",
};

const palette = {
  "--bg": "#f4f6f4",
  "--panel": "#ffffff",
  "--line": "#e3e8e4",
  "--brand": "#1f7a5a",
  "--brand-ink": "#166048",
  "--brand-soft": "#e3f2eb",
  "--warn": "#c2410c",
  "--warn-ink": "#9a3412",
  "--warn-soft": "#fdeee6",
  "--ink": "#17201b",
  "--muted": "#56655c",
} as React.CSSProperties;

export default function ShopAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <LangScope
      style={palette}
      className={`rd-shop ${font.className} min-h-screen bg-(--bg) text-(--ink) selection:bg-(--brand-soft)`}
    >
      <style>{SHOP_CSS}</style>
      {children}
      <DemoPill packageId="app-standard" />
    </LangScope>
  );
}

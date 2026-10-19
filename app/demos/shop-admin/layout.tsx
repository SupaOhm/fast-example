import type { Metadata } from "next";
import { Bai_Jamjuree } from "next/font/google";
import { DemoPill } from "@/components/demo/demo-pill";

const font = Bai_Jamjuree({ weight: ["400", "500", "600"], subsets: ["thai", "latin"] });

export const metadata: Metadata = {
  title: {
    template: "%s | ร้านดี Back Office",
    default: "ร้านดี Back Office",
  },
  description:
    "ระบบหลังร้านของร้านดี ร้านของฝากเชียงใหม่ (ร้านสมมติ): ภาพรวมยอดขาย คำสั่งซื้อ และสต็อกสินค้า",
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
    <div
      style={palette}
      className={`${font.className} min-h-screen bg-(--bg) text-(--ink) selection:bg-(--brand-soft)`}
    >
      {children}
      <DemoPill packageId="app-standard" />
    </div>
  );
}

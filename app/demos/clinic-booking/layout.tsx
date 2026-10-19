import type { Metadata } from "next";
import { Kanit } from "next/font/google";
import { DemoPill } from "@/components/demo/demo-pill";

const font = Kanit({ weight: ["300", "400", "500"], subsets: ["thai", "latin"] });

export const metadata: Metadata = {
  title: {
    template: "%s | Lumi Clinic",
    default: "ลูมิ คลินิก | Lumi Clinic",
  },
  description: "ลูมิ คลินิก คลินิกดูแลผิว (สมมติ) จองคิวผ่าน LINE เลือกบริการ ผู้ดูแล วันและเวลาได้เอง",
};

const palette = {
  "--blush": "#fbeff0",
  "--blush-2": "#f4dde0",
  "--paper": "#fffafa",
  "--rose": "#c86b7a",
  "--rose-deep": "#8e3e4d",
  "--ink": "#2b2226",
  "--muted": "#6b5960",
  "--line": "#ebd3d7",
  "--line-green": "#06c755",
  "--line-green-ink": "#04723a",
  "--chat": "#c9d6e6",
  "--chat-ink": "#46505e",
  "--bubble-me": "#a6e88e",
  "--error": "#b3261e",
} as React.CSSProperties;

export default function ClinicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={palette} className={`${font.className} min-h-screen bg-(--blush) text-(--ink) selection:bg-(--rose)/30`}>
      {children}
      <DemoPill packageId="app-premium" />
    </div>
  );
}

import type { Metadata } from "next";
import { Kanit } from "next/font/google";
import { DemoPill } from "@/components/demo/demo-pill";
import { LangScope } from "@/components/demo/lang";

const font = Kanit({ weight: ["400", "500", "600"], subsets: ["thai", "latin"] });

export const metadata: Metadata = {
  title: {
    template: "%s | Lumi Clinic",
    default: "Lumi Clinic · ลูมิ คลินิก",
  },
  description:
    "Lumi Clinic, a fictional skin clinic in Bangkok: book a treatment on LINE in three taps and see it land in the clinic's schedule.",
};

const palette = {
  "--rose": "#fbeef0",
  "--rose-2": "#f5dde2",
  "--paper": "#fffafb",
  "--line": "#ecd3d9",
  "--ink": "#2a1d22",
  "--muted": "#6b5560",
  "--wine": "#6b1f3a",
  "--accent": "#c2185b",
  "--line-green": "#06c755",
  "--line-green-ink": "#04723a",
  "--error": "#b3261e",
  // The LINE chat mock on the booking page; Task 3 redraws it.
  "--chat": "#c9d6e6",
  "--chat-ink": "#46505e",
  "--bubble-me": "#a6e88e",
} as React.CSSProperties;

export default function ClinicLayout({ children }: { children: React.ReactNode }) {
  return (
    <LangScope style={palette} className={`${font.className} min-h-screen bg-(--rose) text-(--ink) selection:bg-(--accent)/20`}>
      {children}
      <DemoPill packageId="app-premium" />
    </LangScope>
  );
}

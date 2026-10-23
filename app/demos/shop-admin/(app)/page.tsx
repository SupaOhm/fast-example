import type { Metadata } from "next";
import { Overview } from "../_components/overview";

export const metadata: Metadata = { title: "Overview · ภาพรวม" };

export default function ShopOverviewPage() {
  return <Overview />;
}

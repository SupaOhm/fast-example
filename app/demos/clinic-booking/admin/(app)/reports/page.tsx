import type { Metadata } from "next";
import { Reports } from "../../../_components/reports";

export const metadata: Metadata = { title: "รายงาน" };

export default function ClinicReportsPage() {
  return <Reports />;
}

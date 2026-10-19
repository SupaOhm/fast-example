import type { Metadata } from "next";
import { Queue } from "../../_components/queue";

export const metadata: Metadata = { title: "คิววันนี้" };

export default function ClinicQueuePage() {
  return <Queue />;
}

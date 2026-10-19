import { createDemoStore } from "@/lib/demo-store";
import { toISODate } from "@/lib/dates";
import { buildClinicSeed, type ClinicData } from "./data";

export const clinicSession = createDemoStore<boolean>("clinic:session", false);
// The seed is built relative to today. The data key is scoped by day so a
// visitor returning on a later day gets a fresh seed instead of a saved
// dataset whose fixed calendar dates have drifted out of the "today"/30-day
// windows. Session keys stay unscoped (the e2e smoke test seeds them).
export const clinicData = createDemoStore<ClinicData>(
  `clinic:data:${toISODate(new Date())}`,
  buildClinicSeed(new Date()),
);

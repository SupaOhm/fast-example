import { createDemoStore } from "@/lib/demo-store";
import { buildClinicSeed, type ClinicData } from "./data";

export const clinicSession = createDemoStore<boolean>("clinic:session", false);
export const clinicData = createDemoStore<ClinicData>("clinic:data", buildClinicSeed(new Date()));

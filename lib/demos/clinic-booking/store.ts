import { createDemoStore } from "@/lib/demo-store";
import { toISODate } from "@/lib/dates";
import { buildClinicSeed, clinicNow, type ClinicData } from "./data";

// The demo opens signed in, so the admin has no login wall. Logging out stores false and the
// login screen guards the admin until the visitor logs in again. "v2" so visitors who logged
// out under the old build also land on the admin.
export const clinicSession = createDemoStore<boolean>("clinic:session:v2", true);
// The seed is built relative to the clinic's now (today's bookings show the day in progress, at the demo time
// while the clinic is closed). The data key is scoped by the real day, which is the same calendar day, so a
// visitor returning on a later day gets a fresh seed. "v2" drops data saved before service and staff names
// became bilingual.
export const clinicData = createDemoStore<ClinicData>(
  `clinic:data:v2:${toISODate(new Date())}`,
  buildClinicSeed(clinicNow(new Date()).now),
);
/** The booking the visitor just made on the LINE page, so the schedule and admin can highlight it. */
export const clinicLastBooking = createDemoStore<string | null>("clinic:last-booking", null);

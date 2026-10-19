import { ClinicFrame } from "../../_components/clinic-shell";

// ClinicFrame = <RequireSession store={clinicSession} loginPath="/demos/clinic-booking/admin/login"><ClinicShell>…
export default function ClinicAdminLayout({ children }: { children: React.ReactNode }) {
  return <ClinicFrame>{children}</ClinicFrame>;
}

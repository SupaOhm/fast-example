import type { Metadata } from "next";
import { ClinicLoginArt, ClinicLoginForm } from "../../_components/clinic-login-form";

export const metadata: Metadata = { title: "Staff log in · เข้าสู่ระบบเจ้าหน้าที่" };

export default function ClinicLoginPage() {
  return (
    <main className="min-h-screen lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <ClinicLoginArt />
      <ClinicLoginForm />
    </main>
  );
}

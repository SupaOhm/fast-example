import type { Metadata } from "next";
import { LoginForm } from "../_components/login-form";

export const metadata: Metadata = { title: "เข้าสู่ระบบ" };

export default function ShopLoginPage() {
  return (
    <main className="grid min-h-screen place-items-center px-4 pb-28 pt-10">
      <LoginForm />
    </main>
  );
}

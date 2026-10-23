import type { Metadata } from "next";
import { LoginBar, LoginForm } from "../_components/login-form";

export const metadata: Metadata = { title: "Log in · เข้าสู่ระบบ" };

export default function ShopLoginPage() {
  return (
    <>
      <LoginBar />
      <main className="grid place-items-center px-4 pb-28 pt-8 sm:pt-16">
        <LoginForm />
      </main>
    </>
  );
}

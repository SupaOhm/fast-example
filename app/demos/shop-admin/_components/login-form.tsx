"use client";

import { Info, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { shopSession } from "@/lib/demos/shop-admin/store";
import { useDemoStore, useHydrated } from "@/lib/use-demo-store";
import { BrandMark } from "./brand-mark";

const field =
  "mt-1.5 block w-full rounded-lg border border-(--line) bg-white px-3.5 py-2.5 text-[15px] text-(--ink) outline-none transition-colors focus:border-(--brand) focus:ring-3 focus:ring-(--brand)/15";

export function LoginForm() {
  const router = useRouter();
  const hydrated = useHydrated();
  const [session, setSession] = useDemoStore(shopSession);
  const [email, setEmail] = useState("demo@randee.example");
  const [password, setPassword] = useState("demo1234");

  useEffect(() => {
    if (hydrated && session) router.replace("/demos/shop-admin");
  }, [hydrated, session, router]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Demo only: any input is accepted and nothing leaves the browser.
    setSession(true);
    router.push("/demos/shop-admin");
  }

  return (
    <div className="w-full max-w-[400px]">
      <div className="mb-6 flex items-center justify-center gap-3">
        <BrandMark className="size-11 text-lg" />
        <div className="leading-[1.25]">
          <p className="text-lg font-semibold">ร้านดี</p>
          <p className="text-sm text-(--muted)">ของฝากเชียงใหม่</p>
        </div>
      </div>

      <div className="rounded-2xl border border-(--line) bg-(--panel) p-6 shadow-[0_1px_2px_rgba(23,32,27,0.04),0_12px_32px_-16px_rgba(23,32,27,0.18)] sm:p-8">
        <h1 className="text-xl font-semibold leading-[1.3]">ร้านดี — ระบบหลังร้าน</h1>
        <p className="mt-1 text-sm leading-[1.5] text-(--muted)">
          ดูยอดขาย จัดการคำสั่งซื้อ และอัปเดตสต็อกได้ในที่เดียว
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="shop-email" className="text-sm font-medium">
              อีเมล
            </label>
            <input
              id="shop-email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={field}
            />
          </div>
          <div>
            <label htmlFor="shop-password" className="text-sm font-medium">
              รหัสผ่าน
            </label>
            <input
              id="shop-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={field}
            />
          </div>

          <p className="flex items-start gap-2 rounded-lg bg-(--brand-soft) px-3 py-2.5 text-sm leading-[1.45] text-(--brand-ink)">
            <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
            บัญชีตัวอย่าง กดเข้าสู่ระบบได้เลย
          </p>

          <button
            type="submit"
            data-testid="login-submit"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-(--brand) px-4 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-(--brand-ink) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--brand)"
          >
            <LogIn className="size-4" aria-hidden />
            เข้าสู่ระบบ
          </button>
        </form>
      </div>

      <p className="mt-5 text-center text-xs leading-[1.5] text-(--muted)">
        ข้อมูลในระบบตัวอย่างเก็บไว้ในเบราว์เซอร์นี้เท่านั้น
      </p>
    </div>
  );
}

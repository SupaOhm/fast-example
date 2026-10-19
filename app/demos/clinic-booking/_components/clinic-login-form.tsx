"use client";

import { Info, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clinicSession } from "@/lib/demos/clinic-booking/store";
import { useDemoStore, useHydrated } from "@/lib/use-demo-store";
import { fieldClass, focusRing } from "./admin-format";

const ADMIN = "/demos/clinic-booking/admin";

export function ClinicLoginForm() {
  const router = useRouter();
  const hydrated = useHydrated();
  const [session, setSession] = useDemoStore(clinicSession);
  const [email, setEmail] = useState("staff@lumi.example");
  const [password, setPassword] = useState("demo1234");

  useEffect(() => {
    if (hydrated && session) router.replace(ADMIN);
  }, [hydrated, session, router]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Demo only: any input is accepted and nothing leaves the browser.
    setSession(true);
    router.push(ADMIN);
  }

  return (
    <div className="w-full max-w-[400px]">
      <div className="mb-7 flex items-center gap-3 lg:hidden">
        <span aria-hidden className="grid size-11 place-items-center rounded-full bg-(--rose-deep) text-lg text-white">
          L
        </span>
        <div className="leading-[1.3]">
          <p className="text-lg font-medium">ลูมิ คลินิก</p>
          <p className="text-sm text-(--muted)">สาขาทองหล่อ</p>
        </div>
      </div>

      <div className="rounded-[1.75rem] border border-(--line) bg-white p-6 shadow-[0_24px_48px_-28px_rgb(142_62_77/0.45)] sm:p-8">
        <h1 className="text-[1.5rem] leading-[1.3] font-normal sm:text-[1.6rem]">
          Lumi Clinic — <span className="whitespace-nowrap">สำหรับเจ้าหน้าที่</span>
        </h1>
        <p className="mt-2 text-[15px] leading-[1.6] text-(--muted)">
          ดูคิวประจำวัน เช็กอินลูกค้า และจัดการบริการ
        </p>

        <form onSubmit={onSubmit} className="mt-7 space-y-4">
          <div>
            <label htmlFor="clinic-email" className="text-sm font-medium">
              อีเมล
            </label>
            <input
              id="clinic-email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="clinic-password" className="text-sm font-medium">
              รหัสผ่าน
            </label>
            <input
              id="clinic-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={fieldClass}
            />
          </div>

          <p className="flex items-start gap-2 rounded-xl bg-(--blush) px-3.5 py-3 text-sm leading-[1.5] text-(--rose-deep)">
            <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span>
              <span className="font-medium">บัญชีตัวอย่าง</span> กรอกไว้ให้แล้ว กดเข้าสู่ระบบได้เลย
            </span>
          </p>

          <button
            type="submit"
            data-testid="login-submit"
            className={`flex w-full items-center justify-center gap-2 rounded-full bg-(--rose-deep) px-4 py-3 text-base font-medium text-white transition-colors hover:bg-[#76323f] ${focusRing}`}
          >
            <LogIn className="size-4" aria-hidden />
            เข้าสู่ระบบ
          </button>
        </form>
      </div>

      <p className="mt-5 text-center text-xs leading-[1.6] text-(--muted)">
        ระบบตัวอย่าง ข้อมูลทั้งหมดเก็บไว้ในเบราว์เซอร์นี้เท่านั้น
      </p>
    </div>
  );
}

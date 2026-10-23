"use client";

import { BarChart3, CalendarClock, ExternalLink, LogOut, Sparkles, Users } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { RequireSession } from "@/components/demo/require-session";
import { ResetDemoButton } from "@/components/demo/reset-demo-button";
import { toISODate } from "@/lib/dates";
import { clinicData, clinicSession } from "@/lib/demos/clinic-booking/store";
import { useDemoStore } from "@/lib/use-demo-store";
import { focusRing } from "./admin-format";

const BASE = "/demos/clinic-booking/admin";

const NAV = [
  { href: BASE, label: "คิววันนี้", icon: CalendarClock },
  { href: `${BASE}/customers`, label: "ลูกค้า", icon: Users },
  { href: `${BASE}/services`, label: "บริการ", icon: Sparkles },
  { href: `${BASE}/reports`, label: "รายงาน", icon: BarChart3 },
] as const;

// Client wrapper: the demo stores hold functions, so a server layout cannot pass them down.
export function ClinicFrame({ children }: { children: React.ReactNode }) {
  return (
    <RequireSession store={clinicSession} loginPath={`${BASE}/login`}>
      <ClinicShell>{children}</ClinicShell>
    </RequireSession>
  );
}

export function ClinicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [data] = useDemoStore(clinicData);
  // The shell only renders after hydration (RequireSession), so "today" is the browser's day.
  const [today] = useState(() => toISODate(new Date()));
  const waiting = data.bookings.filter((b) => b.date === today && b.status === "booked").length;

  function logout() {
    clinicSession.set(false);
    router.push(`${BASE}/login`);
  }

  return (
    <div className="lg:pl-64">
      <aside className="sticky top-0 z-30 grid grid-cols-[minmax(0,1fr)_auto] items-center border-b border-(--line) bg-(--paper)/95 backdrop-blur lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-64 lg:flex-col lg:items-stretch lg:border-r lg:border-b-0 lg:bg-(--paper)">
        <Link href={BASE} className={`order-1 flex min-w-0 items-center gap-2.5 px-4 py-2.5 lg:px-6 lg:pt-7 lg:pb-7 ${focusRing}`}>
          <span
            aria-hidden
            className="grid size-9 shrink-0 place-items-center rounded-full bg-(--wine) text-[15px] text-white lg:size-10 lg:text-base"
          >
            L
          </span>
          <span className="min-w-0 leading-[1.3]">
            <span className="block truncate text-base font-medium lg:text-lg">ลูมิ คลินิก</span>
            <span className="hidden text-xs text-(--muted) lg:block">ระบบหลังร้าน สาขาทองหล่อ</span>
          </span>
        </Link>

        <nav aria-label="เมนูหลัก" className="order-3 col-span-2 border-t border-(--line) lg:order-2 lg:border-t-0 lg:px-3">
          <ul className="grid grid-cols-4 lg:flex lg:flex-col lg:gap-1">
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              const badge = href === BASE && waiting > 0 ? waiting : 0;
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={`relative flex flex-col items-center gap-0.5 px-1 pt-2 pb-2 text-[13px] leading-[1.3] transition-colors lg:flex-row lg:gap-3 lg:rounded-xl lg:px-3 lg:py-2.5 lg:text-[15px] ${focusRing} ${
                      active
                        ? "font-medium text-(--wine) after:absolute after:inset-x-4 after:bottom-0 after:h-0.5 after:rounded-full after:bg-(--wine) lg:bg-(--rose) lg:after:hidden"
                        : "text-(--muted) hover:text-(--ink) lg:hover:bg-(--rose)/60"
                    }`}
                  >
                    <span className="relative">
                      <Icon className="size-[18px] shrink-0" aria-hidden />
                      {badge > 0 && (
                        <span
                          aria-hidden
                          className="absolute -top-1.5 -right-2.5 grid h-4 min-w-4 place-items-center rounded-full bg-(--wine) px-1 text-[10px] leading-none text-white tabular-nums lg:hidden"
                        >
                          {badge}
                        </span>
                      )}
                    </span>
                    <span className="whitespace-nowrap">{label}</span>
                    {badge > 0 && (
                      <>
                        <span
                          aria-hidden
                          className="ml-auto hidden h-5 min-w-5 place-items-center rounded-full bg-(--wine) px-1.5 text-xs leading-none text-white tabular-nums lg:grid"
                        >
                          {badge}
                        </span>
                        <span className="sr-only">(รอเช็กอิน {badge} คิว)</span>
                      </>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="mx-3 mt-6 hidden border-t border-(--line) pt-4 lg:block">
            <Link
              href="/demos/clinic-booking/book"
              target="_blank"
              rel="noopener"
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] text-(--muted) hover:bg-(--rose)/60 hover:text-(--ink) ${focusRing}`}
            >
              <ExternalLink className="size-[18px]" aria-hidden />
              หน้าจองคิวผ่าน LINE ↗
            </Link>
          </div>
        </nav>

        <div className="order-2 flex items-center gap-0.5 pr-2 lg:order-3 lg:mt-auto lg:flex-col lg:items-stretch lg:gap-1 lg:border-t lg:border-(--line) lg:p-3">
          <div className="mb-1 hidden items-center gap-3 rounded-xl px-3 py-2 lg:flex">
            <span aria-hidden className="grid size-9 place-items-center rounded-full bg-(--rose-2) text-sm text-(--wine)">
              ม
            </span>
            <span className="min-w-0 leading-[1.35]">
              <span className="block text-sm font-medium">คุณเมย์</span>
              <span className="block truncate text-xs text-(--muted)">เคาน์เตอร์ต้อนรับ</span>
            </span>
          </div>
          <Link
            href="/demos/clinic-booking/book"
            target="_blank"
            rel="noopener"
            aria-label="เปิดหน้าจองคิวผ่าน LINE ในแท็บใหม่"
            className={`grid size-9 place-items-center rounded-xl text-(--muted) hover:bg-(--rose)/60 hover:text-(--ink) lg:hidden ${focusRing}`}
          >
            <ExternalLink className="size-4" aria-hidden />
          </Link>
          <ResetDemoButton
            stores={[clinicData]}
            label="รีเซ็ตข้อมูล"
            className={`rounded-xl px-2.5 py-2 text-(--muted) hover:bg-(--rose)/60 hover:text-(--ink) lg:px-3 ${focusRing}`}
          />
          <button
            type="button"
            onClick={logout}
            className={`inline-flex items-center gap-2 rounded-xl px-2.5 py-2 text-sm text-(--muted) hover:bg-(--rose)/60 hover:text-(--ink) lg:px-3 ${focusRing}`}
          >
            <LogOut className="size-4" aria-hidden />
            <span className="sr-only lg:not-sr-only">ออกจากระบบ</span>
          </button>
        </div>
      </aside>

      <main className="mx-auto w-full max-w-[1200px] px-4 pt-5 pb-28 sm:px-6 lg:px-10 lg:pt-9">{children}</main>
    </div>
  );
}

"use client";

import { BarChart3, CalendarClock, LogOut, Sparkles, Users } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { DemoLangSwitch, useLang } from "@/components/demo/lang";
import { RequireSession } from "@/components/demo/require-session";
import { ResetDemoButton } from "@/components/demo/reset-demo-button";
import { toISODate } from "@/lib/dates";
import { displayStatus } from "@/lib/demos/clinic-booking/data";
import { clinicData, clinicLastBooking, clinicSession } from "@/lib/demos/clinic-booking/store";
import { fill } from "@/lib/demos/format";
import { useDemoStore } from "@/lib/use-demo-store";
import { focusRing } from "./admin-format";
import { ui } from "./copy";
import { LineGlyph } from "./line-glyph";
import { RingMark } from "./ring-mark";
import { useMinuteTick } from "./use-minute-tick";

const BASE = "/demos/clinic-booking/admin";
const BOOK = "/demos/clinic-booking/book";

const NAV = [
  { href: BASE, label: ui.navQueue, icon: CalendarClock },
  { href: `${BASE}/customers`, label: ui.navCustomers, icon: Users },
  { href: `${BASE}/services`, label: ui.navServices, icon: Sparkles },
  { href: `${BASE}/reports`, label: ui.navReports, icon: BarChart3 },
] as const;

// Phone tabs are 16px. Only English below 360px drops to 14px: four 80px tabs can't hold "Customers" and
// "Treatments" side by side at 16px (Treatments alone is about 81px). Thai fits at 16px down to 320px.
const NARROW_EN = "max-[359px]:text-[14px]";

const quiet = `text-(--muted) transition-colors hover:bg-(--rose) hover:text-(--wine) ${focusRing}`;

// Client wrapper: the demo stores hold functions, so a server layout cannot pass them down.
export function ClinicFrame({ children }: { children: React.ReactNode }) {
  return (
    <RequireSession store={clinicSession} loginPath={`${BASE}/login`}>
      <ClinicShell>{children}</ClinicShell>
    </RequireSession>
  );
}

export function ClinicShell({ children }: { children: React.ReactNode }) {
  const lang = useLang();
  const pathname = usePathname();
  const narrowEn = lang === "en" ? NARROW_EN : "";
  const [data] = useDemoStore(clinicData);
  useMinuteTick();
  // The shell only renders after hydration (RequireSession), so this is the browser's clock. The count follows
  // the same clock-driven status as the queue and the booking page.
  const now = new Date();
  const today = toISODate(now);
  const duration = (id: string) => data.services.find((s) => s.id === id)?.durationMin ?? 30;
  const waiting = data.bookings.filter(
    (b) => b.date === today && displayStatus(b, duration(b.serviceId), now) === "booked",
  ).length;

  return (
    <div className="lg:pl-64">
      <DemoSessionBanner />

      {/* One header for every width: a top bar with a tab strip on phones, a sidebar from `lg` up. */}
      <aside className="sticky top-0 z-30 grid grid-cols-[minmax(0,1fr)_auto] items-center border-b border-(--line) bg-(--paper)/95 backdrop-blur lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-64 lg:flex-col lg:items-stretch lg:border-r lg:border-b-0 lg:bg-(--paper) lg:backdrop-blur-none">
        <Link
          href={BASE}
          aria-label={ui.adminHome[lang]}
          className={`order-1 flex min-w-0 items-center gap-2.5 rounded-lg px-4 py-3 text-(--wine) lg:px-6 lg:pt-7 lg:pb-8 ${focusRing}`}
        >
          <RingMark className="size-7 shrink-0 lg:size-8" />
          {/* Below 360px the controls need the room, so the mark stands alone (the link keeps its name). */}
          <span className="min-w-0 leading-[1.25] max-[359px]:hidden">
            <span className="block truncate text-lg font-semibold">{ui.brand[lang]}</span>
            <span className="hidden text-[14px] text-(--muted) lg:block">{ui.adminSub[lang]}</span>
          </span>
        </Link>

        <nav aria-label={ui.mainNav[lang]} className="order-3 col-span-2 border-t border-(--line) lg:order-2 lg:border-t-0 lg:px-3">
          <ul className="grid grid-cols-4 lg:flex lg:flex-col lg:gap-1">
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname === `${href}/`;
              const badge = href === BASE && waiting > 0 ? waiting : 0;
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={`relative flex h-full flex-col items-center gap-1 px-0.5 pt-2.5 pb-2.5 text-center text-base leading-[1.25] transition-colors lg:flex-row lg:gap-3 lg:rounded-xl lg:px-3 lg:py-2.5 lg:text-left ${narrowEn} ${focusRing} ${
                      active
                        ? "font-medium text-(--wine) after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-(--wine) lg:bg-(--rose) lg:after:hidden"
                        : "text-(--muted) hover:text-(--wine) lg:hover:bg-(--rose)/70"
                    }`}
                  >
                    <span className="relative">
                      <Icon className="size-5 shrink-0" aria-hidden />
                      {badge > 0 && (
                        <span aria-hidden className="absolute -top-1 -right-1.5 size-2.5 rounded-full border-2 border-(--paper) bg-(--accent) lg:hidden" />
                      )}
                    </span>
                    <span>{label[lang]}</span>
                    {badge > 0 && (
                      <>
                        <span
                          aria-hidden
                          className="ml-auto hidden h-6 min-w-6 place-items-center rounded-full bg-(--wine) px-1.5 text-[14px] leading-none text-white tabular-nums lg:grid"
                        >
                          {badge}
                        </span>
                        <span className="sr-only"> ({fill(ui.navWaiting[lang], { n: String(badge) })})</span>
                      </>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="mx-3 mt-6 hidden border-t border-(--line) pt-4 lg:block">
            <Link href={BOOK} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${quiet}`}>
              <LineGlyph className="size-5 text-(--line-green)" />
              {ui.lineBookingPage[lang]}
            </Link>
          </div>
        </nav>

        <div className="order-2 flex items-center gap-1 pr-3 lg:order-3 lg:mt-auto lg:flex-wrap lg:justify-between lg:border-t lg:border-(--line) lg:px-4 lg:py-4">
          <Link
            href={BOOK}
            aria-label={ui.lineBookingPage[lang]}
            className={`grid size-10 place-items-center rounded-full lg:hidden ${quiet}`}
          >
            <LineGlyph className="size-5 text-(--line-green)" />
          </Link>
          <ResetDemoButton
            stores={[clinicData, clinicLastBooking]}
            label={ui.resetData[lang]}
            className={`h-10 rounded-full px-2.5 !text-base whitespace-nowrap lg:px-3 ${quiet}`}
          />
          <DemoLangSwitch
            className={`grid h-10 min-w-11 place-items-center rounded-full border border-(--wine)/25 px-3 font-medium text-(--wine) transition-colors hover:bg-(--rose) ${focusRing}`}
          />
        </div>
      </aside>

      <main className="mx-auto w-full max-w-[1200px] px-4 pt-6 pb-28 sm:px-6 lg:px-10 lg:pt-9">{children}</main>
    </div>
  );
}

/** Says whose view this is, and holds the only way to log out. */
function DemoSessionBanner() {
  const lang = useLang();
  const router = useRouter();

  function logout() {
    clinicSession.set(false);
    router.push(`${BASE}/login`);
  }

  return (
    <div data-testid="demo-session" className="border-b border-(--line) bg-(--rose-2)/60">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-x-4 gap-y-1.5 px-4 py-2 sm:px-6 lg:px-10">
        <p className="flex items-center gap-2.5 leading-[1.4] text-(--wine)">
          <span aria-hidden className="relative grid size-2.5 shrink-0 place-items-center">
            <span className="absolute size-2.5 rounded-full bg-(--accent)/25" />
            <span className="size-1.5 rounded-full bg-(--accent)" />
          </span>
          {ui.demoBanner[lang]}
        </p>
        <button
          type="button"
          onClick={logout}
          className={`-mr-2 ml-auto inline-flex h-9 items-center gap-2 rounded-full px-3 font-medium text-(--wine) transition-colors hover:bg-(--paper) ${focusRing}`}
        >
          <LogOut className="size-4" aria-hidden />
          {ui.logout[lang]}
        </button>
      </div>
    </div>
  );
}

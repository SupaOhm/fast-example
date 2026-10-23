"use client";

import { Eye, LayoutDashboard, LogOut, Package, ReceiptText, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { DemoLangSwitch, useLang } from "@/components/demo/lang";
import { RequireSession } from "@/components/demo/require-session";
import { ResetDemoButton } from "@/components/demo/reset-demo-button";
import { fill } from "@/lib/demos/format";
import { isLowStock, toPack } from "@/lib/demos/shop-admin/data";
import { shopData, shopSession } from "@/lib/demos/shop-admin/store";
import { useDemoStore } from "@/lib/use-demo-store";
import { BrandMark } from "./brand-mark";
import { ui } from "./copy";

const NAV = [
  { href: "/demos/shop-admin", label: ui.navOverview, icon: LayoutDashboard },
  { href: "/demos/shop-admin/orders", label: ui.navOrders, icon: ReceiptText },
  { href: "/demos/shop-admin/stock", label: ui.navStock, icon: Package },
] as const;

// Dark wood counter: faint horizontal grain over --wood.
const WOOD_GRAIN = {
  backgroundImage:
    "repeating-linear-gradient(180deg, rgba(241,230,210,.025) 0 1px, transparent 1px 9px), repeating-linear-gradient(180deg, rgba(0,0,0,.12) 0 2px, transparent 2px 37px)",
} as React.CSSProperties;

// Client wrapper: the stores hold functions, so they cannot be passed from a server layout.
export function AdminFrame({ children }: { children: React.ReactNode }) {
  return (
    <RequireSession store={shopSession} loginPath="/demos/shop-admin/login">
      <AdminShell>{children}</AdminShell>
    </RequireSession>
  );
}

/** The mustard strip across the top: who you're signed in as, and the only way out. */
function DemoSessionBanner() {
  const lang = useLang();
  const router = useRouter();

  function logout() {
    shopSession.set(false);
    router.push("/demos/shop-admin/login");
  }

  return (
    <div
      data-testid="demo-session"
      className="flex items-center justify-between gap-3 border-b-2 border-(--wood) bg-(--mustard) px-4 py-1.5 text-sm leading-[1.4] text-(--ink) lg:col-span-2 lg:px-6"
    >
      <p className="flex min-w-0 items-center gap-2 font-medium">
        <Eye className="hidden size-4 shrink-0 sm:block" aria-hidden />
        <span>{ui.demoBanner[lang]}</span>
      </p>
      <button
        type="button"
        onClick={logout}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-md border-[1.5px] border-(--ink) px-2 py-1 text-sm font-semibold transition-colors hover:bg-(--ink) hover:text-(--mustard) sm:px-2.5"
      >
        <LogOut className="hidden size-4 sm:block" aria-hidden />
        {ui.logout[lang]}
      </button>
    </div>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const lang = useLang();
  const pathname = usePathname();
  const [data] = useDemoStore(shopData);

  const packCount = toPack(data).length;
  const lowCount = data.products.filter(isLowStock).length;
  const badges: Record<string, { n: number; label: string; tone: string } | undefined> = {
    "/demos/shop-admin/orders": packCount
      ? { n: packCount, label: fill(ui.badgeOrders[lang], { n: String(packCount) }), tone: "bg-(--mustard) text-(--ink)" }
      : undefined,
    "/demos/shop-admin/stock": lowCount
      ? { n: lowCount, label: fill(ui.badgeStock[lang], { n: String(lowCount) }), tone: "bg-(--warn) text-(--bg)" }
      : undefined,
  };

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[300px_minmax(0,1fr)] lg:grid-rows-[auto_1fr]">
      <DemoSessionBanner />

      <aside
        style={WOOD_GRAIN}
        className="rd-wood sticky top-0 z-30 bg-(--wood) text-(--bg) shadow-[0_6px_14px_-8px_rgba(43,34,23,.6)] lg:static lg:shadow-[inset_-6px_0_10px_-6px_rgba(0,0,0,.5)]"
      >
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:items-stretch">
          <Link href="/demos/shop-admin" className="flex min-w-0 items-center gap-2.5 px-4 pb-1.5 pt-2.5 lg:gap-3 lg:px-5 lg:pb-7 lg:pt-7">
            <BrandMark className="size-10 lg:size-12" />
            <span className="min-w-0 leading-[1.25]">
              <span className="block truncate text-lg font-bold lg:text-[22px]">{ui.brand[lang]}</span>
              <span className="hidden text-sm text-(--mustard) lg:block">{ui.backOffice[lang]}</span>
            </span>
          </Link>

          <div className="flex items-center gap-1 pr-3 lg:order-3 lg:mt-auto lg:flex-col lg:items-stretch lg:gap-3 lg:border-t lg:border-(--bg)/15 lg:px-5 lg:pb-24 lg:pt-5">
            <div className="hidden items-center gap-3 lg:flex">
              <span aria-hidden className="grid size-10 place-items-center rounded-full bg-(--mustard) text-(--ink)">
                <UserRound className="size-5" />
              </span>
              <span className="min-w-0 leading-[1.3]">
                <span className="block font-semibold">{ui.ownerName[lang]}</span>
                <span className="block text-sm text-(--mustard)">{ui.ownerRole[lang]}</span>
              </span>
            </div>
            <div className="flex items-center gap-1 lg:justify-between">
              <ResetDemoButton
                stores={[shopData]}
                label={ui.resetData[lang]}
                className="min-h-10 rounded-md px-2.5 text-(--bg) transition-colors hover:bg-(--bg)/10 lg:-ml-2.5"
              />
              <DemoLangSwitch className="grid min-h-10 min-w-11 place-items-center rounded-md border-[1.5px] border-(--mustard) px-2 text-sm font-bold text-(--mustard) transition-colors hover:bg-(--mustard) hover:text-(--ink) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--mustard)" />
            </div>
          </div>

          <nav aria-label={ui.mainNav[lang]} className="col-span-2 px-2 pt-1 lg:order-2 lg:px-4 lg:pt-0">
            <ul className="grid grid-cols-3 gap-1 lg:flex lg:flex-col lg:gap-1.5">
              {NAV.map(({ href, label, icon: Icon }) => {
                const active = pathname === href;
                const badge = badges[href];
                return (
                  <li key={href} className="min-w-0">
                    <Link
                      href={href}
                      aria-current={active ? "page" : undefined}
                      className={`flex min-h-11 items-center justify-center gap-1.5 rounded-t-lg px-1.5 text-[15px] font-semibold leading-[1.25] transition-colors lg:min-h-12 lg:justify-start lg:gap-3 lg:rounded-lg lg:px-3.5 lg:text-base ${
                        active
                          ? "bg-(--bg) text-(--ink) lg:bg-(--mustard) lg:shadow-[inset_0_-2px_0_rgba(43,34,23,.25)]"
                          : "text-(--bg) hover:bg-(--bg)/10"
                      }`}
                    >
                      <Icon className="hidden size-5 shrink-0 lg:block" aria-hidden />
                      <span className="truncate">{label[lang]}</span>
                      {badge && (
                        <span
                          className={`grid h-6 min-w-6 shrink-0 place-items-center rounded-full px-1.5 text-sm font-bold leading-none tabular-nums lg:ml-auto ${
                            active && href === "/demos/shop-admin/orders" ? "bg-(--ink) text-(--mustard)" : badge.tone
                          }`}
                        >
                          <span aria-hidden>{badge.n}</span>
                          <span className="sr-only"> ({badge.label})</span>
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </aside>

      <main className="min-w-0 px-4 pb-28 pt-5 sm:px-6 lg:px-10 lg:pt-8">
        <div className="mx-auto w-full max-w-[1120px]">{children}</div>
      </main>
    </div>
  );
}

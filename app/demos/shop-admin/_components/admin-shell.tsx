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
import { byCount, ui } from "./copy";
import { LANG_SWITCH_CLASS } from "./shop-css";

const NAV = [
  { href: "/demos/shop-admin", label: ui.navOverview, icon: LayoutDashboard },
  { href: "/demos/shop-admin/orders", label: ui.navOrders, icon: ReceiptText },
  { href: "/demos/shop-admin/stock", label: ui.navStock, icon: Package },
] as const;

// Client wrapper: the stores hold functions, so they cannot be passed from a server layout.
export function AdminFrame({ children }: { children: React.ReactNode }) {
  return (
    <RequireSession store={shopSession} loginPath="/demos/shop-admin/login">
      <AdminShell>{children}</AdminShell>
    </RequireSession>
  );
}

/** The slim strip across the top: who you're signed in as, and the only way out. */
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
      className="flex items-center justify-between gap-3 border-b border-[#c5e3d4] bg-(--brand-soft) px-4 py-0.5 text-base leading-[1.4] text-(--brand-ink) lg:col-span-2 lg:px-6"
    >
      <p className="flex min-w-0 items-center gap-2 font-medium">
        <Eye className="hidden size-4 shrink-0 sm:block" aria-hidden />
        <span>{ui.demoBanner[lang]}</span>
      </p>
      <button
        type="button"
        onClick={logout}
        className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-lg px-2 text-base font-medium transition-colors hover:bg-white/70 sm:px-2.5"
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
      ? { n: packCount, label: fill(byCount(packCount, ui.badgeOrdersOne, ui.badgeOrders)[lang], { n: String(packCount) }), tone: "bg-(--ink) text-white" }
      : undefined,
    "/demos/shop-admin/stock": lowCount
      ? { n: lowCount, label: fill(byCount(lowCount, ui.badgeStockOne, ui.badgeStock)[lang], { n: String(lowCount) }), tone: "bg-(--warn) text-white" }
      : undefined,
  };

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[256px_minmax(0,1fr)] lg:grid-rows-[auto_1fr]">
      <DemoSessionBanner />

      <aside className="sticky top-0 z-30 border-b border-(--line) bg-(--panel)/95 backdrop-blur lg:static lg:border-b-0 lg:border-r lg:bg-(--panel) lg:backdrop-blur-none">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:items-stretch">
          <Link href="/demos/shop-admin" className="flex min-w-0 items-center gap-2.5 px-4 py-2.5 lg:px-5 lg:pb-6 lg:pt-6">
            <BrandMark className="size-8 text-[15px] lg:size-10 lg:text-lg" />
            <span className="min-w-0 leading-[1.25]">
              <span className="block truncate text-base font-semibold lg:text-lg">{ui.brand[lang]}</span>
              <span className="hidden text-sm text-(--muted) lg:block">{ui.backOffice[lang]}</span>
            </span>
          </Link>

          <div className="flex items-center gap-1 pr-3 lg:order-3 lg:mt-auto lg:flex-col lg:items-stretch lg:gap-2 lg:border-t lg:border-(--line) lg:px-3 lg:pb-24 lg:pt-3">
            <div className="hidden items-center gap-3 rounded-lg px-2 py-2 lg:flex">
              <span aria-hidden className="grid size-9 place-items-center rounded-full bg-(--brand-soft) text-(--brand-ink)">
                <UserRound className="size-[18px]" />
              </span>
              <span className="min-w-0 leading-[1.3]">
                <span className="block font-medium">{ui.ownerName[lang]}</span>
                <span className="block truncate text-sm text-(--muted)">{ui.ownerRole[lang]}</span>
              </span>
            </div>
            <div className="flex items-center gap-1 lg:justify-between">
              <ResetDemoButton
                stores={[shopData]}
                label={ui.resetData[lang]}
                className="min-h-10 rounded-lg px-2.5 text-base! text-(--muted) transition-colors hover:bg-(--bg) hover:text-(--ink)"
              />
              <DemoLangSwitch className={LANG_SWITCH_CLASS} />
            </div>
          </div>

          <nav
            aria-label={ui.mainNav[lang]}
            className="col-span-2 border-t border-(--line) px-2 py-1.5 lg:order-2 lg:flex-1 lg:border-t-0 lg:px-3 lg:py-0"
          >
            <ul className="flex gap-1 lg:flex-col">
              {NAV.map(({ href, label, icon: Icon }) => {
                const active = pathname === href;
                const badge = badges[href];
                return (
                  <li key={href} className="min-w-0 flex-auto lg:flex-none">
                    <Link
                      href={href}
                      aria-current={active ? "page" : undefined}
                      className={`flex min-h-10 items-center justify-center gap-1.5 rounded-lg px-1.5 text-base font-medium leading-[1.25] transition-colors lg:min-h-11 lg:justify-start lg:gap-3 lg:px-3 ${
                        active ? "bg-(--brand-soft) text-(--brand-ink)" : "text-(--muted) hover:bg-(--bg) hover:text-(--ink)"
                      }`}
                    >
                      <Icon className="hidden size-[18px] shrink-0 lg:block" aria-hidden />
                      <span className="truncate">{label[lang]}</span>
                      {badge && (
                        <span
                          className={`grid h-6 min-w-6 shrink-0 place-items-center rounded-full px-1.5 text-sm font-semibold leading-none tabular-nums lg:ml-auto ${badge.tone}`}
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
        <div className="mx-auto w-full max-w-[1180px]">{children}</div>
      </main>
    </div>
  );
}

"use client";

import { LayoutDashboard, LogOut, Package, ReceiptText } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { RequireSession } from "@/components/demo/require-session";
import { ResetDemoButton } from "@/components/demo/reset-demo-button";
import { isLowStock } from "@/lib/demos/shop-admin/data";
import { shopData, shopSession } from "@/lib/demos/shop-admin/store";
import { useDemoStore } from "@/lib/use-demo-store";
import { BrandMark } from "./brand-mark";

const NAV = [
  { href: "/demos/shop-admin", label: "ภาพรวม", icon: LayoutDashboard },
  { href: "/demos/shop-admin/orders", label: "คำสั่งซื้อ", icon: ReceiptText },
  { href: "/demos/shop-admin/stock", label: "สต็อกสินค้า", icon: Package },
] as const;

// Client wrapper: the stores hold functions, so they cannot be passed from a server layout.
export function AdminFrame({ children }: { children: React.ReactNode }) {
  return (
    <RequireSession store={shopSession} loginPath="/demos/shop-admin/login">
      <AdminShell>{children}</AdminShell>
    </RequireSession>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [data] = useDemoStore(shopData);

  const pending = data.orders.filter((o) => o.status === "paid" || o.status === "packed").length;
  const lowStock = data.products.filter(isLowStock).length;
  const badges: Record<string, { n: number; label: string; tone: string } | undefined> = {
    "/demos/shop-admin/orders": pending
      ? { n: pending, label: `รอแพ็กหรือรอส่ง ${pending} รายการ`, tone: "bg-(--ink) text-white" }
      : undefined,
    "/demos/shop-admin/stock": lowStock
      ? { n: lowStock, label: `ใกล้หมด ${lowStock} รายการ`, tone: "bg-(--warn) text-white" }
      : undefined,
  };

  function logout() {
    shopSession.set(false);
    router.push("/demos/shop-admin/login");
  }

  return (
    <div className="lg:pl-64">
      <aside className="sticky top-0 z-30 grid grid-cols-[1fr_auto] items-center border-b border-(--line) bg-(--panel)/95 backdrop-blur lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-64 lg:flex-col lg:items-stretch lg:border-b-0 lg:border-r lg:bg-(--panel)">
        <Link
          href="/demos/shop-admin"
          className="order-1 flex min-w-0 items-center gap-2.5 px-4 py-2.5 lg:px-5 lg:pb-6 lg:pt-6"
        >
          <BrandMark className="size-8 text-[15px] lg:size-10 lg:text-lg" />
          <span className="min-w-0 leading-[1.25]">
            <span className="block truncate font-semibold lg:text-lg">ร้านดี</span>
            <span className="hidden text-xs text-(--muted) lg:block">ระบบหลังร้าน สาขานิมมาน</span>
          </span>
        </Link>

        <nav aria-label="เมนูหลัก" className="order-3 col-span-2 border-t border-(--line) lg:order-2 lg:flex-1 lg:border-t-0 lg:px-3">
          <ul className="flex lg:flex-col lg:gap-1">
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              const badge = badges[href];
              return (
                <li key={href} className="flex-1 lg:flex-none">
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={`relative flex items-center justify-center gap-1.5 px-2 py-2.5 text-sm font-medium transition-colors lg:justify-start lg:gap-3 lg:rounded-lg lg:px-3 lg:text-[15px] ${
                      active
                        ? "text-(--brand-ink) after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-(--brand) lg:bg-(--brand-soft) lg:after:hidden"
                        : "text-(--muted) hover:text-(--ink) lg:hover:bg-(--bg)"
                    }`}
                  >
                    <Icon className="size-4 shrink-0 lg:size-[18px]" aria-hidden />
                    <span className="whitespace-nowrap">{label}</span>
                    {badge && (
                      <span
                        className={`grid h-[18px] min-w-[18px] place-items-center rounded-full px-1 text-[11px] font-semibold leading-none tabular-nums lg:ml-auto ${badge.tone}`}
                      >
                        <span aria-hidden>{badge.n}</span>
                        <span className="sr-only">({badge.label})</span>
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="order-2 flex items-center gap-1 pr-2 lg:order-3 lg:flex-col lg:items-stretch lg:gap-1 lg:border-t lg:border-(--line) lg:p-3">
          <div className="mb-2 hidden items-center gap-3 rounded-lg px-2 py-2 lg:flex">
            <span aria-hidden className="grid size-9 place-items-center rounded-full bg-[#f1e7d4] text-sm font-semibold text-[#6b4a12]">
              น
            </span>
            <span className="min-w-0 leading-[1.3]">
              <span className="block text-sm font-medium">คุณนิ่ม</span>
              <span className="block truncate text-xs text-(--muted)">เจ้าของร้าน</span>
            </span>
          </div>
          <ResetDemoButton
            stores={[shopData]}
            label="รีเซ็ตข้อมูล"
            className="rounded-lg px-2.5 py-2 text-(--muted) hover:bg-(--bg) hover:text-(--ink) lg:px-3"
          />
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-(--muted) hover:bg-(--bg) hover:text-(--ink) lg:px-3"
          >
            <LogOut className="size-4" aria-hidden />
            <span className="sr-only lg:not-sr-only">ออกจากระบบ</span>
          </button>
        </div>
      </aside>

      <main className="mx-auto w-full max-w-[1240px] px-4 pb-28 pt-5 sm:px-6 lg:px-10 lg:pt-8">{children}</main>
    </div>
  );
}

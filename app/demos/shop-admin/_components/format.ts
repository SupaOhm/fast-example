import { MessageCircle, ShoppingBag, Store } from "lucide-react";
import { parseISODate } from "@/lib/dates";
import type { ShopOrder, ShopOrderStatus } from "@/lib/demos/shop-admin/data";

// th-TH uses the Buddhist calendar by default, which is what Thai shop owners read.
const shortDate = new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "short" });
const longDate = new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "short", year: "numeric" });
const weekdayDate = new Intl.DateTimeFormat("th-TH", { weekday: "short", day: "numeric", month: "short" });

export const thShort = (iso: string) => shortDate.format(parseISODate(iso));
export const thWeekday = (iso: string) => weekdayDate.format(parseISODate(iso));
export const thLong = (d: Date) => longDate.format(d);

export const dayMonth = (iso: string) => {
  const d = parseISODate(iso);
  return `${d.getDate()}/${d.getMonth() + 1}`;
};

export const STATUS_LABEL: Record<ShopOrderStatus, string> = {
  paid: "ชำระแล้ว",
  packing: "กำลังแพ็ก",
  shipped: "จัดส่งแล้ว",
  cancelled: "ยกเลิก",
};

export const STATUS_STYLE: Record<ShopOrderStatus, string> = {
  paid: "bg-[#e8effd] text-[#1d4ed8] border-[#c9d8fb]",
  packing: "bg-[#fdf3dc] text-[#8a3c0b] border-[#f3dfae]",
  shipped: "bg-(--brand-soft) text-(--brand-ink) border-[#c5e3d4]",
  cancelled: "bg-[#eef1ef] text-(--muted) border-(--line)",
};

export const itemCount = (o: ShopOrder) => o.items.reduce((s, i) => s + i.qty, 0);

export const CHANNEL_ICON: Record<ShopOrder["channel"], typeof Store> = {
  LINE: MessageCircle,
  Shopee: ShoppingBag,
  หน้าร้าน: Store,
};

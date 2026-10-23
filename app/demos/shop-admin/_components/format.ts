import { MessageCircle, ShoppingBag, Store } from "lucide-react";
import { parseISODate } from "@/lib/dates";
import { formatDate } from "@/lib/demos/format";
import type { Lang } from "@/lib/demos/lang";
import type { ShopChannel, ShopOrder } from "@/lib/demos/shop-admin/data";

export const shortDate = (iso: string, lang: Lang) => formatDate(iso, lang, "dayMonth");
export const weekdayDate = (iso: string, lang: Lang) => formatDate(iso, lang, "weekdayDayMonth");
export const fullDate = (date: Date, lang: Lang) => formatDate(date, lang, "full");

/** Chart ticks: "19/10" reads the same in both languages. */
export const dayMonth = (iso: string) => {
  const d = parseISODate(iso);
  return `${d.getDate()}/${d.getMonth() + 1}`;
};

export const itemCount = (o: ShopOrder) => o.items.reduce((s, i) => s + i.qty, 0);

export const CHANNEL_ICON: Record<ShopChannel, typeof Store> = {
  line: MessageCircle,
  shopee: ShoppingBag,
  store: Store,
};

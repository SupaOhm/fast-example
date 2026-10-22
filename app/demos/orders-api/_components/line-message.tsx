"use client";

import { Store } from "lucide-react";
import { useLang } from "@/components/demo/lang";
import { fill, formatTHB } from "@/lib/demos/format";
import type { Lang, L } from "@/lib/demos/lang";
import type { LineNotification, OrderStatus } from "@/lib/demos/orders-api/api";
import { ui } from "./copy";

export const STATUS_WORD: Record<OrderStatus, L> = {
  pending: ui.statusPending,
  paid: ui.statusPaid,
  shipped: ui.statusShipped,
  cancelled: ui.statusCancelled,
};

/** The title and two lines the shop reads in LINE, in the given language. */
export function lineText(n: LineNotification, lang: Lang): { title: string; lines: [string, string] } {
  const who = `${n.orderId} · ${n.customer}`;
  return n.kind === "new"
    ? {
        title: ui.lineNewTitle[lang],
        lines: [who, fill(ui.lineNewBody[lang], { items: String(n.itemCount), total: formatTHB(n.total) })],
      }
    : {
        title: ui.lineStatusTitle[lang],
        lines: [who, fill(ui.lineStatusBody[lang], { from: STATUS_WORD[n.from][lang], to: STATUS_WORD[n.to][lang] })],
      };
}

/** The message card itself, as LINE shows a bot's flex message. */
export function LineBubble({ n, className = "" }: { n: LineNotification; className?: string }) {
  const lang = useLang();
  const { title, lines } = lineText(n, lang);
  return (
    <div className={`overflow-hidden rounded-[18px] rounded-tl-[6px] bg-white text-[#111] shadow-[0_1px_2px_rgba(16,24,20,0.12)] ${className}`}>
      <div className="border-t-4 border-(--line-green) px-3.5 pt-2.5 pb-3">
        <p className="text-[15px] leading-[1.35] font-semibold">{title}</p>
        <p className="mt-1 text-sm leading-[1.45] break-words">{lines[0]}</p>
        <p className="text-sm leading-[1.45] break-words text-[#3d4a42]">{lines[1]}</p>
      </div>
      <p className="border-t border-black/10 py-2 text-center text-sm leading-[1.3] font-semibold text-(--line-green-ink)" aria-hidden>
        {ui.lineViewOrder[lang]}
      </p>
    </div>
  );
}

/** One message in a chat: the bot's avatar, the card and the time it arrived. */
export function LineChatMessage({
  n,
  time,
  className = "",
  style,
}: {
  n: LineNotification;
  time: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <li className={`flex items-end gap-2 ${className}`} style={style}>
      <span className="mb-0.5 grid size-7 shrink-0 place-items-center self-start rounded-full bg-(--line-green) text-white" aria-hidden>
        <Store className="size-3.5" />
      </span>
      <LineBubble n={n} className="w-[200px] min-w-0" />
      <time className="mb-0.5 shrink-0 text-xs text-[#1f2d3d]">{time}</time>
    </li>
  );
}

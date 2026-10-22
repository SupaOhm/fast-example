"use client";

import { ChevronLeft, Menu, Plus, Smile, Store } from "lucide-react";
import { useLang } from "@/components/demo/lang";
import type { LineNotification } from "@/lib/demos/orders-api/api";
import { ui } from "./copy";
import { LineChatMessage } from "./line-message";

export interface ConsoleMessage {
  id: number;
  n: LineNotification;
  time: string;
}

/** A phone open on the shop's LINE chat with its bot. Messages sit at the bottom; older ones scroll off the top. */
export function PhoneFrame({
  children,
  className = "",
  screenClassName = "h-[540px]",
  statusTime = "",
  ...rest
}: {
  children: React.ReactNode;
  className?: string;
  screenClassName?: string;
  /** The clock in the status bar: the time of the newest message. */
  statusTime?: string;
} & Omit<React.HTMLAttributes<HTMLDivElement>, "className" | "children">) {
  const lang = useLang();
  return (
    <div className={`mx-auto w-full max-w-[300px] rounded-[40px] bg-[#1d2622] p-[9px] shadow-[0_24px_60px_-28px_rgba(21,32,26,0.45)] ${className}`}>
      <div className={`flex flex-col overflow-hidden rounded-[31px] bg-[#9bb5da] text-[#111] ${screenClassName}`}>
        <div className="flex items-center justify-between bg-white px-5 pt-2.5 pb-1 text-xs font-semibold" aria-hidden>
          <span className="w-10">{statusTime}</span>
          <span className="h-[18px] w-[72px] rounded-full bg-[#1d2622]" />
          <span className="w-10 text-right">5G</span>
        </div>
        <div className="flex items-center gap-2.5 border-b border-black/10 bg-white px-3 py-2">
          <ChevronLeft className="size-5 shrink-0" aria-hidden />
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-(--line-green) text-white" aria-hidden>
            <Store className="size-4" />
          </span>
          <div className="min-w-0 flex-1 leading-[1.25]">
            <p className="truncate text-[15px] font-semibold">{ui.lineBotName[lang]}</p>
            <p className="truncate text-xs text-[#4f5b55]">{ui.lineOfficialAccount[lang]}</p>
          </div>
          <Menu className="size-5 shrink-0" aria-hidden />
        </div>
        <div
          {...rest}
          className="flex min-h-0 flex-1 flex-col justify-end gap-3 overflow-hidden px-3 py-3 [mask-image:linear-gradient(to_bottom,transparent,black_40px)]"
        >
          {children}
        </div>
        <div className="flex items-center gap-2 border-t border-black/10 bg-white px-3 py-2.5" aria-hidden>
          <Plus className="size-5 text-[#4f5b55]" />
          <span className="flex-1 rounded-full bg-[#f1f2f4] px-3 py-1 text-xs text-[#4f5b55]">Aa</span>
          <Smile className="size-5 text-[#4f5b55]" />
        </div>
      </div>
    </div>
  );
}

/** The console's phone: one earlier order, then whatever the visitor's own requests send. */
export function LinePreview({ messages }: { messages: ConsoleMessage[] }) {
  const lang = useLang();
  return (
    <PhoneFrame screenClassName="h-[500px] xl:h-[540px]" statusTime={messages.at(-1)?.time}>
      <ol role="log" aria-live="polite" aria-label={ui.lineLogLabel[lang]} data-testid="line-preview" className="flex flex-col gap-3">
        {messages.map((m) => (
          <LineChatMessage
            key={m.id}
            n={m.n}
            time={m.time}
            className="transition duration-500 ease-out starting:translate-y-3 starting:opacity-0 motion-reduce:transition-none"
          />
        ))}
      </ol>
    </PhoneFrame>
  );
}

"use client";

import { ArrowDown, MessageCircle, MonitorSmartphone, Server } from "lucide-react";
import { useLang } from "@/components/demo/lang";
import { fill } from "@/lib/demos/format";
import type { Lang, L } from "@/lib/demos/lang";
import type { HttpMethod, OrderStatus } from "@/lib/demos/orders-api/api";
import type { StoryEvent } from "@/lib/demos/orders-api/story";
import { ui } from "./copy";
import { METHOD_STYLE, statusLine, statusTone } from "./http";
import { LineBubble, STATUS_WORD } from "./line-message";
import { beat } from "./story-motion";
import { latest, useStory, useStoryControls, type Played } from "./story-player";

/** Events on screen: 4 across the desktop lanes, the latest 2 on phones, where each event stacks into a tall card. */
const SLOTS = 4;
const PHONE_SLOTS = 2;
/** Room for one stacked event on a phone, so a placeholder and a filled card are the same height. */
const PHONE_ROW = "min-h-[378px]";

const LANES: { label: L; Icon: typeof Server }[] = [
  { label: ui.laneShop, Icon: MonitorSmartphone },
  { label: ui.laneApi, Icon: Server },
  { label: ui.laneLine, Icon: MessageCircle },
];

// Shared by the lane backdrop and every row, so the cells sit inside their lanes.
const COLS = "md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)_minmax(0,1.05fr)] md:gap-x-12 lg:gap-x-16";

function shortPath(method: HttpMethod, path: string): string {
  return method === "PATCH" ? path.replace(/^\/orders/, "…") : path;
}

function requestSummary(e: StoryEvent, lang: Lang): string {
  const body = e.request.body as { customer?: string; items?: { name: string; qty: number }[]; status?: OrderStatus };
  if (e.request.method === "POST") {
    const items = (body.items ?? []).map((i) => `${i.name} × ${i.qty}`).join(", ");
    return fill(ui.laneNewOrder[lang], { customer: body.customer ?? "", items });
  }
  return body.status ? fill(ui.laneSetStatus[lang], { status: STATUS_WORD[body.status][lang] }) : "";
}

function savedId(e: StoryEvent): string {
  return e.response.notification?.orderId ?? "";
}

function savedStatus(e: StoryEvent): string {
  const data = (e.response.body as { data?: { status?: string } }).data;
  return data?.status ?? "";
}

/** The arrow from one lane into the next, drawn just before the next lane's cell appears. */
function Arrow({ className }: { className: string }) {
  return (
    <span aria-hidden className={`absolute top-[24px] left-[-56px] hidden w-[62px] md:block lg:left-[-72px] lg:w-[78px] ${className}`}>
      <svg viewBox="0 0 40 10" preserveAspectRatio="none" className="block h-2.5 w-full overflow-visible text-(--muted)">
        <line x1="0" y1="5" x2="36" y2="5" stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      </svg>
      <svg viewBox="0 0 8 10" className="absolute top-0 -right-0.5 h-2.5 w-2 text-(--muted)">
        <path d="M1 1l5 4-5 4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function DownArrow({ className }: { className: string }) {
  return (
    <span aria-hidden className={`flex justify-center py-1 text-(--muted) md:hidden ${className}`}>
      <ArrowDown className="size-4" />
    </span>
  );
}

function LaneTag({ lane }: { lane: number }) {
  const lang = useLang();
  const { label, Icon } = LANES[lane];
  return (
    <span className="mb-1 flex items-center gap-1.5 text-sm leading-[1.4] text-(--muted) md:sr-only">
      <Icon className="size-4" aria-hidden />
      {label[lang]}
    </span>
  );
}

function Row({ played, phone }: { played: Played; phone: boolean }) {
  const lang = useLang();
  const { event, fresh } = played;
  const { method, path } = event.request;
  const { status, notification } = event.response;
  return (
    <li className={`${phone ? PHONE_ROW : "max-md:hidden"} rounded-2xl border border-(--line) bg-(--panel) p-4 md:min-h-[150px] md:rounded-none md:border-0 md:bg-transparent md:p-0 md:py-2 ${COLS}`}>
      <div className={`min-w-0 md:mx-4 md:self-start md:rounded-xl md:border md:border-(--line) md:bg-(--panel) md:px-3.5 md:py-3 ${beat(fresh, 1)}`}>
        <LaneTag lane={0} />
        <p className="flex flex-wrap items-baseline gap-x-2 font-(family-name:--font-mono) text-sm leading-[1.5]">
          <span className={`font-bold ${METHOD_STYLE[method].text}`}>{method}</span>
          <span className="[overflow-wrap:anywhere]">{shortPath(method, path)}</span>
        </p>
        <p className="mt-1 text-base leading-[1.5]">{requestSummary(event, lang)}</p>
      </div>

      <DownArrow className={beat(fresh, 2, "drop")} />
      <div className="relative min-w-0 md:px-4">
        <Arrow className={beat(fresh, 2, "draw")} />
        <div className={`md:rounded-xl md:border md:border-(--line) md:bg-(--panel) md:px-3.5 md:py-3 ${beat(fresh, 2)}`}>
          <LaneTag lane={1} />
          <p className={`font-(family-name:--font-mono) text-sm leading-[1.5] font-bold ${statusTone(status)}`}>{statusLine(status)}</p>
          <p className="mt-1 text-base leading-[1.5]">
            {fill(ui.laneSaved[lang], { id: savedId(event) })}{" "}
            <span className="font-(family-name:--font-mono) text-sm text-(--muted)">{savedStatus(event)}</span>
          </p>
        </div>
      </div>

      <DownArrow className={beat(fresh, 3, "drop")} />
      <div className="relative min-w-0 md:px-4">
        <Arrow className={beat(fresh, 3, "draw")} />
        <div className={beat(fresh, 3)}>
          <LaneTag lane={2} />
          {notification ? <LineBubble n={notification} className="max-w-[260px] ring-1 ring-(--line)" /> : null}
        </div>
      </div>
    </li>
  );
}

/** How it works: each order crosses from the shop's site, through the API, into the shop's LINE. */
export function StoryLanes() {
  const lang = useLang();
  const frame = useStory();
  const { watch } = useStoryControls();
  const rows = latest(frame, SLOTS);
  const empty = SLOTS - rows.length;
  // Of the placeholders, only enough to make up PHONE_SLOTS show on phones.
  const phoneEmpty = Math.max(0, PHONE_SLOTS - rows.length);

  return (
    <section ref={watch} id="how" data-testid="story-lanes" aria-labelledby="lanes-heading" className="scroll-mt-6 py-10 sm:py-14 lg:py-20">
      <h2 id="lanes-heading" className="display-heading text-[1.75rem] leading-[1.2] font-semibold tracking-[-0.01em] sm:text-[2rem]">
        {ui.lanesHeading[lang]}
      </h2>
      <p className="mt-3 max-w-[40rem] text-[17px] leading-[1.6] text-(--muted)">{ui.lanesSub[lang]}</p>

      <div className="relative mt-8">
        {/* The three lanes, drawn behind the rows. */}
        <div aria-hidden className={`pointer-events-none absolute inset-0 hidden ${COLS}`}>
          {LANES.map(({ label }) => (
            <div key={label.en} className="rounded-[20px] bg-(--panel-2)" />
          ))}
        </div>

        <div aria-hidden className={`relative hidden ${COLS}`}>
          {LANES.map(({ label, Icon }) => (
            <p key={label.en} className="flex items-center gap-2 px-5 pt-4 pb-2 text-base leading-[1.4] font-semibold">
              <span className="grid size-7 place-items-center rounded-full bg-(--panel)">
                <Icon className="size-4" />
              </span>
              {label[lang]}
            </p>
          ))}
        </div>

        <ol className="relative flex flex-col gap-4 md:gap-0 md:py-3">
          {rows.map((played, i) => (
            <Row key={played.key} played={played} phone={i >= rows.length - PHONE_SLOTS} />
          ))}
          {Array.from({ length: empty }, (_, i) => (
            <li
              key={`empty-${i}`}
              aria-hidden
              className={`${i < phoneEmpty ? PHONE_ROW : "max-md:hidden"} rounded-2xl border border-dashed border-(--line) md:min-h-[150px] md:border-0`}
            />
          ))}
        </ol>
      </div>
    </section>
  );
}

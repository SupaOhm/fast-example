"use client";

import { useLang } from "@/components/demo/lang";
import type { HttpMethod } from "@/lib/demos/orders-api/api";
import { ui } from "./copy";
import { beat } from "./story-motion";
import { latest, useStory } from "./story-player";

const ROWS = 6;

// The dark method colours: every one is 5.6:1 or better on --code-bg.
const METHOD_DARK: Record<HttpMethod, string> = {
  GET: "text-[#3fb950]",
  POST: "text-[#58a6ff]",
  PATCH: "text-[#d29922]",
};

const statusDark = (code: number) => (code < 300 ? "text-[#3fb950]" : code === 400 || code === 422 ? "text-[#d29922]" : "text-[#f85149]");

/** The developer's view of the same story: the API call behind each LINE message. */
export function DevLog({ className = "" }: { className?: string }) {
  const lang = useLang();
  const frame = useStory();
  const rows = latest(frame, ROWS);
  const last = rows.at(-1);

  return (
    <div
      data-testid="story-log"
      className={`flex min-w-0 flex-col rounded-[22px] bg-(--code-bg) p-4 text-(--code-text) sm:p-5 ${className}`}
    >
      <p className="text-[15px] leading-[1.4] font-semibold">{ui.devLogTitle[lang]}</p>
      <p className="mt-0.5 text-sm leading-[1.5] text-(--code-muted)">{ui.devLogHint[lang]}</p>

      <ol aria-label={ui.devLogTitle[lang]} className="mt-4 flex min-h-[calc(6*2.25rem+5*0.25rem)] flex-col gap-1 font-(family-name:--font-mono) text-sm">
        {rows.map(({ key, event, fresh }) => {
          const newest = event === last?.event;
          return (
            <li
              key={key}
              className={`grid grid-cols-[3.5rem_minmax(0,1fr)_auto] items-baseline gap-x-2 rounded-lg px-2.5 py-[0.4rem] leading-[1.5] transition-colors duration-500 ${
                newest ? "bg-white/[0.07]" : ""
              } ${beat(fresh, 1)}`}
            >
              <span className={`font-bold ${METHOD_DARK[event.request.method]}`}>{event.request.method}</span>
              <span className="[overflow-wrap:anywhere]">{event.request.path}</span>
              <span className={`font-bold ${statusDark(event.response.status)} ${beat(fresh, 2, "fade")}`}>{event.response.status}</span>
            </li>
          );
        })}
      </ol>

      <div className="mt-4 border-t border-white/10 pt-3 lg:mt-auto">
        <p className="text-sm leading-[1.5] text-(--code-muted)">{ui.requestBody[lang]}</p>
        <pre
          key={last?.key}
          className={`mt-1.5 min-h-[6rem] font-(family-name:--font-mono) text-sm leading-[1.6] whitespace-pre-wrap text-[#c9d1d9] [overflow-wrap:anywhere] ${last ? beat(last.fresh, 1, "fade") : ""}`}
        >
          {last ? JSON.stringify(last.event.request.body) : ""}
        </pre>
      </div>
    </div>
  );
}

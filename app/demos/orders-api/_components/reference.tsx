"use client";

import { useLang } from "@/components/demo/lang";
import { orderFieldNotes, statusHelp, ui } from "./copy";
import { STATUS_TEXT, statusTone } from "./http";

const ORDER_FIELDS: { name: string; type: string }[] = [
  { name: "id", type: "string" },
  { name: "customer", type: "string" },
  { name: "items", type: "OrderItem[]" },
  { name: "total", type: "number" },
  { name: "status", type: "OrderStatus" },
  { name: "createdAt", type: "string" },
];

const FLOW = ["pending", "paid", "shipped"];

const mono = "font-(family-name:--font-mono)";

export function Reference() {
  const lang = useLang();
  return (
    <section id="reference" aria-labelledby="reference-heading" className="scroll-mt-6 border-t border-(--line) py-14 lg:py-20">
      <h2 id="reference-heading" className="display-heading text-[1.75rem] leading-[1.2] font-semibold tracking-[-0.01em] sm:text-[2rem]">
        {ui.referenceHeading[lang]}
      </h2>
      <div className="mt-8 grid gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="min-w-0">
          <h3 className={`${mono} text-base font-semibold`}>{ui.orderObject[lang]}</h3>
          <p className="mt-1 text-[15px] leading-[1.6] text-(--muted)">{ui.orderObjectHint[lang]}</p>
          <dl className="mt-4 divide-y divide-(--line) border-y border-(--line)">
            {ORDER_FIELDS.map((f) => (
              <div key={f.name} className="grid gap-1 py-3 sm:grid-cols-[150px_minmax(0,1fr)] sm:gap-4">
                <dt className={`${mono} text-sm`}>
                  {f.name}
                  <span className="block text-sm text-(--muted)">{f.type}</span>
                </dt>
                <dd className="text-base leading-[1.6]">{orderFieldNotes[f.name][lang]}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-6 text-[15px] font-semibold">{ui.statusFlow[lang]}</p>
          <ol className={`mt-2 flex flex-wrap items-center gap-2 ${mono} text-sm`}>
            {FLOW.map((st, i) => (
              <li key={st} className="flex items-center gap-2">
                <span className="rounded-md border border-(--line) bg-(--panel) px-2 py-1">{st}</span>
                {i < FLOW.length - 1 ? (
                  <span className="text-(--muted)" aria-hidden>
                    ›
                  </span>
                ) : null}
              </li>
            ))}
          </ol>
          <p className="mt-3 text-[15px] leading-[1.6] text-(--muted)">
            {ui.cancelNotePre[lang]} <span className={`${mono} text-sm text-(--text)`}>cancelled</span> {ui.cancelNotePost[lang]}
          </p>
        </div>

        <div className="min-w-0">
          <h3 className="text-base font-semibold">{ui.statusCodesHeading[lang]}</h3>
          <p className="mt-1 text-[15px] leading-[1.6] text-(--muted)">{ui.statusCodesHint[lang]}</p>
          <dl className="mt-4 divide-y divide-(--line) border-y border-(--line)">
            {Object.entries(STATUS_TEXT).map(([code, text]) => (
              <div key={code} className="grid gap-1 py-3 sm:grid-cols-[210px_minmax(0,1fr)] sm:gap-4">
                <dt className={`${mono} text-sm font-bold ${statusTone(Number(code))}`}>
                  {code} <span className="font-normal text-(--text)">{text}</span>
                </dt>
                <dd className="text-base leading-[1.6]">{statusHelp[Number(code)][lang]}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

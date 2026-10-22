"use client";

import { useLang } from "@/components/demo/lang";
import { ui } from "./copy";

/** The heading above the console, with the connection details a developer looks for first. */
export function TryIntro() {
  const lang = useLang();
  return (
    <div className="mb-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-12">
      <div className="max-w-[44rem]">
        <h2 id="try-heading" className="display-heading text-[1.75rem] leading-[1.2] font-semibold tracking-[-0.01em] sm:text-[2rem]">
          {ui.tryIt[lang]}
        </h2>
        <p className="mt-3 text-[17px] leading-[1.6] text-(--muted)">{ui.endpointsHint[lang]}</p>
      </div>
      <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-5 gap-y-1.5 rounded-2xl border border-(--line) bg-(--panel) px-4 py-3 text-sm leading-[1.5]">
        <dt className="text-(--muted)">{ui.baseUrl[lang]}</dt>
        <dd className="font-(family-name:--font-mono) break-all">https://api.example.test</dd>
        <dt className="text-(--muted)">{ui.auth[lang]}</dt>
        <dd>{ui.authValue[lang]}</dd>
        <dt className="text-(--muted)">{ui.format[lang]}</dt>
        <dd>{ui.formatValue[lang]}</dd>
      </dl>
    </div>
  );
}

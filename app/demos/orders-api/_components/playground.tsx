"use client";

import { useState } from "react";
import { useLang } from "@/components/demo/lang";
import { ENDPOINTS, handleRequest } from "@/lib/demos/orders-api/api";
import { SEED_ORDERS } from "@/lib/demos/orders-api/seed";
import { ApiConsole } from "./api-console";
import { endpointCopy, ui } from "./copy";
import { METHOD_STYLE, MethodBadge } from "./http";

const DEFAULT_INDEX = ENDPOINTS.findIndex((e) => e.method === "POST");

// A fixed clock, so the examples render the same on the server and in every browser.
const EXAMPLE_NOW = new Date("2026-10-19T04:30:00.000Z");

/** Each endpoint's typical success response: its example request, run against a fresh copy of the seed orders. */
const EXAMPLES = ENDPOINTS.map(
  (ep) =>
    handleRequest(structuredClone(SEED_ORDERS), { method: ep.method, path: ep.example.path, body: ep.example.body }, EXAMPLE_NOW)
      .response,
);

const bodyFor = (i: number) => {
  const b = ENDPOINTS[i].example.body;
  return b === undefined ? "" : JSON.stringify(b, null, 2);
};

export function Playground() {
  const lang = useLang();
  const [selected, setSelected] = useState(DEFAULT_INDEX);
  const [path, setPath] = useState(ENDPOINTS[DEFAULT_INDEX].example.path);
  const [body, setBody] = useState(bodyFor(DEFAULT_INDEX));

  function select(i: number) {
    setSelected(i);
    setPath(ENDPOINTS[i].example.path);
    setBody(bodyFor(i));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-8">
      <nav aria-labelledby="endpoints-heading" className="min-w-0">
        <h3 id="endpoints-heading" className="mb-3 text-base leading-[1.4] font-semibold">
          {ui.endpointsHeading[lang]}
        </h3>
        <ul className="space-y-1.5">
          {ENDPOINTS.map((ep, i) => {
            const active = i === selected;
            const key = `${ep.method} ${ep.path}`;
            return (
              <li key={key}>
                <button
                  type="button"
                  data-testid={`endpoint-${ep.method}-${ep.path}`}
                  aria-pressed={active}
                  onClick={() => select(i)}
                  className={`w-full rounded-xl border px-3 py-2.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--text) ${
                    active
                      ? `border-(--line) bg-(--panel) shadow-[inset_3px_0_0_0] ${METHOD_STYLE[ep.method].text}`
                      : "border-transparent hover:bg-(--panel)"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <MethodBadge method={ep.method} />
                    <span className="min-w-0 truncate font-(family-name:--font-mono) text-sm text-(--text)">{ep.path}</span>
                  </span>
                  <span className="mt-1.5 block text-base leading-[1.45] text-(--text)">{endpointCopy[key][lang]}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <ApiConsole
        method={ENDPOINTS[selected].method}
        path={path}
        body={body}
        endpointKey={`${ENDPOINTS[selected].method} ${ENDPOINTS[selected].path}`}
        example={EXAMPLES[selected]}
        onPathChange={setPath}
        onBodyChange={setBody}
      />
    </div>
  );
}

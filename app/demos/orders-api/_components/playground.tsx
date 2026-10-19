"use client";

import { useState } from "react";
import { ENDPOINTS } from "@/lib/demos/orders-api/api";
import { ApiConsole } from "./api-console";
import { METHOD_STYLE, MethodBadge } from "./http";

const THAI_SUMMARY: Record<string, string> = {
  "GET /orders": "ดูรายการออเดอร์ทั้งหมด กรองตามสถานะได้",
  "GET /orders/:id": "ดูรายละเอียดออเดอร์ทีละรายการ",
  "POST /orders": "สร้างออเดอร์ใหม่ แล้วแจ้งร้านทาง LINE",
  "PATCH /orders/:id/status": "เปลี่ยนสถานะออเดอร์ แล้วแจ้งทาง LINE",
};

const DEFAULT_INDEX = ENDPOINTS.findIndex((e) => e.method === "POST");

const bodyFor = (i: number) => {
  const b = ENDPOINTS[i].example.body;
  return b === undefined ? "" : JSON.stringify(b, null, 2);
};

export function Playground() {
  const [selected, setSelected] = useState(DEFAULT_INDEX);
  const [path, setPath] = useState(ENDPOINTS[DEFAULT_INDEX].example.path);
  const [body, setBody] = useState(bodyFor(DEFAULT_INDEX));

  function select(i: number) {
    setSelected(i);
    setPath(ENDPOINTS[i].example.path);
    setBody(bodyFor(i));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-8">
      <nav aria-labelledby="endpoints-heading" className="min-w-0">
        <h2 id="endpoints-heading" className="mb-1 text-sm font-medium">
          Endpoints
        </h2>
        <p className="mb-3 text-xs leading-[1.5] text-(--muted)">เลือก endpoint แล้วกด Send เพื่อลองยิงคำขอ ทุกอย่างจำลองในเบราว์เซอร์</p>
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
                  className={`w-full rounded-lg border-l-2 px-3 py-2.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-(--muted) ${
                    active
                      ? `${METHOD_STYLE[ep.method].border} bg-(--panel-2)`
                      : "border-transparent hover:bg-(--panel)"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <MethodBadge method={ep.method} />
                    <span className="min-w-0 truncate font-(family-name:--font-mono) text-[13px] text-(--text)">{ep.path}</span>
                  </span>
                  <span className="mt-1.5 block text-sm leading-[1.45] text-(--text)">{THAI_SUMMARY[key]}</span>
                  <span className="mt-0.5 block text-xs leading-[1.45] text-(--muted)">{ep.summary}</span>
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
        onPathChange={setPath}
        onBodyChange={setBody}
      />
    </div>
  );
}

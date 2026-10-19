"use client";

import { Check, Copy, Loader2, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ResetDemoButton } from "@/components/demo/reset-demo-button";
import { ORDER_STATUSES, handleRequest, type HttpMethod } from "@/lib/demos/orders-api/api";
import { ordersStore } from "@/lib/demos/orders-api/store";
import { useDemoStore } from "@/lib/use-demo-store";
import { METHOD_STYLE, MethodBadge, statusLine, statusTone } from "./http";
import { LinePreview, LinePreviewEmpty, type LineMessage } from "./line-preview";

const BASE_URL = "https://api.example.test";

interface Shown {
  status: number;
  body: unknown;
  ms: number;
}

// Minimal JSON syntax colouring. The text content stays identical to the
// pretty-printed JSON, so it can be copied and asserted on.
const TOKEN = /("(?:\\.|[^"\\])*")(\s*:)?|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|\b(true|false|null)\b/g;

function highlight(json: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  let last = 0;
  let k = 0;
  for (const m of json.matchAll(TOKEN)) {
    const i = m.index ?? 0;
    if (i > last) out.push(json.slice(last, i));
    if (m[1] && m[2]) {
      out.push(<span key={k++} className="text-[#c9d1d9]">{m[1]}</span>, m[2]);
    } else if (m[1]) {
      out.push(<span key={k++} className="text-[#a5d6ff]">{m[1]}</span>);
    } else {
      out.push(<span key={k++} className="text-[#ffa657]">{m[0]}</span>);
    }
    last = i + m[0].length;
  }
  if (last < json.length) out.push(json.slice(last));
  return out;
}

function curlFor(method: HttpMethod, path: string, body: string): string {
  const parts = [`curl -X ${method} "${BASE_URL}${path.startsWith("/") ? path : `/${path}`}"`, `  -H "Authorization: Bearer $TOKEN"`];
  if (method !== "GET") {
    let data = body.trim();
    try {
      data = JSON.stringify(JSON.parse(data));
    } catch {
      // show what the user typed
    }
    parts.push(`  -H "Content-Type: application/json"`, `  -d '${data.replaceAll("'", "'\\''")}'`);
  }
  return parts.join(" \\\n");
}

export function ApiConsole({
  method,
  path,
  body,
  endpointKey,
  onPathChange,
  onBodyChange,
}: {
  method: HttpMethod;
  path: string;
  body: string;
  endpointKey: string;
  onPathChange: (path: string) => void;
  onBodyChange: (body: string) => void;
}) {
  const [orders] = useDemoStore(ordersStore);
  const [shown, setShown] = useState<Shown | null>(null);
  const [loading, setLoading] = useState(false);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [messages, setMessages] = useState<LineMessage[]>([]);
  const [copied, setCopied] = useState(false);
  const busy = useRef(false);
  const msgId = useRef(0);
  const requestId = useRef(0);
  const timers = useRef(new Set<number>());
  const s = METHOD_STYLE[method];
  const hasBody = method !== "GET";

  function later(fn: () => void, ms: number) {
    const t = window.setTimeout(() => {
      timers.current.delete(t);
      fn();
    }, ms);
    timers.current.add(t);
  }

  // Drops any in-flight request so its delayed callback can no longer apply.
  function invalidateRequest() {
    requestId.current++;
    busy.current = false;
    setLoading(false);
  }

  function clearResponse() {
    invalidateRequest();
    setShown(null);
    setJsonError(null);
  }

  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach((t) => window.clearTimeout(t));
      pending.clear();
    };
  }, []);

  // A different endpoint was selected: drop the shown response (LINE history stays).
  const lastEndpoint = useRef(endpointKey);
  useEffect(() => {
    if (lastEndpoint.current === endpointKey) return;
    lastEndpoint.current = endpointKey;
    clearResponse();
  });

  function send() {
    if (busy.current) return;
    let parsed: unknown = undefined;
    if (hasBody && body.trim()) {
      try {
        parsed = JSON.parse(body);
        setJsonError(null);
      } catch (e) {
        setJsonError(e instanceof Error ? e.message : "Invalid JSON");
        setShown({ status: 400, body: { error: "Invalid JSON body" }, ms: 0 });
        return;
      }
    } else {
      setJsonError(null);
    }

    // The mock server commits immediately (like a real one would); only the
    // response is delayed. A reset during the wait therefore wins cleanly.
    const now = new Date();
    const result = handleRequest(ordersStore.get(), { method, path, body: parsed }, now);
    ordersStore.set(result.orders);

    const token = ++requestId.current;
    busy.current = true;
    setLoading(true);
    const ms = Math.round(120 + Math.random() * 180);
    later(() => {
      if (token !== requestId.current) return;
      const { notification } = result.response;
      if (notification) {
        const time = new Intl.DateTimeFormat("th-TH", { hour: "2-digit", minute: "2-digit" }).format(now);
        const id = ++msgId.current;
        setMessages((prev) => [...prev, { id, ...notification, time }].slice(-3));
      }
      setShown({ status: result.response.status, body: result.response.body, ms });
      setLoading(false);
      busy.current = false;
    }, ms);
  }

  async function copyCurl() {
    try {
      await navigator.clipboard.writeText(curlFor(method, path, body));
      setCopied(true);
      later(() => setCopied(false), 1600);
    } catch {
      // clipboard unavailable; the snippet is still selectable
    }
  }

  return (
    <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_300px] xl:grid-rows-[auto_auto_auto_auto_1fr] xl:gap-x-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="min-w-0 overflow-hidden rounded-xl border border-(--line) bg-(--panel) xl:col-start-1"
      >
        <div className="flex flex-wrap items-center gap-2 border-b border-(--line) p-2.5 sm:flex-nowrap sm:p-3">
          <MethodBadge method={method} className="py-1.5" />
          <span className="min-w-0 truncate font-(family-name:--font-mono) text-xs text-(--muted) sm:hidden" aria-hidden>
            api.example.test
          </span>
          <label htmlFor="api-path" className="sr-only">
            Request path
          </label>
          <div className="order-last flex min-w-0 basis-full items-center rounded-lg border border-(--line) bg-(--bg) font-(family-name:--font-mono) text-[13px] focus-within:border-(--muted) sm:order-none sm:flex-1 sm:basis-auto">
            <span className="hidden shrink-0 pl-3 text-(--muted) md:inline">{BASE_URL}</span>
            <input
              id="api-path"
              data-testid="api-path"
              value={path}
              onChange={(e) => onPathChange(e.target.value)}
              spellCheck={false}
              autoComplete="off"
              className="min-w-0 flex-1 bg-transparent py-2 pr-3 pl-3 text-(--text) outline-none md:pl-0"
            />
          </div>
          <button
            type="submit"
            data-testid="api-send"
            disabled={loading}
            className={`ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-lg sm:ml-0 px-3.5 py-2 text-sm font-semibold text-(--bg) transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--text) disabled:opacity-70 ${s.bg}`}
          >
            {loading ? (
              <Loader2 className="size-4 motion-safe:animate-spin" aria-hidden />
            ) : (
              <Send className="size-4" aria-hidden />
            )}
            Send
          </button>
        </div>

        {hasBody ? (
          <div className="p-3 sm:p-4">
            <div className="mb-2 flex items-baseline justify-between gap-3">
              <label htmlFor="api-body" className="text-sm font-medium">
                Request body
              </label>
              <span className="text-xs text-(--muted)">⌘/Ctrl + Enter เพื่อส่ง</span>
            </div>
            <textarea
              id="api-body"
              data-testid="api-body"
              value={body}
              onChange={(e) => {
                setJsonError(null);
                onBodyChange(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  send();
                }
              }}
              spellCheck={false}
              rows={Math.min(11, Math.max(4, body.split("\n").length))}
              aria-invalid={jsonError ? true : undefined}
              aria-describedby={jsonError ? "api-body-error" : undefined}
              className={`block w-full resize-y rounded-lg border bg-(--bg) p-3 font-(family-name:--font-mono) text-[12.5px] leading-[1.55] text-(--text) outline-none focus:border-(--muted) ${jsonError ? "border-(--err)" : "border-(--line)"}`}
            />
            {jsonError ? (
              <p id="api-body-error" role="alert" className="mt-2 text-sm leading-[1.5] text-(--err)">
                JSON ไม่ถูกต้อง ตรวจวงเล็บปีกกาและเครื่องหมายคำพูดอีกครั้ง
              </p>
            ) : null}
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2 p-3 text-sm sm:p-4">
            <span className="text-(--muted)">GET ไม่มี body</span>
            {path.startsWith("/orders") && !/^\/orders\/./.test(path) ? (
              <>
                <span className="text-(--muted)">ลองกรองสถานะ:</span>
                {ORDER_STATUSES.map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => onPathChange(`/orders?status=${st}`)}
                    aria-pressed={path === `/orders?status=${st}`}
                    className="rounded-md border border-(--line) px-2 py-0.5 font-(family-name:--font-mono) text-xs text-(--text) hover:border-(--muted) aria-pressed:border-(--get) aria-pressed:text-(--get)"
                  >
                    {st}
                  </button>
                ))}
              </>
            ) : null}
          </div>
        )}
      </form>

      <section aria-label="Response" className="min-w-0 overflow-hidden xl:col-start-1 rounded-xl border border-(--line) bg-(--panel)">
        <div className="flex min-h-12 items-center gap-3 border-b border-(--line) px-4 py-2.5 text-sm">
          <span className="font-medium">Response</span>
          <div aria-live="polite" className="ml-auto flex items-center gap-3">
            {loading ? (
              <span className="inline-flex items-center gap-2 text-(--muted)">
                <Loader2 className="size-4 motion-safe:animate-spin" aria-hidden />
                กำลังส่งคำขอ
              </span>
            ) : shown ? (
              <>
                <span
                  data-testid="api-status"
                  className={`inline-flex items-center gap-1.5 font-(family-name:--font-mono) text-[13px] font-bold ${statusTone(shown.status)}`}
                >
                  <span className="size-2 rounded-full bg-current" aria-hidden />
                  {statusLine(shown.status)}
                </span>
                <span className="font-(family-name:--font-mono) text-xs text-(--muted)">
                  {shown.ms ? `${shown.ms} ms` : "ตรวจในเบราว์เซอร์"}
                </span>
              </>
            ) : null}
          </div>
        </div>
        {shown && !loading ? (
          <pre
            data-testid="api-response"
            tabIndex={0}
            className="max-h-[300px] overflow-auto p-4 xl:max-h-[360px] font-(family-name:--font-mono) text-[12.5px] leading-[1.6] text-(--muted) outline-none focus-visible:ring-2 focus-visible:ring-(--muted) focus-visible:ring-inset"
          >
            {highlight(JSON.stringify(shown.body, null, 2))}
          </pre>
        ) : (
          <p className="px-4 py-8 text-sm leading-[1.6] text-(--muted)">
            {loading ? "รอคำตอบจากเซิร์ฟเวอร์จำลอง…" : "กด Send เพื่อยิงคำขอ ผลลัพธ์จะแสดงที่นี่"}
          </p>
        )}
      </section>

      <aside
        aria-label="ตัวอย่างแจ้งเตือน LINE"
        className="min-w-0 py-2 xl:col-start-2 xl:row-span-5 xl:row-start-1 xl:py-0"
      >
        <p className="mx-auto mb-3 max-w-[300px] text-sm font-medium">แจ้งเตือนที่ร้านได้รับใน LINE</p>
        {messages.length ? <LinePreview messages={messages} /> : <LinePreviewEmpty />}
        <p className="mx-auto mt-3 max-w-[300px] text-xs leading-[1.5] text-(--muted)">
          ทุกออเดอร์ใหม่และทุกครั้งที่เปลี่ยนสถานะ ระบบส่งข้อความเข้า LINE ของร้านให้อัตโนมัติ
        </p>
      </aside>

      <section aria-label="curl" className="min-w-0 overflow-hidden xl:col-start-1 rounded-xl border border-(--line) bg-(--bg)">
        <div className="flex items-center justify-between border-b border-(--line) px-4 py-2 text-sm">
          <span className="font-medium">curl</span>
          <button
            type="button"
            onClick={copyCurl}
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-(--muted) hover:text-(--text) focus-visible:outline-2 focus-visible:outline-(--muted)"
          >
            {copied ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
            {copied ? "คัดลอกแล้ว" : "คัดลอก"}
          </button>
        </div>
        <pre
          tabIndex={0}
          className="overflow-x-auto p-4 font-(family-name:--font-mono) text-[12px] leading-[1.7] text-(--text) outline-none focus-visible:ring-2 focus-visible:ring-(--muted) focus-visible:ring-inset"
        >
          {curlFor(method, path, body)}
        </pre>
      </section>

      <div className="flex min-w-0 flex-wrap items-center justify-between gap-3 text-sm text-(--muted) xl:col-start-1">
        <p className="leading-[1.5]">
          ข้อมูลตัวอย่างตอนนี้มี <span className="font-semibold text-(--text)">{orders.length}</span> ออเดอร์
          เก็บไว้ในเบราว์เซอร์นี้เท่านั้น
        </p>
        <ResetDemoButton
          stores={[ordersStore]}
          onReset={() => {
            clearResponse();
            setMessages([]);
          }}
          className="rounded-lg border border-(--line) px-3 py-1.5 text-(--text) hover:border-(--muted)"
        />
      </div>
    </div>
  );
}

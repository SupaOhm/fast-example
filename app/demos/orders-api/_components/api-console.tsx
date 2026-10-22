"use client";

import { Check, Copy, Loader2, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLang } from "@/components/demo/lang";
import { ResetDemoButton } from "@/components/demo/reset-demo-button";
import {
  ORDER_STATUSES,
  handleRequest,
  type ApiResponse,
  type HttpMethod,
  type LineNotification,
} from "@/lib/demos/orders-api/api";
import { SEED_ORDERS } from "@/lib/demos/orders-api/seed";
import { ordersStore } from "@/lib/demos/orders-api/store";
import { useDemoStore } from "@/lib/use-demo-store";
import { ui } from "./copy";
import { METHOD_STYLE, MethodBadge, statusLine, statusTone } from "./http";
import { clock } from "./line-message";
import { LinePreview } from "./line-preview";

const BASE_URL = "https://api.example.test";

interface Shown {
  status: number;
  body: unknown;
  ms: number;
}

interface Sent {
  id: number;
  n: LineNotification;
  at: number;
}

// The newest seed order arrived before the visitor did, so the shop's chat already has its alert.
const latestSeed = SEED_ORDERS[0];
const EARLIER: Sent = {
  id: 0,
  n: {
    kind: "new",
    orderId: latestSeed.id,
    customer: latestSeed.customer,
    itemCount: latestSeed.items.reduce((sum, i) => sum + i.qty, 0),
    total: latestSeed.total,
  },
  at: Date.parse(latestSeed.createdAt),
};

// Minimal JSON syntax colouring for the dark code panels. The text content stays identical to the
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
      out.push(<span key={k++} className="text-[#e6edf3]">{m[1]}</span>, m[2]);
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

const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--text)";
const codeText = "font-(family-name:--font-mono) text-sm leading-[1.6]";

export function ApiConsole({
  method,
  path,
  body,
  endpointKey,
  example,
  onPathChange,
  onBodyChange,
}: {
  method: HttpMethod;
  path: string;
  body: string;
  endpointKey: string;
  /** The selected endpoint's typical success response, shown until the first send. */
  example: ApiResponse;
  onPathChange: (path: string) => void;
  onBodyChange: (body: string) => void;
}) {
  const lang = useLang();
  const [orders] = useDemoStore(ordersStore);
  const [shown, setShown] = useState<Shown | null>(null);
  const [loading, setLoading] = useState(false);
  const [jsonError, setJsonError] = useState(false);
  const [sent, setSent] = useState<Sent[]>([EARLIER]);
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
    setJsonError(false);
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
        setJsonError(false);
      } catch {
        setJsonError(true);
        setShown({ status: 400, body: { error: ui.invalidJsonBody[lang] }, ms: 0 });
        return;
      }
    } else {
      setJsonError(false);
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
        const id = ++msgId.current;
        setSent((prev) => [...prev, { id, n: notification, at: now.getTime() }].slice(-4));
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
    <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_300px] xl:grid-rows-[auto_auto_auto_auto_1fr] xl:gap-x-8">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="min-w-0 overflow-hidden rounded-2xl border border-(--line) bg-(--panel) xl:col-start-1"
      >
        <div className="flex flex-wrap items-center gap-2 border-b border-(--line) p-3 sm:flex-nowrap">
          <MethodBadge method={method} className="py-1.5" />
          <span className="min-w-0 truncate font-(family-name:--font-mono) text-sm text-(--muted) sm:hidden" aria-hidden>
            api.example.test
          </span>
          <label htmlFor="api-path" className="sr-only">
            {ui.requestPath[lang]}
          </label>
          <div className="order-last flex min-w-0 basis-full items-center rounded-lg border border-(--line) bg-(--bg) font-(family-name:--font-mono) text-sm focus-within:border-(--muted) focus-within:ring-2 focus-within:ring-(--muted)/25 sm:order-none sm:flex-1 sm:basis-auto">
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
            className={`ml-auto inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-70 sm:ml-0 ${focusRing} ${s.bg}`}
          >
            {loading ? (
              <Loader2 className="size-4 motion-safe:animate-spin" aria-hidden />
            ) : (
              <Send className="size-4" aria-hidden />
            )}
            {ui.send[lang]}
          </button>
        </div>

        {hasBody ? (
          <div className="p-3 sm:p-4">
            <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <label htmlFor="api-body" className="text-sm font-semibold">
                {ui.requestBody[lang]}
              </label>
              <span className="text-sm text-(--muted)">{ui.sendShortcut[lang]}</span>
            </div>
            <textarea
              id="api-body"
              data-testid="api-body"
              value={body}
              onChange={(e) => {
                setJsonError(false);
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
              className={`block w-full resize-y rounded-xl border-2 bg-(--code-bg) p-3 ${codeText} text-(--code-text) caret-[#58a6ff] outline-none focus-visible:border-[#58a6ff] ${jsonError ? "border-(--err)" : "border-transparent"}`}
            />
            {jsonError ? (
              <p id="api-body-error" role="alert" className="mt-2 text-sm leading-[1.5] text-(--err)">
                {ui.jsonInvalid[lang]}
              </p>
            ) : null}
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2 p-3 text-sm sm:p-4">
            <span className="text-(--muted)">{ui.getNoBody[lang]}</span>
            {path.startsWith("/orders") && !/^\/orders\/./.test(path) ? (
              <>
                <span className="text-(--muted)">{ui.tryFilter[lang]}</span>
                {ORDER_STATUSES.map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => onPathChange(`/orders?status=${st}`)}
                    aria-pressed={path === `/orders?status=${st}`}
                    className={`rounded-md border border-(--line) px-2 py-0.5 font-(family-name:--font-mono) text-sm text-(--text) hover:border-(--muted) aria-pressed:border-(--get) aria-pressed:text-(--get) ${focusRing}`}
                  >
                    {st}
                  </button>
                ))}
              </>
            ) : null}
          </div>
        )}
      </form>

      <section aria-label={ui.response[lang]} className="min-w-0 overflow-hidden rounded-2xl border border-(--line) bg-(--panel) xl:col-start-1">
        <div className="flex min-h-12 flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2.5 text-sm">
          <span className="font-semibold">{ui.response[lang]}</span>
          <div aria-live="polite" className="ml-auto flex items-center gap-3">
            {loading ? (
              <span className="inline-flex items-center gap-2 text-(--muted)">
                <Loader2 className="size-4 motion-safe:animate-spin" aria-hidden />
                {ui.sending[lang]}
              </span>
            ) : shown ? (
              <>
                <span
                  data-testid="api-status"
                  className={`inline-flex items-center gap-1.5 font-(family-name:--font-mono) text-sm font-bold ${statusTone(shown.status)}`}
                >
                  <span className="size-2 rounded-full bg-current" aria-hidden />
                  {statusLine(shown.status)}
                </span>
                <span className="font-(family-name:--font-mono) text-sm text-(--muted)">
                  {shown.ms ? `${shown.ms} ms` : ui.checkedInBrowser[lang]}
                </span>
              </>
            ) : null}
          </div>
        </div>
        <div className="bg-(--code-bg) text-(--code-muted)">
          {loading ? (
            <p className="min-h-32 px-4 py-6 text-sm leading-[1.6]">{ui.waitingForServer[lang]}</p>
          ) : shown ? (
            <pre
              data-testid="api-response"
              tabIndex={0}
              className={`max-h-[320px] overflow-auto p-4 xl:max-h-[380px] ${codeText} outline-none focus-visible:ring-2 focus-visible:ring-[#58a6ff] focus-visible:ring-inset`}
            >
              {highlight(JSON.stringify(shown.body, null, 2))}
            </pre>
          ) : (
            <div data-testid="example-response">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-dashed border-white/15 px-4 py-3">
                <span className="rounded-md border border-white/20 px-2 py-0.5 text-sm text-(--code-text)">{ui.exampleResponse[lang]}</span>
                <span className="font-(family-name:--font-mono) text-sm">{statusLine(example.status)}</span>
                <span className="text-sm leading-[1.5] sm:ml-auto">{ui.exampleResponseHint[lang]}</span>
              </div>
              <pre
                tabIndex={0}
                className={`max-h-[260px] overflow-auto p-4 xl:max-h-[300px] ${codeText} outline-none focus-visible:ring-2 focus-visible:ring-[#58a6ff] focus-visible:ring-inset`}
              >
                {highlight(JSON.stringify(example.body, null, 2))}
              </pre>
            </div>
          )}
        </div>
      </section>

      <aside aria-label={ui.lineAsideLabel[lang]} className="min-w-0 py-4 xl:col-start-2 xl:row-span-5 xl:row-start-1 xl:py-0">
        <p className="mx-auto mb-3 max-w-[300px] text-base leading-[1.4] font-semibold">{ui.lineAsideHeading[lang]}</p>
        <LinePreview messages={sent.map((m) => ({ id: m.id, n: m.n, time: clock[lang].format(m.at) }))} />
        <p className="mx-auto mt-3 max-w-[300px] text-sm leading-[1.55] text-(--muted)">{ui.lineAsideNote[lang]}</p>
      </aside>

      <section aria-label={ui.curl[lang]} className="min-w-0 overflow-hidden rounded-2xl bg-(--code-bg) text-(--code-text) xl:col-start-1">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-2 text-sm">
          <span className="font-(family-name:--font-mono) font-semibold">{ui.curl[lang]}</span>
          <button
            type="button"
            onClick={copyCurl}
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-(--code-muted) hover:text-(--code-text) focus-visible:outline-2 focus-visible:outline-[#58a6ff]"
          >
            {copied ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
            {copied ? ui.copied[lang] : ui.copy[lang]}
          </button>
        </div>
        <pre
          tabIndex={0}
          className={`overflow-x-auto p-4 ${codeText} outline-none focus-visible:ring-2 focus-visible:ring-[#58a6ff] focus-visible:ring-inset`}
        >
          {curlFor(method, path, body)}
        </pre>
      </section>

      <div className="flex min-w-0 flex-wrap items-center justify-between gap-3 text-sm text-(--muted) xl:col-start-1">
        <p className="leading-[1.5]">
          {ui.sampleDataPre[lang]} <span className="font-semibold text-(--text)">{orders.length}</span> {ui.sampleDataPost[lang]}
        </p>
        <ResetDemoButton
          stores={[ordersStore]}
          label={ui.resetDemo[lang]}
          onReset={() => {
            clearResponse();
            setSent([EARLIER]);
          }}
          className={`rounded-lg border border-(--line) bg-(--panel) px-3 py-1.5 text-(--text) hover:border-(--muted) ${focusRing}`}
        />
      </div>
    </div>
  );
}

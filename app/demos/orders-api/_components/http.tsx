import type { HttpMethod } from "@/lib/demos/orders-api/api";

export const STATUS_TEXT: Record<number, string> = {
  200: "OK",
  201: "Created",
  400: "Bad Request",
  404: "Not Found",
  405: "Method Not Allowed",
  409: "Conflict",
  422: "Unprocessable Entity",
};

export const statusLine = (code: number) => (STATUS_TEXT[code] ? `${code} ${STATUS_TEXT[code]}` : String(code));

// Literal class strings so Tailwind can see them. Method colours are text on white or --bg only, or a solid
// fill behind white text (all 4.5:1 or better).
export const METHOD_STYLE: Record<HttpMethod, { text: string; bg: string; border: string }> = {
  GET: { text: "text-(--get)", bg: "bg-(--get)", border: "border-(--get)" },
  POST: { text: "text-(--post)", bg: "bg-(--post)", border: "border-(--post)" },
  PATCH: { text: "text-(--patch)", bg: "bg-(--patch)", border: "border-(--patch)" },
};

export function statusTone(code: number): string {
  if (code < 300) return "text-(--get)";
  if (code === 400 || code === 422) return "text-(--patch)";
  return "text-(--err)";
}

export function MethodBadge({ method, className = "" }: { method: HttpMethod; className?: string }) {
  const s = METHOD_STYLE[method];
  return (
    <span
      className={`inline-flex w-[3.75rem] shrink-0 justify-center rounded-md py-0.5 font-(family-name:--font-mono) text-xs font-bold text-white ${s.bg} ${className}`}
    >
      {method}
    </span>
  );
}

import { ChevronLeft, Menu, Plus, Smile, Store } from "lucide-react";

export interface LineMessage {
  id: number;
  title: string;
  lines: string[];
  time: string;
}

function Phone({ children, testId }: { children: React.ReactNode; testId?: string }) {
  return (
    <div
      data-testid={testId}
      className="mx-auto w-full max-w-[300px] rounded-[38px] bg-[#05070a] p-[9px] shadow-[0_30px_80px_-30px_rgba(6,199,85,0.35)] ring-1 ring-(--line)"
    >
      <div className="flex h-[460px] flex-col xl:h-[520px] overflow-hidden rounded-[30px] bg-[#9db8dd] font-[system-ui,sans-serif] text-[#111]">
        <div className="flex items-center justify-between bg-white px-5 pt-2.5 pb-1 text-[11px] font-semibold" aria-hidden>
          <span>10:42</span>
          <span className="h-[18px] w-[76px] rounded-full bg-[#05070a]" />
          <span>5G</span>
        </div>
        <div className="flex items-center gap-2.5 border-b border-black/10 bg-white px-3 py-2.5">
          <ChevronLeft className="size-5 shrink-0" aria-hidden />
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-(--line-green) text-white">
            <Store className="size-4" aria-hidden />
          </span>
          <div className="min-w-0 flex-1 leading-[1.25]">
            <p className="truncate text-sm font-semibold">ร้านดี Bot</p>
            <p className="truncate text-[11px] text-[#555]">LINE Official Account</p>
          </div>
          <Menu className="size-5 shrink-0" aria-hidden />
        </div>
        <div className="flex min-h-0 flex-1 flex-col justify-end gap-3 overflow-hidden px-3 py-3">{children}</div>
        <div className="flex items-center gap-2 border-t border-black/10 bg-white px-3 py-2.5" aria-hidden>
          <Plus className="size-5 text-[#555]" />
          <span className="flex-1 rounded-full bg-[#f1f2f4] px-3 py-1.5 text-xs text-[#666]">Aa</span>
          <Smile className="size-5 text-[#555]" />
        </div>
      </div>
    </div>
  );
}

export function LinePreviewEmpty() {
  return (
    <Phone>
      <p className="mx-auto mb-auto mt-auto max-w-[200px] rounded-2xl bg-white/70 px-4 py-3 text-center text-xs leading-[1.5] text-[#1f2d3d]">
        ยังไม่มีข้อความ ลองส่ง POST /orders แล้วดูแจ้งเตือนที่ร้านได้รับตรงนี้
      </p>
    </Phone>
  );
}

export function LinePreview({ messages }: { messages: LineMessage[] }) {
  return (
    <Phone testId="line-preview">
      <p className="mx-auto mb-auto rounded-full bg-white/70 px-3 py-0.5 text-[11px] text-[#1f2d3d]">วันนี้</p>
      <ol role="log" aria-live="polite" aria-label="ข้อความ LINE จากร้านดี Bot" className="flex flex-col gap-3">
        {messages.map((m) => (
          <li
            key={m.id}
            className="flex items-end gap-2 transition duration-500 ease-out starting:translate-y-3 starting:opacity-0 motion-reduce:transition-none"
          >
            <span className="mb-5 grid size-7 shrink-0 place-items-center rounded-full bg-(--line-green) text-white">
              <Store className="size-3.5" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="mb-1 text-[11px] text-[#1f2d3d]">ร้านดี Bot</p>
              <div className="w-[184px] overflow-hidden rounded-2xl rounded-tl-md bg-white shadow-sm">
                <p className="bg-(--line-green) px-3 py-2 text-[13px] font-semibold leading-[1.3] text-[#03240f]">
                  {m.title}
                </p>
                <div className="space-y-0.5 px-3 py-2.5 text-[12.5px] leading-[1.45]">
                  {m.lines.map((line) => (
                    <p key={line} className="break-words">
                      {line}
                    </p>
                  ))}
                </div>
                <p className="border-t border-black/10 py-2 text-center text-xs font-semibold text-[#037a37]" aria-hidden>
                  ดูออเดอร์
                </p>
              </div>
            </div>
            <time className="mb-0.5 shrink-0 text-[10px] text-[#1f2d3d]">{m.time}</time>
          </li>
        ))}
      </ol>
    </Phone>
  );
}

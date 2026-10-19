import { Store } from "lucide-react";
import { STATUS_TEXT, statusTone } from "./_components/http";
import { Playground } from "./_components/playground";

const STATUS_HELP: Record<number, string> = {
  200: "สำเร็จ ได้ข้อมูลกลับมาตามที่ขอ",
  201: "สร้างออเดอร์ใหม่เรียบร้อย",
  400: "อ่าน JSON ที่ส่งมาไม่ได้",
  404: "ไม่พบออเดอร์หรือเส้นทางนี้",
  405: "เส้นทางนี้ไม่รองรับเมธอดที่ใช้",
  409: "ออเดอร์ที่ยกเลิกแล้วเปลี่ยนสถานะไม่ได้",
  422: "ข้อมูลไม่ครบหรือไม่ถูกต้อง มี details บอกว่าช่องไหนผิด",
};

const ORDER_FIELDS: { name: string; type: string; note: string }[] = [
  { name: "id", type: "string", note: "รหัสออเดอร์ ระบบออกให้อัตโนมัติ เช่น ORD-1009" },
  { name: "customer", type: "string", note: "ชื่อลูกค้า (บังคับ)" },
  { name: "items", type: "OrderItem[]", note: "รายการสินค้า แต่ละรายการมี sku, name, qty, price" },
  { name: "total", type: "number", note: "ยอดรวมเป็นบาท คำนวณจาก qty × price ให้เอง" },
  { name: "status", type: "OrderStatus", note: "pending, paid, shipped หรือ cancelled" },
  { name: "createdAt", type: "string", note: "เวลาที่สร้าง รูปแบบ ISO 8601" },
];

const FLOW = ["pending", "paid", "shipped"];

export default function OrdersApiPage() {
  return (
    <main className="pb-28">
      <header className="border-b border-(--line)">
        <div className="mx-auto flex max-w-[1320px] items-center gap-3 px-4 py-3 lg:px-8">
          <span className="grid size-8 place-items-center rounded-lg bg-(--line-green) text-[#03240f]">
            <Store className="size-4" aria-hidden />
          </span>
          <p className="text-[15px] font-semibold">
            ร้านดี <span className="font-normal text-(--muted)">Developers</span>
          </p>
          <nav aria-label="ในหน้านี้" className="ml-auto flex gap-1 text-sm">
            <a href="#try" className="rounded-md px-2.5 py-1.5 text-(--muted) hover:bg-(--panel) hover:text-(--text)">
              ลองใช้งาน
            </a>
            <a href="#reference" className="rounded-md px-2.5 py-1.5 text-(--muted) hover:bg-(--panel) hover:text-(--text)">
              อ้างอิง
            </a>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-[1320px] px-4 lg:px-8">
        <section aria-labelledby="intro" className="grid gap-6 py-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-12 lg:py-7">
          <div className="max-w-3xl">
            <h1 id="intro" className="text-[2.25rem] leading-[1.15] font-semibold tracking-tight sm:text-[2.75rem]">
              Orders API <span className="font-(family-name:--font-mono) text-[0.6em] font-medium text-(--muted)">v1</span>
            </h1>
            <p className="mt-3 text-[17px] leading-[1.6]">
              ระบบรับออเดอร์ของร้านออนไลน์ สร้าง ดู อัปเดตสถานะ และแจ้งเตือนเข้า LINE ของร้านทันที
            </p>
            <p className="mt-1 text-sm leading-[1.6] text-(--muted)">
              A small REST API for taking orders, tracking their status and notifying the shop on LINE.
            </p>
          </div>
          <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-5 gap-y-1.5 rounded-xl border border-(--line) bg-(--panel) px-4 py-3 text-sm">
            <dt className="text-(--muted)">Base URL</dt>
            <dd className="font-(family-name:--font-mono) text-[13px] break-all">https://api.example.test</dd>
            <dt className="text-(--muted)">Auth</dt>
            <dd>Bearer token (ไม่ต้องใช้ในเดโม)</dd>
            <dt className="text-(--muted)">Format</dt>
            <dd>JSON, UTF-8</dd>
          </dl>
        </section>

        <section id="try" aria-label="ลองใช้งาน API" className="scroll-mt-4">
          <Playground />
        </section>

        <section id="reference" aria-labelledby="reference-heading" className="mt-16 scroll-mt-4 border-t border-(--line) pt-10">
          <h2 id="reference-heading" className="text-2xl leading-[1.3] font-semibold">
            อ้างอิง
          </h2>
          <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:gap-12">
            <div className="min-w-0">
              <h3 className="font-(family-name:--font-mono) text-[15px] font-medium">Order</h3>
              <p className="mt-1 text-sm leading-[1.6] text-(--muted)">หน้าตาข้อมูลออเดอร์ที่ทุก endpoint ส่งกลับมา</p>
              <dl className="mt-4 divide-y divide-(--line) border-y border-(--line)">
                {ORDER_FIELDS.map((f) => (
                  <div key={f.name} className="grid gap-1 py-3 sm:grid-cols-[150px_minmax(0,1fr)] sm:gap-4">
                    <dt className="font-(family-name:--font-mono) text-[13px]">
                      {f.name}
                      <span className="block text-xs text-(--muted)">{f.type}</span>
                    </dt>
                    <dd className="text-sm leading-[1.6]">{f.note}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-5 text-sm font-medium">ลำดับสถานะ</p>
              <ol className="mt-2 flex flex-wrap items-center gap-2 font-(family-name:--font-mono) text-xs">
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
              <p className="mt-2 text-sm leading-[1.6] text-(--muted)">
                เปลี่ยนเป็น <span className="font-(family-name:--font-mono) text-(--text)">cancelled</span> ได้ทุกเมื่อ
                แต่เมื่อยกเลิกแล้วจะเปลี่ยนกลับไม่ได้ (409)
              </p>
            </div>

            <div className="min-w-0">
              <h3 className="text-[15px] font-medium">รหัสสถานะที่อาจได้รับ</h3>
              <p className="mt-1 text-sm leading-[1.6] text-(--muted)">ทุก error ส่งกลับเป็น JSON ที่มีช่อง error อธิบายเสมอ</p>
              <dl className="mt-4 divide-y divide-(--line) border-y border-(--line)">
                {Object.entries(STATUS_TEXT).map(([code, text]) => (
                  <div key={code} className="grid gap-1 py-3 sm:grid-cols-[210px_minmax(0,1fr)] sm:gap-4">
                    <dt className={`font-(family-name:--font-mono) text-[13px] font-medium ${statusTone(Number(code))}`}>
                      {code} <span className="font-normal text-(--text)">{text}</span>
                    </dt>
                    <dd className="text-sm leading-[1.6]">{STATUS_HELP[Number(code)]}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        <footer className="mt-14 text-xs leading-[1.6] text-(--muted)">
          ร้านดีเป็นร้านสมมติ ทุกคำขอในหน้านี้ทำงานในเบราว์เซอร์ของคุณ ไม่มีข้อมูลถูกส่งออกไปที่ใด
        </footer>
      </div>
    </main>
  );
}

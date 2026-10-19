import { MessageCircle, Truck } from "lucide-react";
import { formatTHB } from "@/lib/packages";
import { bundles, product } from "@/lib/demos/sale-page/content";
import { BottleGlyph } from "./marks";

export function OrderSection() {
  return (
    <section id="order" className="scroll-mt-16 bg-(--cream) px-5 py-20 sm:px-8 lg:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-3xl leading-[1.3] font-semibold sm:text-4xl">เลือกชุดที่เหมาะกับคุณ</h2>
          <p className="mt-3 leading-[1.7] font-light text-(--muted)">
            ราคาโปรโมชัน จากปกติขวดละ {formatTHB(product.fullPrice)}{" "}
            <span className="whitespace-nowrap">ยิ่งซื้อหลายขวด ยิ่งคุ้ม</span>
          </p>
        </div>

        <ul className="mt-12 grid items-center gap-9 md:grid-cols-3 md:gap-6">
          {bundles.map((b) => {
            const qty = Number.parseInt(b.label, 10);
            const perBottle = Math.round(b.price / qty);
            const hi = b.highlight;
            return (
              <li
                key={b.id}
                data-testid="bundle"
                className={`relative flex flex-col rounded-[28px] p-7 sm:p-8 ${
                  hi
                    ? "bg-(--leaf) text-(--cream) shadow-[0_30px_60px_-28px_rgba(63,91,58,0.8)] md:py-11"
                    : "border border-(--line) bg-white/60"
                }`}
              >
                {hi && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-(--gold-ink) px-4 py-1 text-sm leading-[1.4] font-semibold text-(--cream) shadow-md">
                    ขายดี
                  </span>
                )}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-2xl leading-[1.3] font-semibold">{b.label}</h3>
                    <p className={`mt-1 text-sm leading-[1.5] ${hi ? "text-(--leaf-soft)" : "text-(--gold-ink)"}`}>
                      {b.note}
                    </p>
                  </div>
                  <div className={`flex items-end gap-1 ${hi ? "text-(--leaf-soft)" : "text-(--leaf)"}`}>
                    {Array.from({ length: qty }, (_, k) => (
                      <BottleGlyph key={k} className="h-9 w-[18px]" />
                    ))}
                  </div>
                </div>

                <p className="mt-5 flex items-baseline gap-2 leading-[1.2] sm:mt-7">
                  <span className="text-5xl font-semibold">{formatTHB(b.price)}</span>
                  {qty > 1 && (
                    <span className={`text-sm ${hi ? "text-(--leaf-soft)" : "text-(--muted)"}`}>
                      ตกขวดละ {formatTHB(perBottle)}
                    </span>
                  )}
                </p>
                <p
                  className={`mt-2 flex items-center gap-1.5 text-sm leading-[1.5] ${hi ? "text-(--leaf-soft)" : "text-(--muted)"}`}
                >
                  <Truck className="size-4" aria-hidden />
                  จัดส่ง 1–3 วันทำการ
                </p>

                <a
                  href="#order"
                  className={`mt-6 inline-flex items-center justify-center gap-2 rounded-full sm:mt-8 px-5 py-3.5 text-base leading-[1.4] transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 ${
                    hi
                      ? "bg-(--cream) text-(--leaf) hover:bg-white focus-visible:outline-(--cream)"
                      : "bg-(--leaf) text-(--cream) hover:bg-(--ink) focus-visible:outline-(--leaf)"
                  }`}
                >
                  <MessageCircle className="size-[18px]" aria-hidden />
                  สั่งซื้อทาง LINE (ตัวอย่าง)
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

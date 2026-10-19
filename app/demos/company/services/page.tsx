import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { unsplash } from "@/lib/images";
import { processSteps, SERVICES } from "@/lib/demos/company/content";
import { CtaBand } from "../_components/cta-band";
import { PageHeader } from "../_components/page-header";

export const metadata: Metadata = {
  title: "บริการ",
  description: "งานกลึงและกัด CNC งานโครงสร้างและเชื่อม ระบบอัตโนมัติ และงานออกแบบเขียนแบบ ครบในโรงงานเดียว",
};

export default function ServicesPage() {
  return (
    <main>
      <PageHeader
        crumb="บริการ"
        title="บริการผลิตและวิศวกรรม"
        intro="รับงานตั้งแต่ชิ้นต้นแบบชิ้นเดียวไปจนถึงล็อตผลิตหลายพันชิ้น วิศวกรของเราดูแลตั้งแต่ตรวจแบบจนส่งมอบพร้อมรายงานการวัด"
      />

      <div className="mx-auto max-w-6xl px-5 py-16 lg:px-8 lg:py-24">
        <ul className="space-y-16 lg:space-y-24">
          {SERVICES.map((s, i) => (
            <li key={s.id} id={s.id} className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
              <div className={`relative aspect-[3/2] overflow-hidden rounded-[2px] bg-(--steel) ${i % 2 === 1 ? "lg:order-2" : ""}`}>
                <Image
                  src={unsplash(s.image, 1000)}
                  alt={s.name}
                  fill
                  sizes="(min-width: 1024px) 540px, 100vw"
                  className="object-cover"
                />
              </div>
              <div className="lg:max-w-md">
                <span className="block h-[3px] w-10 bg-(--orange)" aria-hidden />
                <h2 className="mt-5 text-[1.75rem] leading-[1.3] font-bold text-(--navy) sm:text-[2.1rem]">{s.name}</h2>
                <p className="mt-3 text-lg leading-[1.6] font-medium text-(--ink)">{s.short}</p>
                <p className="mt-3 text-base leading-[1.8] text-(--muted)">{s.detail}</p>
                <Link
                  href="/demos/company/contact"
                  className="mt-6 inline-block text-[15px] leading-[1.4] font-bold text-(--orange-ink) underline decoration-2 underline-offset-4 hover:text-(--navy)"
                >
                  ขอใบเสนอราคางานนี้
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <section className="border-t border-(--line) bg-(--steel)">
        <div className="mx-auto max-w-6xl px-5 py-16 lg:px-8 lg:py-20">
          <h2 className="text-[1.9rem] leading-[1.3] font-bold text-(--navy) sm:text-4xl">ขั้นตอนการสั่งผลิต</h2>
          <p className="mt-3 max-w-xl text-base leading-[1.75] text-(--muted) sm:text-lg">
            ชัดเจนทุกขั้น รู้ราคาและกำหนดส่งก่อนเริ่มงาน
          </p>
          <ol className="relative mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            <span aria-hidden className="absolute top-6 right-[12%] left-[12%] hidden h-px bg-(--navy)/25 lg:block" />
            {processSteps.map((step, i) => (
              <li key={step} className="relative flex gap-4 lg:block lg:text-center">
                <span className="grid size-12 shrink-0 place-items-center rounded-full border-2 border-(--navy) bg-white text-lg leading-none font-bold text-(--navy) tabular-nums lg:mx-auto">
                  {i + 1}
                </span>
                <p className="pt-2.5 text-base leading-[1.6] font-medium text-(--ink) lg:mt-4 lg:pt-0">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <CtaBand />
    </main>
  );
}

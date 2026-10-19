import Link from "next/link";
import { company } from "@/lib/demos/company/content";

export function CtaBand() {
  return (
    <section className="bg-(--orange) text-(--navy)">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-14 md:flex-row md:items-center md:justify-between lg:px-8 lg:py-16">
        <div className="max-w-2xl">
          <h2 className="text-[1.75rem] leading-[1.3] font-bold text-balance sm:text-[2.1rem]">
            มีแบบชิ้นงานอยู่แล้ว ส่งมาให้วิศวกรของเราประเมินราคา
          </h2>
          <p className="mt-3 text-base leading-[1.7] sm:text-lg">
            ส่งไฟล์ 2D/3D หรือรูปถ่ายชิ้นงานเดิม รับใบเสนอราคาภายใน 48 ชั่วโมง ไม่มีค่าใช้จ่าย
          </p>
        </div>
        <div className="shrink-0">
          <Link
            href="/demos/company/contact"
            className="inline-flex w-full items-center justify-center rounded-[3px] bg-(--navy) px-8 py-4 text-lg leading-[1.3] font-bold text-white transition-colors hover:bg-(--navy-2) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--navy) md:w-auto"
          >
            ขอใบเสนอราคา
          </Link>
          <p className="mt-3 text-center text-sm leading-[1.5] md:text-left">หรือโทร {company.phone}</p>
        </div>
      </div>
    </section>
  );
}

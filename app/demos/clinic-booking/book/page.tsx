import { ChevronLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { BookingFlow } from "../_components/booking-flow";

export const metadata: Metadata = { title: "จองคิวผ่าน LINE" };

const POINTS = [
  "แสดงเฉพาะผู้ดูแลที่ทำบริการนั้นได้",
  "ตัดเวลาที่มีคนจองแล้วและเวลาที่เลยไปแล้วออกให้อัตโนมัติ",
  "คิวใหม่เข้าไปอยู่ในระบบหลังร้านของคลินิกทันที",
];

export default function BookPage() {
  return (
    <main className="lg:grid lg:min-h-screen lg:grid-cols-[1fr_420px_1fr] lg:items-start lg:gap-14 lg:px-10 lg:pt-6 lg:pb-24">
      <aside className="hidden max-w-xs self-center justify-self-end lg:block">
        <Link
          href="/demos/clinic-booking"
          className="inline-flex items-center gap-1 text-[15px] text-(--rose-deep) underline-offset-4 hover:underline"
        >
          <ChevronLeft className="size-4" aria-hidden />
          กลับหน้าคลินิก
        </Link>
        <h1 className="mt-6 text-[2rem] leading-[1.3] font-normal">หน้าจอที่ลูกค้าเห็นในแชต LINE ของคลินิก</h1>
        <p className="mt-4 leading-[1.75] text-(--muted)">ลองจองคิวได้จริงในโทรศัพท์ข้าง ๆ ข้อมูลเก็บไว้ในเบราว์เซอร์ของคุณเท่านั้น</p>
        <ul className="mt-6 grid gap-3 text-[15px] leading-[1.6]">
          {POINTS.map((p) => (
            <li key={p} className="flex gap-3">
              <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-(--line-green)" />
              {p}
            </li>
          ))}
        </ul>
      </aside>
      <h1 className="sr-only lg:hidden">จองคิวผ่าน LINE ลูมิ คลินิก</h1>
      <BookingFlow />
    </main>
  );
}

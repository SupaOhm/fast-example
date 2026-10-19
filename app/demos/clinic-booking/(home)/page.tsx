import { CalendarCheck, Car, Clock, LockKeyhole, MapPin } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { buildClinicSeed, CLOSE, OPEN, STAFF } from "@/lib/demos/clinic-booking/data";
import { PHOTOS, unsplash } from "@/lib/images";
import { formatTHB } from "@/lib/packages";
import { LineGlyph } from "../_components/line-glyph";

export const metadata: Metadata = { title: "คลินิกดูแลผิว จองคิวผ่าน LINE" };

const services = buildClinicSeed(new Date()).services;
const serviceName = new Map(services.map((s) => [s.id, s.name]));

const STEPS = ["เลือกทรีตเมนต์", "เลือกแพทย์หรือนักบำบัด", "เลือกวันและเวลาที่ว่าง", "รับข้อความยืนยันใน LINE"];

const lineBtn =
  "inline-flex h-13 items-center justify-center gap-2.5 rounded-full bg-(--line-green) px-7 text-[17px] font-medium text-(--ink) shadow-[0_8px_24px_-10px_rgb(6_199_85/0.7)] transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-(--ink)";

export default function ClinicHome() {
  return (
    <main>
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-5 sm:px-6">
        <Link href="/demos/clinic-booking" className="flex items-center gap-2.5 text-lg font-medium leading-[1.2]">
          <span aria-hidden className="grid size-9 place-items-center rounded-full bg-(--rose-deep) text-[15px] text-white">
            L
          </span>
          ลูมิ คลินิก
        </Link>
        <nav aria-label="เมนูหลัก" className="flex items-center gap-1 text-[15px] text-(--muted)">
          <a href="#services" className="hidden rounded-full px-3 py-2 hover:text-(--ink) sm:block">
            ทรีตเมนต์
          </a>
          <a href="#team" className="hidden rounded-full px-3 py-2 hover:text-(--ink) sm:block">
            ทีมแพทย์
          </a>
          <a href="#clinic" className="hidden rounded-full px-3 py-2 hover:text-(--ink) sm:block">
            คลินิก
          </a>
          <Link
            href="/demos/clinic-booking/book"
            className="ml-2 inline-flex items-center gap-1.5 rounded-full border border-(--line-green-ink)/40 px-4 py-2 font-medium text-(--line-green-ink) hover:bg-white"
          >
            <LineGlyph className="size-4" />
            จองคิว
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pt-6 pb-16 sm:px-6 lg:grid-cols-12 lg:gap-8 lg:pt-10 lg:pb-24">
        <div className="lg:col-span-5">
          <p className="text-[15px] text-(--muted)">คลินิกดูแลผิว ซอยทองหล่อ กรุงเทพฯ</p>
          <h1 className="mt-3 text-[3.6rem] leading-[1.2] font-light text-(--rose-deep) sm:text-[5rem] lg:text-[5.6rem]">
            ลูมิ คลินิก
          </h1>
          <p className="mt-4 text-2xl leading-[1.45] sm:text-[1.75rem]">
            <span className="block">ผิวสวยแบบเข้าใจคุณ</span> <span className="block">จองคิวง่ายผ่าน LINE</span>
          </p>
          <p className="mt-4 max-w-md leading-[1.75] text-(--muted)">
            ปรึกษาแพทย์ผิวหนังฟรี เลือกผู้ดูแลและเวลาที่ว่างได้เองตลอด 24 ชั่วโมง ไม่ต้องโทร ไม่ต้องรอแอดมินตอบ
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
            <Link href="/demos/clinic-booking/book" data-testid="book-cta" className={lineBtn}>
              <LineGlyph className="size-5" />
              จองคิวผ่าน LINE
            </Link>
            <a href="#services" className="text-[15px] text-(--rose-deep) underline decoration-(--rose)/50 underline-offset-4 hover:decoration-(--rose-deep)">
              ดูราคาทรีตเมนต์
            </a>
          </div>
          <p className="mt-8 flex items-center gap-2 text-sm text-(--muted)">
            <Clock className="size-4" aria-hidden />
            เปิดทุกวัน {OPEN}–{CLOSE} น.
          </p>
        </div>

        <div className="relative lg:col-span-7">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] rounded-tl-[7rem] bg-(--blush-2) sm:rounded-tl-[9rem] lg:aspect-[6/5]">
            <Image
              src={unsplash(PHOTOS.clinicHero, 1400)}
              alt="ห้องทรีตเมนต์โทนชมพูอ่อน มีเตียงทรีตเมนต์และเครื่องมือดูแลผิว"
              fill
              preload
              sizes="(min-width: 1024px) 640px, 100vw"
              className="object-cover"
            />
          </div>
          {/* A LINE notification, the moment the customer gets after booking */}
          <div
            aria-hidden
            className="absolute -bottom-8 left-3 w-[min(19rem,calc(100%-1.5rem))] rounded-2xl bg-white/95 p-3.5 shadow-[0_18px_40px_-16px_rgb(43_34_38/0.45)] backdrop-blur sm:left-6 lg:-left-10 lg:bottom-10"
          >
            <div className="flex items-center gap-2 text-[13px] text-(--muted)">
              <span className="grid size-5 place-items-center rounded-[6px] bg-(--line-green)">
                <LineGlyph className="size-3.5 text-white" />
              </span>
              <span className="font-medium text-(--ink)">LINE</span>
              <span className="ml-auto">ตอนนี้</span>
            </div>
            <p className="mt-2 font-medium leading-[1.4]">Lumi Clinic</p>
            <p className="text-[15px] leading-[1.5] text-(--ink)/85">
              ยืนยันคิวแล้วค่ะ คุณแพร ทรีตเมนต์หน้าใสกับคุณมิว พรุ่งนี้ 13:00 น.
            </p>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="scroll-mt-6 bg-(--paper) py-16 lg:py-24">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 className="text-3xl leading-[1.3] font-normal sm:text-4xl">ทรีตเมนต์และราคา</h2>
            <p className="mt-4 max-w-sm leading-[1.75] text-(--muted)">
              ราคารวมผลิตภัณฑ์แล้ว ไม่มีค่าใช้จ่ายเพิ่มหน้าเคาน์เตอร์ ไม่แน่ใจว่าเหมาะกับอะไร เริ่มจากปรึกษาแพทย์ได้ฟรี
            </p>
          </div>
          <ul className="divide-y divide-(--line) border-y border-(--line) lg:col-span-8">
            {services.map((s) => (
              <li key={s.id} className="flex items-baseline gap-4 py-5">
                <div className="min-w-0">
                  <p className="text-lg leading-[1.4] sm:text-xl">{s.name}</p>
                  <p className="text-sm text-(--muted)">{s.durationMin} นาที</p>
                </div>
                <span aria-hidden className="mb-1.5 flex-1 border-b border-dotted border-(--rose)/60" />
                <p className="shrink-0 text-lg text-(--rose-deep) sm:text-xl">{s.price === 0 ? "ฟรี" : formatTHB(s.price)}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Team */}
      <section id="team" className="scroll-mt-6 py-16 lg:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-3xl leading-[1.3] font-normal sm:text-4xl">ทีมที่ดูแลผิวคุณ</h2>
          <p className="mt-4 max-w-lg leading-[1.75] text-(--muted)">
            ตอนจองคิว คุณเลือกได้เลยว่าอยากให้ใครดูแล ระบบจะแสดงเฉพาะเวลาที่คนนั้นว่างจริง
          </p>
          <ul className="mt-10 grid gap-8 sm:grid-cols-3 sm:gap-6">
            {STAFF.map((st) => (
              <li key={st.id} className="flex gap-4 sm:flex-col">
                <span
                  aria-hidden
                  className="grid size-16 shrink-0 place-items-center rounded-full bg-(--blush-2) text-3xl font-light text-(--rose-deep) sm:size-20 sm:text-4xl"
                >
                  {st.name.replace(/^(พญ\.|คุณ)\s*/, "").charAt(0)}
                </span>
                <div>
                  <p className="text-xl leading-[1.4]">{st.name}</p>
                  <p className="text-(--muted)">{st.role}</p>
                  <ul aria-label={`บริการที่${st.name}ดูแล`} className="mt-3 flex flex-wrap gap-1.5">
                    {st.serviceIds.map((id) => (
                      <li key={id} className="rounded-full border border-(--line) bg-(--paper) px-2.5 py-0.5 text-[13px] text-(--muted)">
                        {serviceName.get(id)}
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Clinic */}
      <section id="clinic" className="scroll-mt-6 bg-(--paper) py-16 lg:py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16">
          <div className="relative aspect-[3/2] overflow-hidden rounded-[2rem] rounded-br-[6rem]">
            <Image
              src={unsplash(PHOTOS.clinicInterior, 1200)}
              alt="ห้องทรีตเมนต์สีขาว มีเก้าอี้ทรีตเมนต์สองตัวและพื้นหินอ่อน"
              fill
              sizes="(min-width: 1024px) 560px, 100vw"
              className="object-cover"
            />
          </div>
          <div>
            <h2 className="text-3xl leading-[1.3] font-normal sm:text-4xl">มาถึงแล้วไม่ต้องรอ</h2>
            <p className="mt-4 max-w-md leading-[1.75] text-(--muted)">
              เราจองคิวแบบแยกตามผู้ดูแล ทุกคนจึงได้เวลาของตัวเองเต็ม ๆ ห้องทรีตเมนต์เป็นห้องส่วนตัว เงียบ และสะอาดทุกรอบ
            </p>
            <dl className="mt-8 grid gap-5">
              <div className="flex gap-3">
                <MapPin className="mt-1 size-5 shrink-0 text-(--rose-deep)" aria-hidden />
                <div>
                  <dt className="font-medium">ที่อยู่</dt>
                  <dd className="text-(--muted)">ซอยทองหล่อ 13 แขวงคลองตันเหนือ กรุงเทพฯ (ที่อยู่สมมติ)</dd>
                </div>
              </div>
              <div className="flex gap-3">
                <Clock className="mt-1 size-5 shrink-0 text-(--rose-deep)" aria-hidden />
                <div>
                  <dt className="font-medium">เวลาเปิด</dt>
                  <dd className="text-(--muted)">
                    ทุกวัน {OPEN}–{CLOSE} น. จองล่วงหน้าได้ 7 วัน
                  </dd>
                </div>
              </div>
              <div className="flex gap-3">
                <Car className="mt-1 size-5 shrink-0 text-(--rose-deep)" aria-hidden />
                <div>
                  <dt className="font-medium">ที่จอดรถ</dt>
                  <dd className="text-(--muted)">จอดฟรี 2 ชั่วโมงที่อาคารข้างคลินิก</dd>
                </div>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* How booking works */}
      <section className="bg-(--rose-deep) py-16 text-white lg:py-20">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-5">
            <h2 className="text-3xl leading-[1.3] font-normal sm:text-4xl">จองคิวใน LINE ไม่ถึงนาที</h2>
            <p className="mt-4 max-w-md leading-[1.75] text-white/85">
              แอดคลินิกเป็นเพื่อน แล้วจองได้ในแชตเลย ใกล้ถึงวันนัด เราจะส่งข้อความเตือนให้อัตโนมัติ
            </p>
          </div>
          <ol className="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:col-span-7">
            {STEPS.map((step, i) => (
              <li key={step} className="flex items-center gap-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-full border border-white/40 text-lg">
                  {i + 1}
                </span>
                <span className="text-lg leading-[1.4]">{step}</span>
              </li>
            ))}
          </ol>
          <div className="lg:col-span-12">
            <Link href="/demos/clinic-booking/book" className={lineBtn}>
              <CalendarCheck className="size-5" aria-hidden />
              เริ่มจองคิว
            </Link>
          </div>
        </div>
      </section>

      <footer className="mx-auto flex max-w-6xl flex-col gap-4 px-4 pt-10 pb-28 text-sm text-(--muted) sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>ลูมิ คลินิก เป็นคลินิกสมมติสำหรับเว็บตัวอย่าง ข้อมูลทั้งหมดไม่ใช่ของจริง</p>
        <Link
          href="/demos/clinic-booking/admin/login"
          prefetch={false}
          className="inline-flex items-center gap-2 self-start rounded-full border border-(--line) bg-(--paper) px-4 py-2 text-(--ink) hover:border-(--rose)"
        >
          <LockKeyhole className="size-4" aria-hidden />
          เข้าสู่ระบบฝั่งคลินิก
        </Link>
      </footer>
    </main>
  );
}

"use client";

import {
  BatteryFull,
  BellRing,
  CalendarCheck,
  Camera,
  Check,
  ChevronLeft,
  ImageIcon,
  Menu,
  Mic,
  Phone,
  Plus,
  RotateCcw,
  Search,
  ShieldCheck,
  Signal,
  Smile,
  Wifi,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { nextDays, parseISODate } from "@/lib/dates";
import {
  availableSlots,
  bookAppointment,
  fromMinutes,
  STAFF,
  toMinutes,
  type Booking,
  type ClinicData,
  type Service,
  type Staff,
} from "@/lib/demos/clinic-booking/data";
import { clinicData } from "@/lib/demos/clinic-booking/store";
import { PHOTOS, unsplash } from "@/lib/images";
import { formatTHB } from "@/lib/packages";
import { useDemoStore } from "@/lib/use-demo-store";

type Step = 1 | 2 | 3 | 4 | 5 | 6;

interface Picks {
  serviceId?: string;
  staffId?: string;
  date?: string;
  time?: string;
  booking?: Booking;
  stamps: string[];
}

const EMPTY: Picks = { stamps: [] };

function stepOf(p: Picks): Step {
  if (p.booking) return 6;
  if (!p.serviceId) return 1;
  if (!p.staffId) return 2;
  if (!p.date) return 3;
  if (!p.time) return 4;
  return 5;
}

const clock = (d: Date) => d.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
const shortDay = (iso: string) =>
  parseISODate(iso).toLocaleDateString("th-TH", { weekday: "short", day: "numeric", month: "short" });
const longDay = (iso: string) =>
  parseISODate(iso).toLocaleDateString("th-TH", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
const monogram = (s: Staff) => s.name.replace(/^(พญ\.|คุณ)\s*/, "").charAt(0);

// The greeting's timestamp is the moment the chat opened in this browser.
// The server snapshot is empty, so the prerendered HTML never carries a build-time clock.
let openedAt: string | null = null;
const noopSubscribe = () => () => {};
const getOpenedAt = () => (openedAt ??= clock(new Date()));
const getNoTime = () => "";

const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--rose-deep)";

export function BookingFlow() {
  const [data, setData] = useDemoStore(clinicData);
  const [picks, setPicks] = useState<Picks>(EMPTY);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<{ field: "name" | "phone" | "slot"; message: string } | null>(null);
  const greetedAt = useSyncExternalStore(noopSubscribe, getOpenedAt, getNoTime);

  const step = stepOf(picks);
  const activeRef = useRef<HTMLDivElement>(null);
  const lastStep = useRef<Step>(step);

  useEffect(() => {
    if (lastStep.current === step) return;
    lastStep.current = step;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    activeRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    // Move keyboard / screen-reader focus to the new step (never on first render: the
    // early return above skips the initial step).
    activeRef.current?.focus({ preventScroll: true });
  }, [step]);

  const service = data.services.find((s) => s.id === picks.serviceId);
  const staff = STAFF.find((s) => s.id === picks.staffId);
  // Step 4 is only reachable by clicking, so "now" here is always the browser's clock.
  const slots =
    step === 4 && service && staff && picks.date
      ? availableSlots(data, { date: picks.date, staffId: staff.id, serviceId: service.id, now: new Date() })
      : [];

  function pick(patch: Partial<Picks>) {
    setError(null);
    setPicks((p) => ({ ...p, ...patch, stamps: [...p.stamps, clock(new Date())] }));
  }

  function back() {
    setError(null);
    setPicks((p) => {
      const stamps = p.stamps.slice(0, -1);
      if (p.time) return { ...p, time: undefined, stamps };
      if (p.date) return { ...p, date: undefined, stamps };
      if (p.staffId) return { ...p, staffId: undefined, stamps };
      return EMPTY;
    });
  }

  function restart() {
    setError(null);
    setName("");
    setPhone("");
    setPicks(EMPTY);
  }

  function confirm(e: React.FormEvent) {
    e.preventDefault();
    if (!picks.serviceId || !picks.staffId || !picks.date || !picks.time) return;
    try {
      const result = bookAppointment(
        data,
        { name, phone, serviceId: picks.serviceId, staffId: picks.staffId, date: picks.date, time: picks.time },
        new Date(),
      );
      setData(result.data);
      pick({ booking: result.booking });
    } catch (err) {
      const message = err instanceof Error ? err.message : "จองไม่สำเร็จ กรุณาลองใหม่";
      setError({ field: message.includes("ชื่อ") ? "name" : message.includes("เบอร์") ? "phone" : "slot", message });
    }
  }

  // Each answered step becomes chat history; the current step is the live card.
  const at = (i: number) => picks.stamps[i] ?? "";

  return (
    <>
    <div className="relative mx-auto flex min-h-dvh w-full max-w-[420px] flex-col bg-(--chat) sm:my-8 sm:min-h-0 sm:overflow-hidden sm:rounded-[2.75rem] sm:border-[10px] sm:border-(--ink) sm:shadow-[0_40px_80px_-30px_rgb(43_34_38/0.55)] lg:my-0 lg:h-[min(860px,calc(100dvh-7.5rem))]">
      <style>{`@keyframes lumi-pop{from{opacity:0;transform:translateY(8px) scale(.98)}to{opacity:1;transform:none}}`}</style>
      <StatusBar />
      <ChatHeader />

      <div
        role="log"
        aria-label="แชตจองคิวกับ Lumi Clinic"
        className="flex-1 px-3 pt-4 pb-3 lg:overflow-y-auto lg:overscroll-contain [scrollbar-width:thin]"
      >
        <p className="mx-auto mb-4 w-fit rounded-full bg-(--chat-ink)/15 px-3 py-0.5 text-xs text-(--chat-ink)">วันนี้</p>

        <Turn active={step === 1} label="ขั้นที่ 1: เลือกบริการ" ref={step === 1 ? activeRef : undefined}>
          <BotSay first time={greetedAt}>สวัสดีค่ะ ยินดีต้อนรับสู่ลูมิ คลินิก</BotSay>
          <BotSay time={greetedAt}>วันนี้อยากทำทรีตเมนต์อะไรดีคะ เลือกได้เลยค่ะ</BotSay>
          {step === 1 ? (
            <ServiceCard services={data.services} onPick={(id) => pick({ serviceId: id })} />
          ) : (
            <MeSay time={at(0)}>{service?.name ?? "บริการ"}</MeSay>
          )}
        </Turn>

        {step >= 2 && service && (
          <Turn active={step === 2} label="ขั้นที่ 2: เลือกผู้ดูแล" ref={step === 2 ? activeRef : undefined}>
            <BotSay first time={at(0)}>
              {service.name} {service.durationMin} นาทีนะคะ อยากให้ใครดูแลดีคะ
            </BotSay>
            {step === 2 ? (
              <StaffCard service={service} onPick={(id) => pick({ staffId: id })} />
            ) : (
              <MeSay time={at(1)}>{staff?.name}</MeSay>
            )}
          </Turn>
        )}

        {step >= 3 && service && staff && (
          <Turn active={step === 3} label="ขั้นที่ 3: เลือกวัน" ref={step === 3 ? activeRef : undefined}>
            <BotSay first time={at(1)}>สะดวกมาวันไหนคะ จองล่วงหน้าได้ 7 วันค่ะ</BotSay>
            {step === 3 ? (
              <DateCard data={data} service={service} staff={staff} onPick={(date) => pick({ date })} />
            ) : (
              <MeSay time={at(2)}>{picks.date && shortDay(picks.date)}</MeSay>
            )}
          </Turn>
        )}

        {step >= 4 && service && staff && picks.date && (
          <Turn active={step === 4} label="ขั้นที่ 4: เลือกเวลา" ref={step === 4 ? activeRef : undefined}>
            <BotSay first time={at(2)}>
              {step === 4 && slots.length === 0
                ? `${longDay(picks.date)} ${staff.name}ไม่มีเวลาว่างแล้วค่ะ`
                : `เวลาที่${staff.name}ว่าง${longDay(picks.date)} เลือกได้เลยค่ะ`}
            </BotSay>
            {step === 4 ? (
              <SlotCard
                slots={slots}
                onPick={(time) => pick({ time })}
                onBack={back}
              />
            ) : (
              <MeSay time={at(3)}>{picks.time} น.</MeSay>
            )}
          </Turn>
        )}

        {step >= 5 && service && staff && picks.date && picks.time && (
          <Turn active={step === 5} label="ขั้นที่ 5: กรอกชื่อและเบอร์โทร" ref={step === 5 ? activeRef : undefined}>
            <BotSay first time={at(3)}>ขอชื่อและเบอร์โทรสำหรับยืนยันคิวด้วยค่ะ</BotSay>
            {step === 5 ? (
              <FlexCard>
                <form onSubmit={confirm} noValidate className="p-4">
                  <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 rounded-xl bg-(--blush) px-3.5 py-3 text-[13px] leading-[1.5]">
                    <dt className="text-(--muted)">บริการ</dt>
                    <dd className="text-right">{service.name}</dd>
                    <dt className="text-(--muted)">ผู้ดูแล</dt>
                    <dd className="text-right">{staff.name}</dd>
                    <dt className="text-(--muted)">วันเวลา</dt>
                    <dd className="text-right">
                      {shortDay(picks.date)} {picks.time} น.
                    </dd>
                    <dt className="text-(--muted)">ราคา</dt>
                    <dd className="text-right font-medium text-(--rose-deep)">
                      {service.price === 0 ? "ฟรี" : formatTHB(service.price)}
                    </dd>
                  </dl>

                  <Field
                    id="book-name"
                    label="ชื่อ-นามสกุล"
                    value={name}
                    onChange={setName}
                    autoComplete="name"
                    placeholder="เช่น สุดา ใจดี"
                    error={error?.field === "name" ? error.message : undefined}
                  />
                  <Field
                    id="book-phone"
                    label="เบอร์โทรศัพท์"
                    value={phone}
                    onChange={setPhone}
                    autoComplete="tel"
                    inputMode="tel"
                    type="tel"
                    placeholder="08x-xxx-xxxx"
                    error={error?.field === "phone" ? error.message : undefined}
                  />
                  {error?.field === "slot" && (
                    <p role="alert" className="mt-3 rounded-lg bg-(--error)/8 px-3 py-2 text-[13px] leading-[1.5] text-(--error)">
                      {error.message}
                    </p>
                  )}
                  <button
                    type="submit"
                    data-testid="book-confirm"
                    className={`mt-4 h-11 w-full rounded-xl bg-(--line-green) font-medium text-(--ink) transition-[filter] hover:brightness-95 active:brightness-90 ${focusRing}`}
                  >
                    ยืนยันการจอง
                  </button>
                  <p className="mt-2 text-center text-xs leading-[1.5] text-(--muted)">ไม่ต้องชำระเงินล่วงหน้า ชำระที่คลินิก</p>
                </form>
              </FlexCard>
            ) : (
              <MeSay time={at(4)}>ยืนยันการจอง</MeSay>
            )}
          </Turn>
        )}

        {step === 6 && picks.booking && service && staff && (
          <Turn active label="จองสำเร็จ: ใบยืนยันการจอง" ref={activeRef}>
            <BotSay first time={at(4)}>จองเรียบร้อยแล้วค่ะ แล้วพบกันที่คลินิกนะคะ</BotSay>
            <Receipt
              booking={picks.booking}
              customer={customerName(data, picks.booking, name)}
              service={service}
              staff={staff}
            />
            <div className="mt-2 ml-11 grid max-w-[17.5rem] grid-cols-2 gap-2">
              <button
                type="button"
                onClick={restart}
                className={`h-11 rounded-xl bg-white text-[15px] font-medium text-(--rose-deep) shadow-sm ${focusRing}`}
              >
                จองคิวเพิ่ม
              </button>
              <Link
                href="/demos/clinic-booking/admin"
                prefetch={false}
                className={`grid h-11 place-items-center rounded-xl bg-(--ink) text-[15px] font-medium text-white shadow-sm ${focusRing}`}
              >
                ดูฝั่งคลินิก
              </Link>
            </div>
          </Turn>
        )}
      </div>

      {/* Quick replies + composer, LINE's bottom chrome */}
      <div className="border-t border-black/5 bg-white pb-24 sm:pb-3">
        {step < 6 && (
          <div className="flex gap-2 overflow-x-auto px-3 pt-2.5 [scrollbar-width:none]">
            {step === 1 ? (
              <Link href="/demos/clinic-booking" className={`${chip} ${focusRing}`} data-testid="book-back">
                <ChevronLeft className="size-4" aria-hidden />
                กลับหน้าคลินิก
              </Link>
            ) : (
              <button type="button" onClick={back} className={`${chip} ${focusRing}`} data-testid="book-back">
                <ChevronLeft className="size-4" aria-hidden />
                ย้อนกลับ
              </button>
            )}
            {step >= 3 && (
              <button type="button" onClick={restart} className={`${chip} ${focusRing}`}>
                <RotateCcw className="size-3.5" aria-hidden />
                เริ่มใหม่
              </button>
            )}
          </div>
        )}
        <div aria-hidden className="flex items-center gap-3 px-3 pt-2.5 text-[#8a8f98]">
          <Plus className="size-5" />
          <Camera className="size-5" />
          <ImageIcon className="size-5" />
          <span className="flex h-9 flex-1 items-center justify-between rounded-full bg-[#f1f2f4] px-3.5 text-sm">
            Aa
            <Smile className="size-4.5" />
          </span>
          <Mic className="size-5" />
        </div>
      </div>
    </div>
    <BehindTheScenes booking={picks.booking} service={service} staff={staff} customer={customerName(data, picks.booking, name)} />
    </>
  );
}

const customerName = (data: ClinicData, booking: Booking | undefined, fallback: string) =>
  (booking && data.customers.find((c) => c.id === booking.customerId)?.name) || fallback;

// Desktop-only side panel: what the booking triggers outside the chat.
function BehindTheScenes({
  booking,
  service,
  staff,
  customer,
}: {
  booking?: Booking;
  service?: Service;
  staff?: Staff;
  customer: string;
}) {
  const done = booking && service && staff;
  return (
    <aside aria-label="สิ่งที่เกิดขึ้นหลังจองคิว" className="hidden max-w-xs self-center lg:block">
      <h2 className="text-[15px] text-(--muted)">หลังลูกค้ากดยืนยัน</h2>

      <div className={`mt-4 rounded-2xl p-4 ${done ? "bg-white/85 shadow-[0_12px_32px_-18px_rgb(43_34_38/0.4)] backdrop-blur" : "border border-dashed border-(--rose)/40"}`}>
        <p className="flex items-center gap-2 text-[13px] text-(--muted)">
          <BellRing className="size-4 text-(--line-green-ink)" aria-hidden />
          ข้อความเตือนใน LINE ก่อนวันนัด
        </p>
        {done ? (
          <p className="mt-2 text-[15px] leading-[1.6]">
            พรุ่งนี้ {booking.time} น. {customer} มีนัด{service.name}กับ{staff.name}ที่ลูมิ คลินิก แล้วพบกันนะคะ
          </p>
        ) : (
          <p className="mt-2 text-[15px] leading-[1.6] text-(--muted)">จองให้เสร็จ แล้วตัวอย่างข้อความจะขึ้นตรงนี้</p>
        )}
      </div>

      <div className={`mt-3 rounded-2xl p-4 ${done ? "bg-white/85 shadow-[0_12px_32px_-18px_rgb(43_34_38/0.4)] backdrop-blur" : "border border-dashed border-(--rose)/40"}`}>
        <p className="flex items-center gap-2 text-[13px] text-(--muted)">
          <CalendarCheck className="size-4 text-(--rose-deep)" aria-hidden />
          คิวใหม่ในระบบหลังร้าน
        </p>
        {done ? (
          <>
            <div className="mt-2 flex items-baseline gap-3">
              <span className="text-2xl font-light tabular-nums text-(--rose-deep)">{booking.time}</span>
              <span className="min-w-0 text-[15px] leading-[1.45]">
                {customer}
                <span className="block text-[13px] text-(--muted)">
                  {service.name} กับ{staff.name}
                </span>
              </span>
            </div>
            <Link
              href="/demos/clinic-booking/admin"
              prefetch={false}
              className="mt-3 inline-flex text-sm text-(--rose-deep) underline underline-offset-4"
            >
              เปิดระบบหลังร้าน
            </Link>
          </>
        ) : (
          <p className="mt-2 text-[15px] leading-[1.6] text-(--muted)">คิวจะเข้าตารางของผู้ดูแลทันที ไม่ต้องจดซ้ำ</p>
        )}
      </div>
    </aside>
  );
}

const chip =
  "inline-flex h-9 shrink-0 items-center gap-1 rounded-full border border-(--line-green-ink)/35 bg-white px-3.5 text-sm text-(--line-green-ink) hover:bg-(--line-green)/10";

function StatusBar() {
  return (
    <div aria-hidden className="hidden items-center justify-between bg-white px-7 pt-3 pb-1 text-[13px] font-medium sm:flex">
      <span>9:41</span>
      <span className="h-6 w-24 rounded-full bg-(--ink)" />
      <span className="flex items-center gap-1">
        <Signal className="size-3.5" />
        <Wifi className="size-3.5" />
        <BatteryFull className="size-4.5" />
      </span>
    </div>
  );
}

function ChatHeader() {
  return (
    <header className="sticky top-0 z-10 flex items-center gap-2 border-b border-black/5 bg-white px-2 py-2.5 sm:static">
      <Link
        href="/demos/clinic-booking"
        aria-label="กลับหน้าคลินิก"
        className={`grid size-9 place-items-center rounded-full text-(--ink) hover:bg-black/5 ${focusRing}`}
      >
        <ChevronLeft className="size-6" aria-hidden />
      </Link>
      <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-full bg-(--rose-deep) text-[15px] text-white">
        L
      </span>
      <div className="min-w-0 flex-1 leading-[1.25]">
        <p className="flex items-center gap-1 font-medium">
          Lumi Clinic
          <ShieldCheck className="size-4 fill-(--line-green) text-white" aria-label="บัญชีทางการ" />
        </p>
        <p className="truncate text-xs text-(--muted)">ลูมิ คลินิก ตอบกลับทันที</p>
      </div>
      <span aria-hidden className="flex items-center gap-3.5 pr-2 text-(--ink)/70">
        <Search className="size-5" />
        <Phone className="size-5" />
        <Menu className="size-5" />
      </span>
    </header>
  );
}

function Turn({
  active,
  label,
  ref,
  children,
}: {
  active: boolean;
  label: string;
  ref?: React.Ref<HTMLDivElement>;
  children: React.ReactNode;
}) {
  return (
    <div
      ref={ref}
      role="group"
      aria-label={label}
      tabIndex={active ? -1 : undefined}
      className={`scroll-mt-20 space-y-2 pb-4 outline-none sm:scroll-mt-4 ${active ? "motion-safe:animate-[lumi-pop_.28s_ease-out]" : ""}`}
    >
      {children}
    </div>
  );
}

function Time({ value, read }: { value: string; read?: boolean }) {
  if (!value && !read) return null;
  return (
    <span className="shrink-0 pb-0.5 text-[11px] leading-[1.3] text-(--chat-ink)">
      {read && <span className="block">อ่านแล้ว</span>}
      {value}
    </span>
  );
}

function BotSay({ first, time, children }: { first?: boolean; time: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      {first ? (
        <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-full bg-(--rose-deep) text-sm text-white">
          L
        </span>
      ) : (
        <span className="w-9 shrink-0" />
      )}
      <div className="min-w-0">
        {first && <p className="mb-1 text-xs text-(--chat-ink)">Lumi Clinic</p>}
        <div className="flex items-end gap-1.5">
          <p
            className={`max-w-[15.5rem] rounded-2xl bg-white px-3.5 py-2 text-[15px] leading-[1.5] ${first ? "rounded-tl-md" : ""}`}
          >
            {children}
          </p>
          <Time value={time} />
        </div>
      </div>
    </div>
  );
}

function MeSay({ time, children }: { time: string; children: React.ReactNode }) {
  return (
    <div className="flex items-end justify-end gap-1.5 text-right">
      <Time value={time} read />
      <p className="max-w-[15.5rem] rounded-2xl rounded-tr-md bg-(--bubble-me) px-3.5 py-2 text-left text-[15px] leading-[1.5]">
        {children}
      </p>
    </div>
  );
}

function FlexCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`ml-11 max-w-[17.5rem] overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgb(0_0_0/0.06)] ${className}`}>
      {children}
    </div>
  );
}

function ServiceCard({ services, onPick }: { services: Service[]; onPick: (id: string) => void }) {
  return (
    <FlexCard>
      <p className="px-4 pt-3.5 pb-1 text-[13px] text-(--muted)">ทรีตเมนต์ทั้งหมด</p>
      <ul className="divide-y divide-(--line)/70">
        {services.map((s) => (
          <li key={s.id}>
            <button
              type="button"
              data-testid={`service-${s.id}`}
              onClick={() => onPick(s.id)}
              className={`flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-(--blush) ${focusRing} focus-visible:-outline-offset-2`}
            >
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] leading-[1.4]">{s.name}</span>
                <span className="block text-xs text-(--muted)">{s.durationMin} นาที</span>
              </span>
              <span className="text-[15px] font-medium text-(--rose-deep)">{s.price === 0 ? "ฟรี" : formatTHB(s.price)}</span>
            </button>
          </li>
        ))}
      </ul>
    </FlexCard>
  );
}

function StaffCard({ service, onPick }: { service: Service; onPick: (id: string) => void }) {
  const team = STAFF.filter((s) => s.serviceIds.includes(service.id));
  return (
    <FlexCard>
      {team.length === 0 ? (
        <p className="p-4 text-sm leading-[1.6] text-(--muted)">ตอนนี้ยังไม่มีผู้ดูแลสำหรับบริการนี้ กดย้อนกลับเพื่อเลือกบริการอื่นได้ค่ะ</p>
      ) : (
        <ul className="divide-y divide-(--line)/70">
          {team.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                data-testid={`staff-${s.id}`}
                onClick={() => onPick(s.id)}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-(--blush) ${focusRing} focus-visible:-outline-offset-2`}
              >
                <span
                  aria-hidden
                  className="grid size-11 shrink-0 place-items-center rounded-full bg-(--blush-2) text-xl font-light text-(--rose-deep)"
                >
                  {monogram(s)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] leading-[1.4]">{s.name}</span>
                  <span className="block text-xs text-(--muted)">{s.role}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </FlexCard>
  );
}

// Only rendered after the user picks a staff member, so "today" is always the browser's today.
function DateCard({
  data,
  service,
  staff,
  onPick,
}: {
  data: ClinicData;
  service: Service;
  staff: Staff;
  onPick: (date: string) => void;
}) {
  const now = new Date();
  const days = nextDays(now, 7);
  return (
    <FlexCard className="p-3">
      <ul className="grid grid-cols-4 gap-1.5">
        {days.map((date, i) => {
          const free = availableSlots(data, { date, staffId: staff.id, serviceId: service.id, now }).length;
          const label = shortDay(date);
          const [weekday, ...dayMonth] = label.split(" ");
          return (
            <li key={date}>
              <button
                type="button"
                data-testid={`date-${i}`}
                aria-label={`${label}${free ? ` ว่าง ${free} ช่วงเวลา` : " เต็ม"}`}
                onClick={() => onPick(date)}
                className={`flex h-full w-full flex-col items-center rounded-xl border px-1 py-2 text-center hover:border-(--rose) hover:bg-(--blush) ${
                  free ? "border-(--line)" : "border-dashed border-(--line) bg-[#faf7f8]"
                } ${focusRing}`}
              >
                <span className="text-[11px] leading-[1.3] text-(--muted)">
                  {i === 0 ? "วันนี้" : i === 1 ? "พรุ่งนี้" : " "}
                </span>
                <span className="text-[13px] leading-[1.35]">{weekday}</span>
                <span className="text-[13px] leading-[1.35] tabular-nums">{dayMonth.join(" ")}</span>
                <span className={`mt-0.5 text-[11px] leading-[1.3] ${free ? "text-(--line-green-ink)" : "text-(--muted)"}`}>
                  {free ? `ว่าง ${free}` : "เต็ม"}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </FlexCard>
  );
}

function SlotCard({ slots, onPick, onBack }: { slots: string[]; onPick: (t: string) => void; onBack: () => void }) {
  return (
    <FlexCard className="p-3">
      {slots.length === 0 ? (
        <div className="p-1 text-center">
          <p className="text-[15px]">ไม่มีเวลาว่างในวันนี้</p>
          <button
            type="button"
            onClick={onBack}
            className={`mt-2 text-sm text-(--rose-deep) underline underline-offset-4 ${focusRing}`}
          >
            เลือกวันอื่น
          </button>
        </div>
      ) : (
        <ul className="grid grid-cols-4 gap-1.5">
          {slots.map((t) => (
            <li key={t}>
              <button
                type="button"
                data-testid="slot"
                onClick={() => onPick(t)}
                className={`h-10 w-full rounded-xl border border-(--line) text-[14px] tabular-nums hover:border-(--rose) hover:bg-(--blush) ${focusRing}`}
              >
                {t}
              </button>
            </li>
          ))}
        </ul>
      )}
    </FlexCard>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  error,
  ...rest
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "id">) {
  const errId = `${id}-error`;
  return (
    <div className="mt-3.5">
      <label htmlFor={id} className="text-[13px] text-(--muted)">
        {label}
      </label>
      <input
        id={id}
        data-testid={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-required
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errId : undefined}
        className={`mt-1 h-11 w-full rounded-xl border bg-white px-3.5 text-[15px] placeholder:text-[#857379] focus:border-(--rose-deep) focus:outline-none focus-visible:ring-2 focus-visible:ring-(--rose)/30 ${
          error ? "border-(--error)" : "border-(--line)"
        }`}
        {...rest}
      />
      {error && (
        <p id={errId} role="alert" className="mt-1 text-[13px] text-(--error)">
          {error}
        </p>
      )}
    </div>
  );
}

function Receipt({ booking, customer, service, staff }: { booking: Booking; customer: string; service: Service; staff: Staff }) {
  const end = fromMinutes(toMinutes(booking.time) + service.durationMin);
  const rows: [string, string][] = [
    ["ชื่อผู้จอง", customer],
    ["บริการ", service.name],
    ["ผู้ดูแล", staff.name],
    ["วันที่", longDay(booking.date)],
    ["เวลา", `${booking.time}–${end} น.`],
  ];
  return (
    <div data-testid="booking-confirmed" className="ml-11 max-w-[17.5rem] overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgb(0_0_0/0.06)]">
      <div className="relative aspect-[20/9]">
        <Image
          src={unsplash(PHOTOS.clinicHero, 640)}
          alt="ห้องทรีตเมนต์ของลูมิ คลินิก"
          fill
          sizes="280px"
          className="object-cover"
        />
        <span className="absolute bottom-2 left-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-medium text-(--line-green-ink)">
          <Check className="size-3.5" strokeWidth={3} aria-hidden />
          ยืนยันคิวแล้ว
        </span>
      </div>
      <div className="px-4 pt-3 pb-4">
        <p className="text-lg leading-[1.35] font-medium">นัดหมายของคุณ</p>
        <p className="text-xs text-(--muted)">รหัสการจอง {booking.id.toUpperCase()}</p>
        <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-[14px] leading-[1.5]">
          {rows.map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="text-(--muted)">{k}</dt>
              <dd className="text-right">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3.5 flex gap-2 border-t border-(--line) pt-3 text-[13px] leading-[1.55] text-(--muted)">
          <BellRing className="mt-0.5 size-4 shrink-0 text-(--rose-deep)" aria-hidden />
          เราจะส่งข้อความเตือนก่อนถึงคิว 1 วัน (ตัวอย่าง)
        </p>
      </div>
    </div>
  );
}

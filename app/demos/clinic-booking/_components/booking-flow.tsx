"use client";

import { BellRing, Check, ChevronLeft, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLang } from "@/components/demo/lang";
import {
  bookAsGuest,
  bookingDay,
  ClinicError,
  freeTimes,
  fromMinutes,
  STAFF,
  toMinutes,
  type Booking,
  type ClinicErrorCode,
  type Service,
} from "@/lib/demos/clinic-booking/data";
import { clinicData, clinicLastBooking } from "@/lib/demos/clinic-booking/store";
import { fill, formatDate, formatTHB } from "@/lib/demos/format";
import type { Lang } from "@/lib/demos/lang";
import { useDemoStore, useHydrated } from "@/lib/use-demo-store";
import { focusRing } from "./admin-format";
import { BookingMotion } from "./booking-motion";
import { BookingToast } from "./booking-toast";
import { errorText, homeSteps, ui } from "./copy";
import { DaySchedule } from "./day-schedule";
import { LineGlyph } from "./line-glyph";
import { BotSay, chip, clock, FlexCard, LinePhone, MeSay, useOpenedAt } from "./line-phone";
import { RingMark } from "./ring-mark";
import { StaffPortrait } from "./staff-portrait";
import { useWide } from "./use-wide";

type Step = 1 | 2 | 3 | 4;
type Side = "customer" | "clinic";

interface Slot {
  time: string;
  staffId: string;
  /** The day the time was offered on, fixed when it was picked. */
  date: string;
  isToday: boolean;
}

interface Picks {
  serviceId?: string;
  slot?: Slot;
  booking?: Booking;
  /** When each tap happened, for the chat's timestamps. */
  stamps: string[];
}

const EMPTY: Picks = { stamps: [] };

function stepOf(p: Picks): Step {
  if (p.booking) return 4;
  if (!p.serviceId) return 1;
  if (!p.slot) return 2;
  return 3;
}

const staffName = (id: string, lang: Lang) => STAFF.find((s) => s.id === id)?.name[lang] ?? "";
const priceText = (s: Service, lang: Lang) => (s.price === 0 ? ui.free[lang] : formatTHB(s.price));
const rangeOf = (time: string, s: Service, lang: Lang) =>
  fill(ui.timeRange[lang], { start: time, end: fromMinutes(toMinutes(time) + s.durationMin) });
const dayText = (slot: Slot, lang: Lang) =>
  fill((slot.isToday ? ui.dayToday : ui.dayTomorrow)[lang], { date: formatDate(slot.date, lang, "weekdayDayMonth") });

/** The booking page's two sides: the customer's LINE chat and the clinic's day. */
export function BookingFlow() {
  const lang = useLang();
  const hydrated = useHydrated();
  const [data, setData] = useDemoStore(clinicData);
  const [picks, setPicks] = useState<Picks>(EMPTY);
  // null until the visitor edits it, so the pre-filled name follows the language switch.
  const [name, setName] = useState<string | null>(null);
  const [error, setError] = useState<{ code: ClinicErrorCode | null } | null>(null);
  const [side, setSide] = useState<Side>("customer");
  const [unseen, setUnseen] = useState(false);
  const [toast, setToast] = useState<{ id: string; staffId: string; time: string } | null>(null);
  // The booking made during this page visit. Only it is marked "new" on the schedule; a booking
  // from an earlier visit (still in `clinicLastBooking` for the admin) is not replayed on reload.
  const [landedId, setLandedId] = useState<string | null>(null);
  const greetedAt = useOpenedAt();
  // Tabs exist below `lg` only. False on the server, so the first render matches the HTML.
  const wide = useWide();

  const step = stepOf(picks);
  const logRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLDivElement>(null);
  const tablistRef = useRef<HTMLDivElement>(null);
  const bookedActionRef = useRef<HTMLButtonElement>(null);
  const lastStep = useRef<Step>(step);

  useEffect(() => {
    if (lastStep.current === step) return;
    lastStep.current = step;
    const turn = activeRef.current;
    const log = logRef.current;
    if (!turn || !log) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Scroll the chat itself (not the page) so the new step's first message is in view.
    log.scrollTo({ top: Math.max(0, turn.offsetTop - 12), behavior: reduce ? "auto" : "smooth" });
    // Move keyboard / screen-reader focus to the new step's first control (never on first render).
    const first = turn.querySelector<HTMLElement>("button, input, a[href]");
    (first ?? turn).focus({ preventScroll: true });
  }, [step]);

  const service = data.services.find((s) => s.id === picks.serviceId);
  // Step 2 is only reachable by tapping, so "now" here is always the browser's clock.
  const offerDay = step === 2 ? bookingDay(new Date()) : null;
  const options =
    offerDay && service ? freeTimes(data, { serviceId: service.id, date: offerDay.date, now: new Date() }) : [];
  const nameValue = name ?? ui.guestName[lang];

  function tap(patch: Partial<Picks>) {
    setError(null);
    setPicks((p) => ({ ...p, ...patch, stamps: [...p.stamps, clock(new Date())] }));
  }

  function back() {
    setError(null);
    setPicks((p) => {
      const stamps = p.stamps.slice(0, -1);
      if (p.slot) return { ...p, slot: undefined, stamps };
      return EMPTY;
    });
  }

  function restart() {
    setError(null);
    setName(null);
    setPicks(EMPTY);
    setToast(null);
  }

  function confirm(e: React.FormEvent) {
    e.preventDefault();
    const slot = picks.slot;
    if (!service || !slot) return;
    try {
      const now = new Date();
      const result = bookAsGuest(
        data,
        { name: nameValue, serviceId: service.id, staffId: slot.staffId, date: slot.date, time: slot.time },
        now,
      );
      setData(result.data);
      clinicLastBooking.set(result.booking.id);
      setLandedId(result.booking.id);
      tap({ booking: result.booking });
      setToast({ id: result.booking.id, staffId: slot.staffId, time: slot.time });
      setUnseen(side !== "clinic");
    } catch (err) {
      setError({ code: err instanceof ClinicError ? err.code : null });
    }
  }

  const dismissToast = useCallback(() => setToast(null), []);

  function choose(next: Side) {
    setSide(next);
    if (next === "clinic") setUnseen(false);
  }

  /** The phone bar's "See it" (wide screens have no such button): open the clinic tab and focus it before the bar unmounts. */
  function seeSchedule() {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    choose("clinic");
    document.getElementById("tab-clinic")?.focus({ preventScroll: true });
    tablistRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    setToast(null);
  }

  /**
   * Where focus lands when the toast is closed and the control used before it has gone: the booked card's first
   * action (always showing on wide screens, and on phones while the chat tab is open), else the open tab.
   */
  const toastFallback = useCallback(() => {
    const candidates = [bookedActionRef.current, document.getElementById(`tab-${side}`)];
    return candidates.find((el): el is HTMLElement => Boolean(el && el.getClientRects().length > 0)) ?? null;
  }, [side]);

  function onTabKey(e: React.KeyboardEvent) {
    const order: Side[] = ["customer", "clinic"];
    let next: Side;
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") next = side === "customer" ? "clinic" : "customer";
    else if (e.key === "Home") next = order[0];
    else if (e.key === "End") next = order[order.length - 1];
    else return;
    e.preventDefault();
    choose(next);
    document.getElementById(`tab-${next}`)?.focus();
  }

  const at = (i: number) => picks.stamps[i];
  const nameError = error?.code === "name-required";
  const formError = error && !nameError ? (error.code ? errorText[error.code] : ui.bookFailed)[lang] : null;
  const clinicLabel = hydrated && !bookingDay(new Date()).isToday ? ui.sideClinicTomorrow : ui.sideClinic;

  // One toast at a time: a fixed bar on phones, an in-flow banner inside the schedule on wide screens, so it
  // never covers the chat's confirmation or the lanes. The server and hydration render the phone variant.
  const toastEl = (
    <BookingToast
      variant={wide ? "inline" : "fixed"}
      message={
        toast
          ? { key: toast.id, text: fill(ui.toastLanded[lang], { staff: staffName(toast.staffId, lang), time: toast.time }) }
          : null
      }
      onDismiss={dismissToast}
      onSee={seeSchedule}
      fallbackFocus={toastFallback}
    />
  );

  const chips =
    step === 4 ? undefined : (
      <>
        {step === 1 ? (
          <Link href="/demos/clinic-booking" data-testid="book-back" className={chip}>
            <ChevronLeft className="size-4" aria-hidden />
            {ui.backToClinic[lang]}
          </Link>
        ) : (
          <button type="button" onClick={back} data-testid="book-back" className={chip}>
            <ChevronLeft className="size-4" aria-hidden />
            {ui.back[lang]}
          </button>
        )}
        {step >= 2 && (
          <button type="button" onClick={restart} className={chip}>
            <RotateCcw className="size-3.5" aria-hidden />
            {ui.restart[lang]}
          </button>
        )}
      </>
    );

  return (
    <div className="mt-6 lg:mt-9">
      <BookingMotion />
      <div
        ref={tablistRef}
        role="tablist"
        aria-label={ui.sidesLabel[lang]}
        className="mb-5 grid scroll-mt-3 grid-cols-2 gap-1 rounded-full border border-(--line) bg-(--paper) p-1 lg:hidden"
      >
        {(["customer", "clinic"] as const).map((s) => {
          const selected = side === s;
          return (
            <button
              key={s}
              type="button"
              role="tab"
              id={`tab-${s}`}
              aria-selected={selected}
              aria-controls={`side-${s}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => choose(s)}
              onKeyDown={onTabKey}
              className={`flex h-11 items-center justify-center gap-2 rounded-full font-medium transition-colors ${focusRing} ${
                selected ? "bg-(--wine) text-white" : "text-(--muted) hover:text-(--wine)"
              }`}
            >
              {(s === "customer" ? ui.tabCustomer : ui.tabClinic)[lang]}
              {s === "clinic" && unseen && !wide && (
                <span data-testid="clinic-tab-badge" className="relative size-2.5 rounded-full bg-(--accent)">
                  <span className="sr-only">{ui.tabClinicBadge[lang]}</span>
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[400px_minmax(0,1fr)] lg:items-start lg:gap-12">
        <section
          id="side-customer"
          role={wide ? undefined : "tabpanel"}
          aria-labelledby="label-customer"
          className={side === "customer" ? "" : "max-lg:hidden"}
        >
          <SideLabel id="label-customer" icon={<LineGlyph className="size-4.5 text-white" />} tone="bg-(--line-green)">
            {ui.sideCustomer[lang]}
          </SideLabel>
          <LinePhone chips={chips}>
            <div
              ref={logRef}
              role="log"
              aria-label={ui.chatLog[lang]}
              className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pt-4 pb-3 [scrollbar-width:thin]"
            >
              <p className="mx-auto mb-4 w-fit rounded-full bg-[#4f5d72] px-3 py-0.5 text-[14px] leading-[1.5] text-white">
                {ui.chatDay[lang]}
              </p>

              <Turn active={step === 1} label={homeSteps[0].title[lang]} ref={step === 1 ? activeRef : undefined}>
                <BotSay first time={greetedAt}>
                  {ui.chatHello[lang]}
                </BotSay>
                <BotSay time={greetedAt}>{ui.chatAskTreatment[lang]}</BotSay>
                {step === 1 ? (
                  <ServiceCard services={data.services} onPick={(id) => tap({ serviceId: id })} />
                ) : (
                  <MeSay time={at(0)}>{service?.name[lang]}</MeSay>
                )}
              </Turn>

              {step >= 2 && service && (
                <Turn active={step === 2} label={homeSteps[1].title[lang]} ref={step === 2 ? activeRef : undefined}>
                  {step === 2 && offerDay ? (
                    options.length === 0 ? (
                      <BotSay first time={at(0)}>
                        {ui.noTimes[lang]}
                      </BotSay>
                    ) : (
                      <>
                        <BotSay first time={at(0)}>
                          {fill((offerDay.isToday ? ui.chatAskTimeToday : ui.chatAskTimeTomorrow)[lang], {
                            service: service.name[lang],
                          })}
                        </BotSay>
                        <SlotCard
                          options={options}
                          onPick={(o) => tap({ slot: { ...o, date: offerDay.date, isToday: offerDay.isToday } })}
                        />
                      </>
                    )
                  ) : (
                    picks.slot && (
                      <>
                        <BotSay first time={at(0)}>
                          {fill((picks.slot.isToday ? ui.chatAskTimeToday : ui.chatAskTimeTomorrow)[lang], {
                            service: service.name[lang],
                          })}
                        </BotSay>
                        <MeSay time={at(1)}>
                          {fill(ui.chatPickedTime[lang], { time: picks.slot.time, staff: staffName(picks.slot.staffId, lang) })}
                        </MeSay>
                      </>
                    )
                  )}
                </Turn>
              )}

              {step >= 3 && service && picks.slot && (
                <Turn active={step === 3} label={homeSteps[2].title[lang]} ref={step === 3 ? activeRef : undefined}>
                  <BotSay first time={at(1)}>
                    {ui.chatAskConfirm[lang]}
                  </BotSay>
                  {step === 3 ? (
                    <FlexCard>
                      <form onSubmit={confirm} noValidate>
                        <div className="bg-(--rose) px-4 py-3">
                          <p className="text-[14px] leading-[1.4] text-(--muted)">{ui.summaryTreatment[lang]}</p>
                          <p className="text-[17px] leading-[1.4] font-medium text-(--wine)">{service.name[lang]}</p>
                        </div>
                        <dl className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-2 px-4 pt-3 leading-[1.4]">
                          <dt className="text-[14px] text-(--muted)">{ui.summaryStaff[lang]}</dt>
                          <dd className="flex min-w-0 items-center justify-end gap-2 text-right">
                            <StaffPortrait decorative staffId={picks.slot.staffId} width={96} sizes="24px" className="size-6 shrink-0 rounded-full" />
                            <span className="truncate">{staffName(picks.slot.staffId, lang)}</span>
                          </dd>
                          <dt className="text-[14px] text-(--muted)">{ui.summaryDay[lang]}</dt>
                          <dd className="text-right">{dayText(picks.slot, lang)}</dd>
                          <dt className="text-[14px] text-(--muted)">{ui.summaryTime[lang]}</dt>
                          <dd className="text-right tabular-nums">{rangeOf(picks.slot.time, service, lang)}</dd>
                          <dt className="text-[14px] text-(--muted)">{ui.summaryPrice[lang]}</dt>
                          <dd className="text-right font-medium text-(--wine)">{priceText(service, lang)}</dd>
                        </dl>

                        <div className="px-4 pt-4 pb-4">
                          <label htmlFor="book-name" className="text-[14px] text-(--muted)">
                            {ui.nameLabel[lang]}
                          </label>
                          <input
                            id="book-name"
                            data-testid="book-name"
                            value={nameValue}
                            onChange={(e) => setName(e.target.value)}
                            autoComplete="name"
                            aria-required
                            aria-invalid={nameError || undefined}
                            aria-describedby={nameError ? "book-name-error" : undefined}
                            className={`mt-1 h-11 w-full rounded-xl border bg-white px-3.5 text-base outline-none focus:border-(--wine) focus-visible:ring-3 focus-visible:ring-(--accent)/25 ${
                              nameError ? "border-(--error)" : "border-(--line)"
                            }`}
                          />
                          {nameError && (
                            <p id="book-name-error" role="alert" className="mt-1 text-[14px] leading-[1.45] text-(--error)">
                              {errorText["name-required"][lang]}
                            </p>
                          )}
                          {formError && (
                            <p role="alert" className="mt-3 rounded-lg bg-(--error)/8 px-3 py-2 text-[14px] leading-[1.5] text-(--error)">
                              {formError}
                            </p>
                          )}
                          <button
                            type="submit"
                            data-testid="book-confirm"
                            className={`mt-4 h-12 w-full rounded-xl bg-(--line-green) text-base font-medium text-(--ink) transition-[filter] hover:brightness-95 active:brightness-90 ${focusRing}`}
                          >
                            {ui.confirmBooking[lang]}
                          </button>
                          <p className="mt-2 text-center text-[14px] leading-[1.45] text-(--muted)">{ui.payAtClinic[lang]}</p>
                        </div>
                      </form>
                    </FlexCard>
                  ) : (
                    <MeSay time={at(2)}>{ui.confirmBooking[lang]}</MeSay>
                  )}
                </Turn>
              )}

              {step === 4 && picks.booking && service && picks.slot && (
                <Turn active label={ui.bookedTitle[lang]} ref={activeRef}>
                  <BotSay first time={at(2)}>
                    {ui.chatBooked[lang]}
                  </BotSay>
                  <FlexCard data-testid="booking-confirmed">
                    <p className="flex items-center gap-2 bg-(--line-green) px-4 py-2.5 font-medium text-(--ink)">
                      <Check className="size-4.5" strokeWidth={3} aria-hidden />
                      {ui.bookedTitle[lang]}
                    </p>
                    <div className="px-4 pt-3 pb-4">
                      <p className="text-[1.625rem] leading-[1.3] font-medium text-(--wine) tabular-nums">
                        {rangeOf(picks.booking.time, service, lang)}
                      </p>
                      <p className="text-(--muted)">{dayText(picks.slot, lang)}</p>
                      <p className="mt-3 leading-[1.4] font-medium">{service.name[lang]}</p>
                      <p className="mt-1.5 flex items-center gap-2 leading-[1.4]">
                        <StaffPortrait decorative staffId={picks.booking.staffId} width={96} sizes="28px" className="size-7 shrink-0 rounded-full" />
                        {staffName(picks.booking.staffId, lang)}
                      </p>
                      <p className="mt-3.5 flex gap-2 border-t border-(--line) pt-3 text-[14px] leading-[1.5] text-(--muted)">
                        <BellRing className="mt-0.5 size-4 shrink-0 text-(--wine)" aria-hidden />
                        {ui.bookedReminder[lang]}
                      </p>
                    </div>
                  </FlexCard>
                  <div className="ml-11 grid w-[calc(100%-2.75rem)] max-w-[18rem] grid-cols-2 gap-2">
                    <button
                      ref={bookedActionRef}
                      type="button"
                      onClick={restart}
                      className={`h-11 rounded-xl bg-white font-medium text-(--wine) shadow-sm hover:bg-(--rose) ${focusRing}`}
                    >
                      {ui.restart[lang]}
                    </button>
                    <Link
                      href="/demos/clinic-booking/admin"
                      prefetch={false}
                      className={`grid h-11 place-items-center rounded-xl bg-(--wine) px-2 text-center leading-[1.2] font-medium text-white shadow-sm hover:bg-[#561830] ${focusRing}`}
                    >
                      {ui.openAdmin[lang]}
                    </Link>
                  </div>
                </Turn>
              )}
            </div>
          </LinePhone>
        </section>

        <section
          id="side-clinic"
          role={wide ? undefined : "tabpanel"}
          aria-labelledby="label-clinic"
          // On phones, room below the day so its last hour can scroll clear of the toast.
          className={side === "clinic" ? "max-lg:pb-24" : "max-lg:hidden"}
        >
          <SideLabel id="label-clinic" icon={<RingMark className="size-5 text-white" />} tone="bg-(--wine)">
            {clinicLabel[lang]}
          </SideLabel>
          <DaySchedule newId={landedId} banner={wide ? toastEl : null} />
        </section>
      </div>

      {!wide && toastEl}
    </div>
  );
}

function SideLabel({ id, icon, tone, children }: { id: string; icon: React.ReactNode; tone: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="mb-4 flex items-center gap-2.5 text-lg leading-[1.35] font-medium">
      <span aria-hidden className={`grid size-8 shrink-0 place-items-center rounded-[10px] ${tone}`}>
        {icon}
      </span>
      {children}
    </h2>
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
      className={`space-y-2 pb-4 outline-none ${active ? "motion-safe:animate-[lumi-pop_.28s_ease-out]" : ""}`}
    >
      {children}
    </div>
  );
}

function ServiceCard({ services, onPick }: { services: Service[]; onPick: (id: string) => void }) {
  const lang = useLang();
  return (
    <FlexCard>
      <p className="px-4 pt-3 pb-1 text-[14px] text-(--muted)">{ui.chatTreatments[lang]}</p>
      <ul className="divide-y divide-(--line)/70">
        {services.map((s) => (
          <li key={s.id}>
            <button
              type="button"
              data-testid={`service-${s.id}`}
              onClick={() => onPick(s.id)}
              className={`flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-(--rose) ${focusRing} focus-visible:-outline-offset-2`}
            >
              <span className="min-w-0 flex-1">
                <span className="block leading-[1.4]">{s.name[lang]}</span>
                <span className="block text-[14px] leading-[1.4] text-(--muted)">
                  {fill(ui.minutes[lang], { n: String(s.durationMin) })}
                </span>
              </span>
              <span className={`shrink-0 font-medium tabular-nums ${s.price === 0 ? "text-(--accent)" : "text-(--wine)"}`}>
                {priceText(s, lang)}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </FlexCard>
  );
}

function SlotCard({
  options,
  onPick,
}: {
  options: { time: string; staffId: string }[];
  onPick: (o: { time: string; staffId: string }) => void;
}) {
  const lang = useLang();
  return (
    <FlexCard className="p-2">
      <ul className="grid grid-cols-2 gap-1.5">
        {options.map((o) => (
          <li key={o.time}>
            <button
              type="button"
              data-testid="slot"
              data-time={o.time}
              data-staff={o.staffId}
              onClick={() => onPick(o)}
              className={`flex w-full flex-col items-start gap-1 rounded-xl border border-(--line) px-2.5 py-2 text-left hover:border-(--accent) hover:bg-(--rose) ${focusRing}`}
            >
              <span className="text-lg leading-[1.3] font-medium tabular-nums">{fill(ui.clockTime[lang], { time: o.time })}</span>
              <span className="flex w-full min-w-0 items-center gap-1">
                <StaffPortrait decorative staffId={o.staffId} width={96} sizes="20px" className="size-5 shrink-0 rounded-full" />
                <span className="truncate text-[14px] leading-[1.4] text-(--muted)">{staffName(o.staffId, lang)}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </FlexCard>
  );
}

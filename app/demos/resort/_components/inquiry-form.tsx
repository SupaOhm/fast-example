"use client";

import { CalendarCheck2 } from "lucide-react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ROOMS } from "@/lib/demos/resort/content";
import { nightsBetween, validateInquiry, type InquiryInput } from "@/lib/demos/resort/logic";
import { toISODate } from "@/lib/dates";
import { unsplash } from "@/lib/images";
import { formatTHB } from "@/lib/packages";
import { ui } from "./copy";
import { useLang } from "@/components/demo/lang";

type Field = keyof InquiryInput;
const FIELD_ORDER: Field[] = ["checkIn", "checkOut", "guests", "roomId", "name", "email"];

const inputClass =
  "mt-2 block h-12 w-full rounded-md border bg-(--paper) px-4 text-base text-(--ink) transition-colors focus-visible:border-(--sea) focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-(--sea)";

export function InquiryForm() {
  const lang = useLang();
  const params = useSearchParams();
  const roomParam = params.get("room") ?? "";
  const today = toISODate(new Date());

  const [values, setValues] = useState({
    checkIn: "",
    checkOut: "",
    guests: "2",
    roomId: ROOMS.some((r) => r.id === roomParam) ? roomParam : "",
    name: "",
    email: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [sentNights, setSentNights] = useState(0);
  const refs = useRef<Partial<Record<Field, HTMLInputElement | HTMLSelectElement | null>>>({});
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const input: InquiryInput = { ...values, guests: values.guests === "" ? Number.NaN : Number(values.guests) };
  const liveErrors = validateInquiry(input, today, lang);
  // Errors appear only after the first submit attempt, then update as the guest types.
  const errors = submitted ? liveErrors : {};
  const datesValid = !!values.checkIn && !!values.checkOut && !liveErrors.checkIn && !liveErrors.checkOut;
  const nights = datesValid ? nightsBetween(values.checkIn, values.checkOut) : 0;
  const room = ROOMS.find((r) => r.id === values.roomId);

  function update(field: Field, value: string) {
    setValues((v) => ({ ...v, [field]: value }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    const first = FIELD_ORDER.find((f) => liveErrors[f]);
    if (first) {
      refs.current[first]?.focus();
      return;
    }
    setStatus("sending");
    timer.current = setTimeout(() => {
      setSentNights(nights);
      setStatus("sent");
    }, 600);
  }

  function reset() {
    setValues((v) => ({ ...v, checkIn: "", checkOut: "", name: "", email: "" }));
    setSubmitted(false);
    setStatus("idle");
  }

  if (status === "sent") {
    return (
      <div className="mx-auto max-w-xl rounded-md border border-(--line) bg-(--paper) px-6 py-12 text-center sm:px-12">
        <CalendarCheck2 className="mx-auto size-12 text-(--sea)" strokeWidth={1.25} aria-hidden />
        <p
          data-testid="inquiry-success"
          role="status"
          className="mt-5 font-(family-name:--font-display) text-2xl leading-[1.4] text-(--sea-deep)"
        >
          {lang === "th"
            ? `ได้รับคำขอจองแล้ว ${sentNights} คืน (เว็บตัวอย่าง: ไม่มีการส่งข้อมูลจริง)`
            : `Inquiry received for ${sentNights} nights. (Demo — nothing was sent.)`}
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-8 h-11 rounded-full border border-(--sea) px-6 font-semibold text-(--sea) hover:bg-(--sea) hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--sea)"
        >
          {ui.another[lang]}
        </button>
      </div>
    );
  }

  function fieldProps(field: Field) {
    const err = errors[field];
    return {
      id: `inq-${field}`,
      name: field,
      "data-testid": `input-${field}`,
      "aria-invalid": err ? true : undefined,
      "aria-describedby": err ? `inq-${field}-error` : undefined,
      ref: (el: HTMLInputElement | HTMLSelectElement | null) => {
        refs.current[field] = el;
      },
      className: `${inputClass} ${err ? "border-(--error)" : "border-(--field)"}`,
    };
  }

  function errorText(field: Field) {
    const err = errors[field];
    if (!err) return null;
    return (
      <p id={`inq-${field}-error`} data-testid={`error-${field}`} role="alert" className="mt-1.5 text-sm leading-[1.5] text-(--error)">
        {err}
      </p>
    );
  }

  function label(field: Field, text: string, optional = false) {
    return (
      <label htmlFor={`inq-${field}`} className="text-[15px] font-medium text-(--ink)">
        {text}
        {optional && <span className="font-normal text-(--muted)"> {ui.optional[lang]}</span>}
      </label>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,4fr)] lg:gap-14">
      <form noValidate onSubmit={onSubmit} className="grid gap-x-5 gap-y-6 sm:grid-cols-2">
        <div>
          {label("checkIn", ui.checkIn[lang])}
          <input
            type="date"
            min={today}
            aria-required
            value={values.checkIn}
            onChange={(e) => update("checkIn", e.target.value)}
            {...fieldProps("checkIn")}
          />
          {errorText("checkIn")}
        </div>
        <div>
          {label("checkOut", ui.checkOut[lang])}
          <input
            type="date"
            min={values.checkIn || today}
            aria-required
            value={values.checkOut}
            onChange={(e) => update("checkOut", e.target.value)}
            {...fieldProps("checkOut")}
          />
          {errorText("checkOut")}
        </div>
        <div>
          {label("guests", ui.guests[lang])}
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={8}
            aria-required
            value={values.guests}
            onChange={(e) => update("guests", e.target.value)}
            {...fieldProps("guests")}
          />
          {errorText("guests")}
        </div>
        <div>
          {label("roomId", ui.room[lang], true)}
          <select value={values.roomId} onChange={(e) => update("roomId", e.target.value)} {...fieldProps("roomId")}>
            <option value="">{ui.anyRoom[lang]}</option>
            {ROOMS.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name[lang]} ({formatTHB(r.pricePerNight)})
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          {label("name", ui.name[lang])}
          <input
            type="text"
            autoComplete="name"
            aria-required
            value={values.name}
            onChange={(e) => update("name", e.target.value)}
            {...fieldProps("name")}
          />
          {errorText("name")}
        </div>
        <div className="sm:col-span-2">
          {label("email", ui.email[lang])}
          <input
            type="email"
            autoComplete="email"
            aria-required
            value={values.email}
            onChange={(e) => update("email", e.target.value)}
            {...fieldProps("email")}
          />
          {errorText("email")}
        </div>
        <div className="sm:col-span-2">
          <button
            type="submit"
            data-testid="inquiry-submit"
            disabled={status === "sending"}
            className="h-12 w-full rounded-full bg-(--sea) px-8 font-semibold text-white transition-colors hover:bg-(--sea-deep) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--sea) disabled:opacity-70 sm:w-auto"
          >
            {status === "sending" ? ui.sending[lang] : ui.submit[lang]}
          </button>
        </div>
      </form>

      <aside aria-labelledby="stay-summary" className="self-start lg:sticky lg:top-28">
        <div className="overflow-hidden rounded-md bg-(--sea-deep) text-(--sand)">
          {room && (
            <div className="relative aspect-[16/10]">
              <Image src={unsplash(room.image, 700)} alt={room.name[lang]} fill sizes="(min-width: 1024px) 30vw, 100vw" className="object-cover" />
            </div>
          )}
          <div className="p-6 sm:p-8">
            <h2 id="stay-summary" className="font-(family-name:--font-display) text-2xl leading-[1.3]">
              {ui.yourStay[lang]}
            </h2>
            <p className="mt-1 leading-[1.5] text-(--sand)/80">{room ? room.name[lang] : ui.anyRoom[lang]}</p>
            <div className="mt-6 space-y-3 border-t border-white/15 pt-5 text-[15px]" aria-live="polite">
              {nights > 0 ? (
                <dl className="flex justify-between gap-4">
                  <dt className="text-(--sand)/80">{lang === "th" ? "จำนวนคืน" : "Nights"}</dt>
                  <dd data-testid="inquiry-nights">
                    {nights} {ui.nights[lang]}
                  </dd>
                </dl>
              ) : (
                <p className="leading-[1.6] text-(--sand)/80">{ui.pickDates[lang]}</p>
              )}
              {nights > 0 &&
                (room ? (
                  <dl className="flex items-end justify-between gap-4 pt-2">
                    <dt className="text-(--sand)/80">{ui.estimate[lang]}</dt>
                    <dd data-testid="inquiry-total" className="font-(family-name:--font-display) text-3xl leading-[1.2] text-(--sun)">
                      {formatTHB(room.pricePerNight * nights)}
                    </dd>
                  </dl>
                ) : (
                  <p className="leading-[1.6] text-(--sand)/80">{ui.pickRoom[lang]}</p>
                ))}
            </div>
            {nights > 0 && room && <p className="mt-4 text-sm leading-[1.6] text-(--sand)/75">{ui.estimateNote[lang]}</p>}
          </div>
        </div>
      </aside>
    </div>
  );
}

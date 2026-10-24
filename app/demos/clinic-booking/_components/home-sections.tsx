"use client";

import { CalendarCheck, Car, Clock, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useLang } from "@/components/demo/lang";
import { CLOSE, OPEN, SERVICES, STAFF } from "@/lib/demos/clinic-booking/data";
import { fill, formatTHB } from "@/lib/demos/format";
import { PHOTOS, unsplash } from "@/lib/images";
import { CLINIC_ADDRESS, homeSteps, ui } from "./copy";
import { lineButton } from "./home-hero";
import { StaffPortrait } from "./staff-portrait";

const serviceName = new Map(SERVICES.map((s) => [s.id, s.name]));
const h2 = "text-[2rem] leading-[1.3] font-medium text-balance sm:text-[2.5rem]";

export function Treatments() {
  const lang = useLang();
  return (
    <section id="treatments" aria-labelledby="treatments-title" className="scroll-mt-4 bg-(--paper) py-20 lg:py-28">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-4">
          <h2 id="treatments-title" className={`${h2} text-(--wine)`}>
            {ui.treatmentsTitle[lang]}
          </h2>
          <p className="mt-4 max-w-sm text-[17px] leading-[1.75] text-(--muted)">{ui.treatmentsBody[lang]}</p>
        </div>
        <ul className="grid border-t border-(--line) sm:grid-cols-2 sm:gap-x-10 lg:col-span-8">
          {SERVICES.map((s) => (
            <li key={s.id} className="flex items-start justify-between gap-6 border-b border-(--line) py-6">
              <div className="min-w-0">
                <p className="text-xl leading-[1.4] font-medium">{s.name[lang]}</p>
                <p className="mt-1 text-(--muted)">{fill(ui.minutes[lang], { n: String(s.durationMin) })}</p>
              </div>
              <p
                className={`shrink-0 text-xl leading-[1.4] font-medium tabular-nums ${s.price === 0 ? "text-(--accent)" : "text-(--wine)"}`}
              >
                {s.price === 0 ? ui.free[lang] : formatTHB(s.price)}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Team() {
  const lang = useLang();
  return (
    <section id="team" aria-labelledby="team-title" className="scroll-mt-4 bg-(--wine) py-20 text-white lg:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-4 lg:grid-cols-12 lg:items-end lg:gap-8">
          <h2 id="team-title" className={`${h2} lg:col-span-6`}>
            {ui.teamTitle[lang]}
          </h2>
          <p className="max-w-md text-[17px] leading-[1.75] text-(--rose-2) lg:col-span-5 lg:col-start-8">{ui.teamBody[lang]}</p>
        </div>
        <ul className="mt-12 grid gap-12 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-3 lg:gap-8">
          {STAFF.map((st) => (
            <li key={st.id} data-testid="staff-card">
              <StaffPortrait
                staffId={st.id}
                width={800}
                sizes="(min-width: 1024px) 360px, (min-width: 640px) 45vw, 100vw"
                className="aspect-[4/5] rounded-[1.5rem]"
              />
              <p className="mt-5 text-2xl leading-[1.35] font-medium">{st.name[lang]}</p>
              <p className="mt-0.5 text-(--rose-2)">{st.role[lang]}</p>
              <ul aria-label={fill(ui.staffTreatments[lang], { name: st.name[lang] })} className="mt-4 flex flex-wrap gap-2">
                {st.serviceIds.map((id) => (
                  <li key={id} className="rounded-full border border-white/30 px-3 py-1 leading-[1.4] text-white">
                    {serviceName.get(id)?.[lang]}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function ClinicInfo() {
  const lang = useLang();
  const facts = [
    {
      icon: MapPin,
      label: ui.addressLabel,
      value: (
        <>
          {CLINIC_ADDRESS} {ui.addressNote[lang]}
        </>
      ),
    },
    {
      icon: Clock,
      label: ui.hoursLabel,
      value: (
        <>
          {fill(ui.hours[lang], { open: OPEN, close: CLOSE })}
          <br />
          {ui.bookAhead[lang]}
        </>
      ),
    },
    { icon: Car, label: ui.parkingLabel, value: ui.parking[lang] },
  ];
  return (
    <section id="clinic" aria-labelledby="clinic-title" className="scroll-mt-4 py-20 lg:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:gap-8">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] bg-(--rose-2) lg:col-span-6 lg:aspect-[5/6]">
          <Image
            src={unsplash(PHOTOS.clinicInterior, 1200)}
            alt={ui.interiorPhotoAlt[lang]}
            fill
            sizes="(min-width: 1024px) 560px, 100vw"
            className="object-cover"
          />
        </div>
        <div className="lg:col-span-5 lg:col-start-8">
          <h2 id="clinic-title" className={`${h2} text-(--wine)`}>
            {ui.clinicTitle[lang]}
          </h2>
          <p className="mt-4 max-w-md text-[17px] leading-[1.75] text-(--muted)">{ui.clinicBody[lang]}</p>
          <dl className="mt-10 grid gap-6 border-t border-(--line) pt-8">
            {facts.map(({ icon: Icon, label, value }) => (
              // A <dl> row may only hold <dt> and <dd>, so the icon sits inside the <dt> and hangs in the padding.
              <div key={label.en} className="relative min-h-10 pl-14">
                <dt className="font-medium">
                  <span aria-hidden className="absolute top-0 left-0 grid size-10 place-items-center rounded-full bg-(--paper) text-(--wine)">
                    <Icon className="size-5" />
                  </span>
                  {label[lang]}
                </dt>
                <dd className="mt-0.5 leading-[1.65] text-(--muted)">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

export function HowBooking() {
  const lang = useLang();
  return (
    <section aria-labelledby="steps-title" className="bg-(--paper) py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="max-w-xl">
          <h2 id="steps-title" className={`${h2} text-(--wine)`}>
            {ui.stepsTitle[lang]}
          </h2>
          <p className="mt-4 text-[17px] leading-[1.75] text-(--muted)">{ui.stepsBody[lang]}</p>
        </div>
        <ol className="mt-12 grid gap-8 sm:grid-cols-3 sm:gap-6">
          {homeSteps.map((step, i) => (
            <li key={step.title.en} className="relative">
              {/* A thread from one step to the next, on wide screens only. */}
              {i < homeSteps.length - 1 && (
                <span aria-hidden className="absolute top-6 left-14 hidden h-px w-[calc(100%-2rem)] bg-(--line) sm:block" />
              )}
              <span
                aria-hidden
                className="relative grid size-12 place-items-center rounded-full border-2 border-(--wine) bg-(--paper) text-lg font-medium text-(--wine)"
              >
                {i + 1}
              </span>
              <p className="mt-5 text-xl leading-[1.4] font-medium">{step.title[lang]}</p>
              <p className="mt-1.5 max-w-xs leading-[1.65] text-(--muted)">{step.body[lang]}</p>
            </li>
          ))}
        </ol>
        <Link href="/demos/clinic-booking/book" className={`${lineButton} mt-12`}>
          <CalendarCheck className="size-5" aria-hidden />
          {ui.stepsCta[lang]}
        </Link>
      </div>
    </section>
  );
}

export function HomeFooter() {
  const lang = useLang();
  return (
    <footer className="mx-auto flex max-w-6xl flex-col gap-5 px-4 pt-12 pb-28 text-(--muted) sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <p className="max-w-xl leading-[1.65]">{ui.footerNote[lang]}</p>
      <Link
        href="/demos/clinic-booking/admin"
        prefetch={false}
        className="inline-flex min-h-11 shrink-0 items-center self-start rounded-full border border-(--wine)/30 bg-(--paper) px-5 py-2 font-medium text-(--wine) transition-colors hover:border-(--wine) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--wine) sm:self-auto"
      >
        {ui.footerAdmin[lang]}
      </Link>
    </footer>
  );
}

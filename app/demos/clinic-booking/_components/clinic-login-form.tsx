"use client";

import { ChevronLeft, Info, LogIn } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DemoLangSwitch, TImage, useLang } from "@/components/demo/lang";
import { clinicSession } from "@/lib/demos/clinic-booking/store";
import { PHOTOS, unsplash } from "@/lib/images";
import { useDemoStore, useHydrated } from "@/lib/use-demo-store";
import { fieldClass, focusRing } from "./admin-format";
import { ui } from "./copy";
import { LineGlyph } from "./line-glyph";
import { RingMark } from "./ring-mark";

const ADMIN = "/demos/clinic-booking/admin";

/** The login's photo half (wide screens only): the treatment room, with the one thing the back office is for. */
export function ClinicLoginArt() {
  const lang = useLang();
  return (
    <div className="relative hidden overflow-hidden lg:block">
      <TImage src={unsplash(PHOTOS.clinicHero, 1200)} alt={ui.loginPhotoAlt} fill sizes="50vw" preload className="object-cover" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(42_29_34/0)_35%,rgb(58_16_32/0.82))]" />
      <div className="absolute inset-x-12 bottom-28 max-w-md text-white">
        <p className="flex items-center gap-2.5">
          <span className="grid size-10 place-items-center rounded-full bg-white/95 text-(--wine)">
            <RingMark className="size-7" />
          </span>
          <span className="text-xl leading-[1.2] font-semibold">{ui.brand[lang]}</span>
        </p>
        <p className="mt-6 text-[1.75rem] leading-[1.4] font-medium text-balance">{ui.loginArt[lang]}</p>
        <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1.5 text-[14px] leading-[1.4] backdrop-blur-sm">
          <LineGlyph className="size-4 text-(--line-green)" />
          {ui.bookAhead[lang]}
        </p>
      </div>
    </div>
  );
}

export function ClinicLoginForm() {
  const lang = useLang();
  const router = useRouter();
  const hydrated = useHydrated();
  const [session, setSession] = useDemoStore(clinicSession);
  const [email, setEmail] = useState("staff@lumi.example");
  const [password, setPassword] = useState("demo1234");

  useEffect(() => {
    if (hydrated && session) router.replace(ADMIN);
  }, [hydrated, session, router]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Demo only: any input is accepted and nothing leaves the browser.
    setSession(true);
    router.push(ADMIN);
  }

  return (
    <div className="flex min-h-screen flex-col px-4 pb-28 sm:px-8">
      <div className="flex h-16 items-center gap-3">
        <Link
          href="/demos/clinic-booking"
          aria-label={ui.backToClinic[lang]}
          className={`-ml-2 inline-flex h-10 items-center gap-1 rounded-full pr-3 pl-2 text-(--wine) hover:bg-(--paper) ${focusRing}`}
        >
          <ChevronLeft className="size-5" aria-hidden />
          <span className="hidden font-medium sm:inline">{ui.backToClinic[lang]}</span>
        </Link>
        <p className="mx-auto flex items-center gap-2 text-(--wine) lg:hidden">
          <RingMark className="size-7 shrink-0" />
          <span className="text-lg leading-[1.2] font-semibold whitespace-nowrap">{ui.brand[lang]}</span>
        </p>
        <DemoLangSwitch
          className={`grid lg:ml-auto h-10 min-w-11 place-items-center rounded-full border border-(--wine)/25 px-3 font-medium text-(--wine) transition-colors hover:bg-(--paper) ${focusRing}`}
        />
      </div>

      <div className="grid flex-1 place-items-center pt-4">
        <div className="w-full max-w-[420px]">
          <div className="rounded-[1.75rem] border border-(--line) bg-(--paper) p-6 shadow-[0_30px_60px_-40px_rgb(107_31_58/0.45)] sm:p-8">
            <h1 className="text-[1.75rem] leading-[1.3] font-medium text-(--wine)">{ui.loginTitle[lang]}</h1>
            <p className="mt-2 leading-[1.6] text-(--muted)">{ui.loginBody[lang]}</p>

            <form onSubmit={onSubmit} className="mt-7 space-y-4">
              <div>
                <label htmlFor="clinic-email" className="font-medium">
                  {ui.loginEmail[lang]}
                </label>
                <input
                  id="clinic-email"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={fieldClass}
                />
              </div>
              <div>
                <label htmlFor="clinic-password" className="font-medium">
                  {ui.loginPassword[lang]}
                </label>
                <input
                  id="clinic-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={fieldClass}
                />
              </div>

              <p className="flex items-start gap-2.5 rounded-xl bg-(--rose) px-3.5 py-3 leading-[1.5] text-(--wine)">
                <Info className="mt-1 size-4 shrink-0" aria-hidden />
                {ui.loginDemoNote[lang]}
              </p>

              <button
                type="submit"
                data-testid="login-submit"
                className={`flex h-12 w-full items-center justify-center gap-2 rounded-full bg-(--wine) px-4 font-medium text-white transition-colors hover:bg-[#561830] ${focusRing}`}
              >
                <LogIn className="size-4.5" aria-hidden />
                {ui.loginSubmit[lang]}
              </button>
            </form>
          </div>

          <p className="mt-5 text-center text-[14px] leading-[1.6] text-(--muted)">{ui.loginPrivacy[lang]}</p>
        </div>
      </div>
    </div>
  );
}

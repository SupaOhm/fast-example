"use client";

import { Info, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DemoLangSwitch, useLang } from "@/components/demo/lang";
import { shopSession } from "@/lib/demos/shop-admin/store";
import { useDemoStore, useHydrated } from "@/lib/use-demo-store";
import { BrandMark } from "./brand-mark";
import { ui } from "./copy";
import { LANG_SWITCH_CLASS } from "./shop-css";

const field =
  "mt-1.5 block w-full rounded-md border-[1.5px] border-(--line) bg-white px-3.5 py-2.5 text-base text-(--ink) transition-colors focus:border-(--ink) focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-(--mustard)";

// Torn edge along the bottom of the paper slip.
const TORN = {
  WebkitMask: "conic-gradient(from -45deg at bottom, #0000, #000 1deg 89deg, #0000 90deg) 50% / 18px 100%",
  mask: "conic-gradient(from -45deg at bottom, #0000, #000 1deg 89deg, #0000 90deg) 50% / 18px 100%",
} as React.CSSProperties;

/** The wooden counter edge across the top of the login page, with the shop sign and the language switch. */
export function LoginBar() {
  const lang = useLang();
  return (
    <header className="rd-wood flex items-center justify-between gap-3 bg-(--wood) px-4 py-2.5 text-(--bg) sm:px-6">
      <span className="flex items-center gap-2.5">
        <BrandMark className="size-10" />
        <span className="leading-[1.25]">
          <span className="block text-lg font-bold">{ui.brand[lang]}</span>
          <span className="block text-sm text-(--mustard)">{ui.brandTagline[lang]}</span>
        </span>
      </span>
      <DemoLangSwitch className={LANG_SWITCH_CLASS} />
    </header>
  );
}

export function LoginForm() {
  const lang = useLang();
  const router = useRouter();
  const hydrated = useHydrated();
  const [session, setSession] = useDemoStore(shopSession);
  const [email, setEmail] = useState("demo@randee.example");
  const [password, setPassword] = useState("demo1234");

  useEffect(() => {
    if (hydrated && session) router.replace("/demos/shop-admin");
  }, [hydrated, session, router]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Demo only: any input is accepted and nothing leaves the browser.
    setSession(true);
    router.push("/demos/shop-admin");
  }

  return (
    <div className="w-full max-w-[440px]">
      <div className="drop-shadow-[0_10px_14px_rgba(43,34,23,.16)]">
        <div style={TORN} className="relative bg-(--paper) px-6 pb-10 pt-7 sm:px-8">
          <span aria-hidden className="absolute inset-x-0 top-0 h-1.5 bg-(--mustard)" />
          <h1 className="text-2xl font-bold leading-[1.3]">{ui.loginTitle[lang]}</h1>
          <p className="mt-1.5 leading-[1.55] text-(--muted)">{ui.loginSub[lang]}</p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="shop-email" className="text-sm font-semibold">
                {ui.email[lang]}
              </label>
              <input
                id="shop-email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={field}
              />
            </div>
            <div>
              <label htmlFor="shop-password" className="text-sm font-semibold">
                {ui.password[lang]}
              </label>
              <input
                id="shop-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={field}
              />
            </div>

            <p className="flex items-start gap-2 rounded-md border border-dashed border-(--mustard-ink)/50 bg-(--mustard)/15 px-3 py-2.5 text-sm leading-[1.5]">
              <Info className="mt-0.5 size-4 shrink-0 text-(--mustard-ink)" aria-hidden />
              {ui.loginNote[lang]}
            </p>

            <button
              type="submit"
              data-testid="login-submit"
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-(--wood) px-4 text-base font-bold text-(--bg) transition-colors hover:text-(--mustard)"
            >
              <LogIn className="size-5" aria-hidden />
              {ui.loginSubmit[lang]}
            </button>
          </form>
        </div>
      </div>

      <p className="mt-5 text-center text-sm leading-[1.5] text-(--muted)">{ui.loginFoot[lang]}</p>
    </div>
  );
}

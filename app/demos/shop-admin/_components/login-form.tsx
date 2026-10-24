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
  "mt-1.5 block w-full rounded-lg border border-[#8a958f] bg-white px-3.5 py-2.5 text-base text-(--ink) transition-colors focus:border-(--brand) focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-(--brand)";

/** A plain white bar across the top of the login page, with the shop name and the language switch. */
export function LoginBar() {
  const lang = useLang();
  return (
    <header className="flex items-center justify-between gap-3 border-b border-(--line) bg-(--panel) px-4 py-2.5 sm:px-6">
      <span className="flex items-center gap-2.5">
        <BrandMark className="size-9 text-base" />
        <span className="leading-[1.25]">
          <span className="block text-base font-semibold">{ui.brand[lang]}</span>
          <span className="block text-sm text-(--muted)">{ui.brandTagline[lang]}</span>
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
    <div className="w-full max-w-[400px]">
      <div className="rounded-2xl border border-(--line) bg-(--panel) p-6 shadow-[0_1px_2px_rgba(23,32,27,0.04),0_12px_32px_-16px_rgba(23,32,27,0.18)] sm:p-8">
        <h1 className="text-xl font-semibold leading-[1.3]">{ui.loginTitle[lang]}</h1>
        <p className="mt-1 text-base leading-[1.5] text-(--muted)">{ui.loginSub[lang]}</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="shop-email" className="text-sm font-medium">
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
            <label htmlFor="shop-password" className="text-sm font-medium">
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

          <p className="flex items-start gap-2 rounded-lg bg-(--brand-soft) px-3 py-2.5 text-sm leading-[1.45] text-(--brand-ink)">
            <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
            {ui.loginNote[lang]}
          </p>

          <button
            type="submit"
            data-testid="login-submit"
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-(--brand) px-4 text-base font-semibold text-white transition-colors hover:bg-(--brand-ink)"
          >
            <LogIn className="size-4" aria-hidden />
            {ui.loginSubmit[lang]}
          </button>
        </form>
      </div>

      <p className="mt-5 text-center text-sm leading-[1.5] text-(--muted)">{ui.loginFoot[lang]}</p>
    </div>
  );
}

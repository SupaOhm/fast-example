"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/components/demo/lang";
import { fill, product } from "@/lib/demos/sale-page/content";
import { formatCountdown, msUntilEndOfDay } from "@/lib/demos/sale-page/countdown";
import { formatTHB } from "@/lib/packages";
import { useHydrated } from "@/lib/use-demo-store";
import { ui } from "./copy";

/** The gold strip on top: launch price and a cosmetic count down to local midnight. */
export function CountdownBar() {
  const lang = useLang();
  const hydrated = useHydrated();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // The page is prerendered, so the clock only shows once the browser has taken over.
  const time = hydrated ? formatCountdown(msUntilEndOfDay(now)) : "-- : -- : --";

  return (
    <div className="bg-(--gold) text-(--green-deep)">
      <p className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 py-2 text-base leading-[1.4] font-semibold">
        <span>{fill(ui.promoBar[lang], { price: formatTHB(product.promoPrice) })}</span>
        <span
          data-testid="promo-countdown"
          role="timer"
          className="rounded-md bg-(--green-deep) px-2.5 py-0.5 whitespace-nowrap text-(--gold) tabular-nums"
        >
          {time}
        </span>
      </p>
    </div>
  );
}

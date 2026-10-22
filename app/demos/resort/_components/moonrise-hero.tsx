"use client";

import { MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { resort } from "@/lib/demos/resort/content";
import { unsplash } from "@/lib/images";
import { ui } from "./copy";
import { T } from "@/components/demo/lang";

const btn =
  "inline-flex h-12 items-center justify-center rounded-full px-7 font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2";

/*
 * Every scroll-linked visual below is a static calc() on --p, which runs 0 → 1 while the stage is pinned.
 * Only the scroll handler writes --p; React renders these styles once and never again per frame.
 */
const STYLE = {
  // A slow push-in on the photo as night falls.
  photo: { transform: "scale(calc(1 + var(--p) * 0.06))" },
  // Night settles over the bay, darkest at the top of the sky.
  night: { opacity: "min(1, calc(var(--p) * 1.15))" },
  // A warm band on the horizon that peaks around dusk (p ≈ 0.4) and is gone by night.
  dusk: { opacity: "clamp(0, min(calc(var(--p) / 0.4), calc((1 - var(--p)) / 0.6)), 1)" },
  // The moon climbs from behind the ridge (hidden by the sky mask) to the upper sky.
  moon: { transform: "translate3d(0, calc(var(--p) * -46cqh), 0)" },
  // Low moons look amber; the cream disc fades in as it climbs.
  moonHigh: { opacity: "clamp(0, calc((var(--p) - 0.35) / 0.5), 1)" },
  // The two lines barely overlap, so the swap reads as one line giving way to the next, not a double exposure.
  tagline: {
    opacity: "clamp(0, calc(1 - (var(--p) - 0.15) / 0.33), 1)",
    transform: "translate3d(0, calc(min(var(--p), 0.5) * -80px), 0)",
  },
  line: {
    "--in": "clamp(0, calc((var(--p) - 0.47) / 0.28), 1)",
    opacity: "var(--in)",
    transform: "translate3d(0, calc((1 - var(--in)) * 36px), 0)",
  } as React.CSSProperties,
} satisfies Record<string, React.CSSProperties>;

/** The home hero: as you scroll, the bay turns to dusk and the moon rises over the cliffs. */
export function MoonriseHero() {
  const ref = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const stage = stageRef.current;
    if (!el || !stage) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    // The stage pins for (section height − stage height). The stage can be taller than the viewport
    // (its min-height on a short phone in landscape), so measure it rather than assume innerHeight.
    // Read on mount and on resize only, never per scroll frame.
    let stageHeight = stage.offsetHeight;

    const write = () => {
      frame = 0;
      if (reduce.matches) {
        el.style.setProperty("--p", "0");
        return;
      }
      const rect = el.getBoundingClientRect();
      const range = rect.height - stageHeight;
      const p = range > 0 ? Math.min(1, Math.max(0, -rect.top / range)) : 0;
      el.style.setProperty("--p", p.toFixed(4));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(write);
    };

    const onResize = () => {
      stageHeight = stage.offsetHeight;
      schedule();
    };

    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    reduce.addEventListener("change", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", onResize);
      reduce.removeEventListener("change", schedule);
    };
  }, []);

  return (
    // At least 80svh of pinned scroll on any screen: the stage is max(100svh, 620px) tall, so a short landscape
    // phone needs 620px + 80svh. Reduced motion drops to the stage's own height, with nothing to scroll through.
    <section
      ref={ref}
      data-testid="moonrise-hero"
      data-hero-pin
      className="relative h-[max(180svh,620px_+_80svh)] min-h-[620px] bg-(--night) [--p:0] motion-reduce:h-[100svh]"
    >
      <div ref={stageRef} data-hero-stage className="sticky top-0 isolate flex h-[100svh] min-h-[620px] items-end overflow-hidden text-white [container-type:size]">
        <div aria-hidden className="absolute inset-0 -z-10 will-change-transform" style={STYLE.photo}>
          {/* Decorative: the h1 and the moonrise line already describe the scene. */}
          <Image src={unsplash(resort.heroImage, 2000)} alt="" fill preload sizes="100vw" className="object-cover" />
        </div>
        {/* The day scene's own shading, kept from the original hero so the first frame is unchanged. */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,rgb(18_59_57/0.55)_0%,rgb(18_59_57/0)_28%,rgb(18_59_57/0.1)_50%,rgb(12_41_40/0.88)_100%)]"
        />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(90%_55%_at_74%_40%,rgb(240_180_90/0.75),rgb(217_164_65/0.3)_40%,transparent_72%)] mix-blend-soft-light"
          style={STYLE.dusk}
        />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,rgb(7_26_25/0.94)_0%,rgb(12_41_40/0.86)_34%,rgb(18_59_57/0.62)_52%,rgb(12_41_40/0.9)_100%)]"
          style={STYLE.night}
        />

        {/* The sky: anything below the ridge line is masked away, so the moon comes up from behind the cliffs. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,#000_0%,#000_27%,transparent_45%)] md:[mask-image:linear-gradient(to_bottom,#000_0%,#000_23%,transparent_41%)]"
        >
          <div
            className="absolute top-[62%] left-[72%] size-[clamp(68px,8.5vw,128px)] -translate-x-1/2 -translate-y-1/2 will-change-transform md:left-[74%]"
            style={STYLE.moon}
          >
            <div className="absolute -inset-[140%] rounded-full bg-[radial-gradient(circle,rgb(241_213_138/0.34)_0%,rgb(217_164_65/0.12)_32%,transparent_62%)]" />
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_36%_34%,#ffe7b0_0%,#f0c46c_55%,#d9a441_100%)] shadow-[0_0_28px_6px_rgb(240_196_108/0.45)]" />
            <div
              className="absolute inset-0 rounded-full bg-[radial-gradient(ellipse_34%_26%_at_40%_40%,rgb(190_168_124/0.2),transparent_75%),radial-gradient(ellipse_16%_20%_at_66%_70%,rgb(190_168_124/0.14),transparent_75%),radial-gradient(circle_at_36%_34%,#fffdf6_0%,#f8efd6_58%,#ead9ad_100%)] shadow-[0_0_36px_10px_rgb(251_243_220/0.4)]"
              style={STYLE.moonHigh}
            />
          </div>
        </div>

        <div className="mx-auto w-full max-w-7xl px-4 pb-24 sm:px-6 md:pb-28 lg:px-10">
          <p className="flex items-center gap-2 text-base text-white/90">
            <MapPin className="size-4 text-(--sun)" aria-hidden />
            <T value={resort.location} />
          </p>
          <div className="mt-4 grid max-w-4xl">
            <h1
              className="self-end font-(family-name:--font-display) text-[2.6rem] leading-[1.2] text-balance [grid-area:1/1] sm:text-6xl lg:text-[5.25rem] lg:leading-[1.15]"
              style={STYLE.tagline}
            >
              <T value={resort.tagline} />
            </h1>
            <p
              data-testid="moonrise-line"
              className="self-end font-(family-name:--font-display) text-[2.6rem] leading-[1.2] text-balance text-(--sand) [grid-area:1/1] motion-reduce:hidden sm:text-6xl lg:text-[5.25rem] lg:leading-[1.15]"
              style={STYLE.line}
            >
              <T value={ui.heroMoonrise} />
            </p>
          </div>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/demos/resort/booking" className={`${btn} bg-(--sun) text-(--sea-deep) hover:bg-[#e6b75a] focus-visible:outline-(--sun)`}>
              <T value={ui.checkAvailability} />
            </Link>
            <Link
              href="/demos/resort/rooms"
              className={`${btn} border border-white/60 text-white backdrop-blur-sm hover:bg-white/10 focus-visible:outline-white`}
            >
              <T value={ui.viewRooms} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

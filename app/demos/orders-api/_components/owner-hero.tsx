"use client";

import { ArrowDown, Check, Pause, Play } from "lucide-react";
import { useLang } from "@/components/demo/lang";
import { ui } from "./copy";
import { DevLog } from "./dev-log";
import { LineChatMessage, clock } from "./line-message";
import { PhoneFrame } from "./line-preview";
import { beat } from "./story-motion";
import { latest, useStory, useStoryControls } from "./story-player";

const BENEFITS = [ui.benefitLine, ui.benefitStatus, ui.benefitApi];

function StoryPhone() {
  const lang = useLang();
  const frame = useStory();
  const shown = latest(frame, 4);
  const newest = shown.at(-1);
  return (
    <PhoneFrame
      screenClassName="h-[560px] sm:h-[600px]"
      statusTime={newest ? clock[lang].format(newest.time) : ""}
      data-testid="story-phone"
      role="log"
      aria-live="off"
      aria-label={ui.storyPhoneLabel[lang]}
    >
      <ol className="flex flex-col gap-3">
        {shown.map(({ key, event, fresh, time }) =>
          event.response.notification ? (
            <LineChatMessage key={key} n={event.response.notification} time={clock[lang].format(time)} className={beat(fresh, 3, "grow")} />
          ) : null,
        )}
      </ol>
    </PhoneFrame>
  );
}

function PauseButton() {
  const lang = useLang();
  const { paused, setPaused } = useStoryControls();
  // Nothing plays under reduced motion, so there is nothing to pause. CSS hides it but keeps its room,
  // so the server markup and the hydrated page match and the column never jumps.
  return (
    <button
      type="button"
      onClick={() => setPaused(!paused)}
      className="mx-auto mt-3 flex motion-reduce:invisible items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-(--muted) transition-colors hover:bg-(--panel-2) hover:text-(--text) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--text)"
    >
      {paused ? <Play className="size-3.5" aria-hidden /> : <Pause className="size-3.5" aria-hidden />}
      {paused ? ui.storyPlay[lang] : ui.storyPause[lang]}
    </button>
  );
}

/** The first screen: what the owner gets, the shop's LINE filling up, and the API call behind each message. */
export function OwnerHero() {
  const lang = useLang();
  const { watch } = useStoryControls();
  return (
    <section
      ref={watch}
      aria-labelledby="hero-title"
      className="grid gap-10 pt-8 pb-14 sm:pt-12 lg:grid-cols-[minmax(0,1fr)_280px_300px] lg:gap-6 lg:pt-14 lg:pb-16 xl:grid-cols-[minmax(0,1fr)_300px_380px] xl:gap-10"
    >
      <div className="min-w-0 lg:pt-6">
        <p className="flex items-center gap-2 text-sm leading-[1.4] font-semibold text-(--line-green-ink)">
          <span className="size-2 rounded-full bg-(--line-green)" aria-hidden />
          {ui.heroKicker[lang]}
        </p>
        <h1
          id="hero-title"
          className="display-heading mt-4 text-[2.5rem] leading-[1.1] font-semibold tracking-[-0.015em] text-balance sm:text-5xl xl:text-[3.5rem]"
        >
          {ui.heroTitle[lang]}
        </h1>
        <p className="mt-5 max-w-[34rem] text-[17px] leading-[1.65] text-(--muted)">{ui.heroSub[lang]}</p>
        <ul className="mt-7 max-w-[34rem] border-t border-(--line)">
          {BENEFITS.map((b) => (
            <li key={b.en} className="flex items-start gap-3 border-b border-(--line) py-3 text-base leading-[1.5]">
              <span className="mt-[3px] grid size-5 shrink-0 place-items-center rounded-full bg-(--line-green) text-white" aria-hidden>
                <Check className="size-3.5" strokeWidth={3} />
              </span>
              {b[lang]}
            </li>
          ))}
        </ul>
        <a
          href="#try"
          className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-(--text) px-6 text-base font-semibold text-white transition-colors hover:bg-[#2a3a31] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--text)"
        >
          {ui.tryIt[lang]}
          <ArrowDown className="size-4" aria-hidden />
        </a>
      </div>

      <div className="min-w-0">
        <StoryPhone />
        <PauseButton />
      </div>

      <DevLog className="lg:h-[calc(600px+18px)]" />
    </section>
  );
}

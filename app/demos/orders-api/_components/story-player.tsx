"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { STORY_LENGTH, storyEvents, type StoryEvent } from "@/lib/demos/orders-api/story";

/** How often the next event plays. */
const TICK_MS = 1800;
/** Events on screen right after hydration, so the page never opens empty. */
const OPENING = 3;
/** Events shown, without a timer, under reduced motion. */
const STILL = 4;

interface StoryFrame {
  /** 0 before hydration, then 1, 2, … as the story loops. Part of every React key. */
  round: number;
  /** Events below this index were already on screen when the round began, so they don't animate in. */
  base: number;
  /** How many of `events` have played. */
  count: number;
  events: StoryEvent[];
  /** When the round began (ms). Event `seq` happened `seq` minutes later. */
  at: number;
}

const EMPTY: StoryFrame = { round: 0, base: 0, count: 0, events: [], at: 0 };

export interface Played {
  key: string;
  event: StoryEvent;
  /** Whether this event arrived while watching, so it should animate in. */
  fresh: boolean;
  /** When it happened (ms). */
  time: number;
}

/** The latest `n` played events, oldest first. */
export function latest(frame: StoryFrame, n: number): Played[] {
  const from = Math.max(0, frame.count - n);
  return frame.events.slice(from, frame.count).map((event, i) => ({
    key: `${frame.round}-${event.seq}`,
    event,
    fresh: from + i >= frame.base,
    time: frame.at + event.seq * 60_000,
  }));
}

// One player per page. It lives outside React state so a tick re-renders only the three readers, nothing else.
function createPlayer() {
  let frame = EMPTY;
  const listeners = new Set<() => void>();
  const emit = () => listeners.forEach((fn) => fn());
  const round = (n: number, count: number): StoryFrame => {
    const now = new Date();
    return { round: n, base: count, count, events: storyEvents(now), at: now.getTime() };
  };
  return {
    get: () => frame,
    subscribe(fn: () => void) {
      listeners.add(fn);
      return () => {
        listeners.delete(fn);
      };
    },
    begin(count: number) {
      if (frame.round) return;
      frame = round(1, count);
      emit();
    },
    step() {
      // After the last event, a new morning starts on a clear screen.
      frame = frame.count >= STORY_LENGTH ? { ...round(frame.round + 1, 0), count: 1 } : { ...frame, count: frame.count + 1 };
      emit();
    },
  };
}

type Player = ReturnType<typeof createPlayer>;

interface StoryContext {
  player: Player;
  /** Ref for a section that shows the story. The story plays only while one of them is on screen. */
  watch: (el: HTMLElement | null) => (() => void) | undefined;
  paused: boolean;
  setPaused: (paused: boolean) => void;
}

const Ctx = createContext<StoryContext | null>(null);

const REDUCE = "(prefers-reduced-motion: reduce)";

function subscribeReduced(fn: () => void) {
  const mq = window.matchMedia(REDUCE);
  mq.addEventListener("change", fn);
  return () => mq.removeEventListener("change", fn);
}

/** True when the visitor asked for reduced motion. False on the server and during hydration. */
function useReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReduced,
    () => window.matchMedia(REDUCE).matches,
    () => false,
  );
}

/** Plays the sample story for the hero phone, the developer log and the lanes, from one timer. */
export function StoryPlayer({ children }: { children: React.ReactNode }) {
  const [player] = useState(createPlayer);
  const [paused, setPaused] = useState(false);
  const reduced = useReducedMotion();
  const targets = useRef(new Set<HTMLElement>());

  const watch = useCallback((el: HTMLElement | null) => {
    if (!el) return;
    const set = targets.current;
    set.add(el);
    return () => {
      set.delete(el);
    };
  }, []);

  useEffect(() => {
    // Read the media query live: on the first pass after hydration `reduced` may still be the server value.
    const still = window.matchMedia(REDUCE).matches;
    player.begin(still ? STILL : OPENING);
    if (still || paused || typeof IntersectionObserver === "undefined") return;

    const onScreen = new Map<Element, boolean>();
    let timer = 0;
    const sync = () => {
      const run = !document.hidden && [...onScreen.values()].some(Boolean);
      if (run && !timer) timer = window.setInterval(player.step, TICK_MS);
      if (!run && timer) {
        window.clearInterval(timer);
        timer = 0;
      }
    };
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => onScreen.set(e.target, e.isIntersecting));
      sync();
    });
    targets.current.forEach((t) => io.observe(t));
    document.addEventListener("visibilitychange", sync);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
      window.clearInterval(timer);
    };
  }, [player, paused, reduced]);

  const value = useMemo(() => ({ player, watch, paused, setPaused }), [player, watch, paused]);
  return <Ctx value={value}>{children}</Ctx>;
}

function useStoryContext(): StoryContext {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStory must be used inside <StoryPlayer>");
  return ctx;
}

/** The current frame of the story. Empty before hydration, so the server and first client render match. */
export function useStory(): StoryFrame {
  const { player } = useStoryContext();
  return useSyncExternalStore(player.subscribe, player.get, () => EMPTY);
}

export function useStoryControls() {
  const { watch, paused, setPaused } = useStoryContext();
  return { watch, paused, setPaused };
}

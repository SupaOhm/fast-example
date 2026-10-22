// Entrance motion for the story. Each event lands in three beats: the request, the API's answer 0.45 s later,
// then the LINE message 0.9 s later. CSS delays only, so the single story timer is the only timer.
const CSS = `
@keyframes oa-rise { from { opacity: 0; transform: translateY(10px) scale(0.98); } }
@keyframes oa-fade { from { opacity: 0; } }
@keyframes oa-draw { from { transform: scaleX(0); } }
@keyframes oa-drop { from { transform: scaleY(0); } }
/* A chat message: the room opens as the bubble arrives, so the chat never shows a hole while it waits. */
@keyframes oa-grow {
  from { max-height: 0; margin-top: -0.75rem; opacity: 0; transform: translateY(10px) scale(0.98); }
  60% { opacity: 0; }
  to { max-height: 16rem; }
}
.oa-rise { animation: oa-rise 0.45s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
.oa-fade { animation: oa-fade 0.3s ease-out both; }
.oa-draw { transform-origin: left center; animation: oa-draw 0.35s ease-out both; }
.oa-drop { transform-origin: center top; animation: oa-drop 0.3s ease-out both; }
.oa-grow { overflow: hidden; animation: oa-grow 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
.oa-beat-2 { animation-delay: 0.45s; }
.oa-beat-3 { animation-delay: 0.9s; }
.oa-beat-2b { animation-delay: 0.25s; }
.oa-beat-3b { animation-delay: 0.7s; }
@media (prefers-reduced-motion: reduce) {
  .oa-rise, .oa-fade, .oa-draw, .oa-drop, .oa-grow { animation: none; }
}
`;

export function StoryMotion() {
  return (
    <style href="orders-api-story-motion" precedence="default">
      {CSS}
    </style>
  );
}

/** Classes for an element entering on one of the three beats. Elements already on screen get none. */
export function beat(fresh: boolean, n: 1 | 2 | 3, kind: "rise" | "fade" | "draw" | "drop" | "grow" = "rise"): string {
  if (!fresh) return "";
  const delay = n === 1 ? "" : kind === "draw" || kind === "drop" ? (n === 2 ? "oa-beat-2b" : "oa-beat-3b") : `oa-beat-${n}`;
  return `oa-${kind} ${delay}`;
}

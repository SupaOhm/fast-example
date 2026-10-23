// The booking page's keyframes, in one hoisted, de-duplicated style block. The elements that use them
// opt in with `motion-safe:animate-[...]`, so visitors who ask for reduced motion get none of it.
const CSS = `
@keyframes lumi-pop { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
@keyframes lumi-toast { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
@keyframes lumi-land {
  0% { opacity: 0; transform: translateY(-16px) scale(0.94); }
  60% { opacity: 1; transform: translateY(2px) scale(1.01); }
  100% { opacity: 1; transform: none; }
}
/* The desktop banner, on its measured height (--banner-h, set by the component). */
@keyframes lumi-banner { from { opacity: 0; max-height: 0; } to { opacity: 1; max-height: var(--banner-h, 12rem); } }
@keyframes lumi-banner-out { from { opacity: 1; max-height: var(--banner-h, 12rem); } to { opacity: 0; max-height: 0; } }
@keyframes lumi-glow { 0% { box-shadow: 0 0 0 0 rgb(194 24 91 / 0.45); } 100% { box-shadow: 0 0 0 14px rgb(194 24 91 / 0); } }
`;

export function BookingMotion() {
  return (
    <style href="clinic-booking-motion" precedence="default">
      {CSS}
    </style>
  );
}

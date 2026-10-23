/**
 * Page-wide CSS for the shop admin, rendered once by the layout:
 * - default focus rings that read on kraft and on wood (in the base layer, so utilities still win);
 * - the rubber-stamp animation, which is off under reduced motion.
 */
export const SHOP_CSS = `
@layer base {
  .rd-shop :focus-visible { outline: 2px solid var(--ink); outline-offset: 2px; }
  .rd-shop .rd-wood :focus-visible { outline-color: var(--mustard); }
}
@keyframes rd-stamp {
  0% { opacity: 0; transform: scale(1.9) rotate(var(--stamp-tilt, -6deg)); }
  55% { opacity: 1; transform: scale(.94) rotate(var(--stamp-tilt, -6deg)); }
  100% { opacity: 1; transform: scale(1) rotate(var(--stamp-tilt, -6deg)); }
}
.rd-stamp-in { animation: rd-stamp .32s cubic-bezier(.2,.8,.3,1) both; }
@media (prefers-reduced-motion: reduce) { .rd-stamp-in { animation: none; } }
`;

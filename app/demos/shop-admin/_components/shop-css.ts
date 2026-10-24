/** A flat white panel: 1px line border, rounded-xl, a barely-there shadow. */
export const PANEL = "rounded-xl border border-(--line) bg-(--panel) shadow-[0_1px_2px_rgba(23,32,27,0.04)]";

/** The EN/TH switch, in the shell and on the login bar. */
export const LANG_SWITCH_CLASS =
  "grid min-h-10 min-w-11 place-items-center rounded-lg border border-(--line) bg-(--panel) px-2 text-base font-semibold text-(--ink) transition-colors hover:bg-(--bg)";

/**
 * Page-wide CSS for the shop admin, rendered once by the layout:
 * - default focus rings in the brand green (in the base layer, so utilities still win);
 * - `rd-fade`, a short fade-in used only under `motion-safe:`;
 * - under reduced motion, transitions keep colours and shadows but never animate a transform.
 */
export const SHOP_CSS = `
@layer base {
  .rd-shop :focus-visible { outline: 2px solid var(--brand); outline-offset: 2px; }
}
@keyframes rd-fade { from { opacity: 0; } to { opacity: 1; } }
@media (prefers-reduced-motion: reduce) {
  .rd-shop * { transition-property: color, background-color, border-color, box-shadow, text-decoration-color !important; }
}
`;

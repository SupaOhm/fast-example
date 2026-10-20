// One accent word in a heading: handwritten, lime, with a hand-drawn underline.
// Styling and the draw-in animation live in app/globals.css (.scribble).
export function Scribble({ children }: { children: React.ReactNode }) {
  return (
    <span className="scribble">
      {children}
      <svg viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <path pathLength={1} d="M1 6.5 C 22 3.5, 55 2.8, 99 4.8" />
      </svg>
    </span>
  );
}

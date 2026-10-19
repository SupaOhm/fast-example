/** Company mark: a drafting centre mark (circle + crosshair) inside a machined square. */
export function CentreMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <rect width="40" height="40" rx="3" fill="var(--navy)" />
      <circle cx="20" cy="20" r="9.5" fill="none" stroke="var(--orange)" strokeWidth="2.5" />
      <path d="M20 5v8M20 27v8M5 20h8M27 20h8" stroke="#fff" strokeWidth="2" strokeLinecap="square" />
      <circle cx="20" cy="20" r="1.8" fill="#fff" />
    </svg>
  );
}

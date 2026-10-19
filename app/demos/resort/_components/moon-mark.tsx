/** The Saeng Chan crescent: a r14 disc at (16,16) minus a r11 disc at (21,12). */
export function MoonMark({ className = "size-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={className}>
      <path d="M16.4 2A14 14 0 1 0 29.75 18.68A11 11 0 1 1 16.4 2Z" fill="var(--sun)" />
    </svg>
  );
}

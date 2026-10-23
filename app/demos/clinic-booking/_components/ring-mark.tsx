// Lumi's mark: a ring light, the lamp every skin clinic works under. Decorative.
export function RingMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={className} fill="none">
      <circle cx="16" cy="16" r="11.5" stroke="currentColor" strokeWidth="3.5" />
      <path d="M22.5 6.7a11.5 11.5 0 0 1 4.8 6.6" stroke="var(--accent)" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="16" cy="16" r="4" fill="var(--accent)" opacity="0.18" />
    </svg>
  );
}

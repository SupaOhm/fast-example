// A generic chat-bubble mark used next to LINE actions (not the LINE logo).
export function LineGlyph({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d="M12 3C6.48 3 2 6.58 2 11c0 3.95 3.55 7.24 8.36 7.88.33.07.77.22.88.5.1.26.07.66.03.92l-.14.85c-.04.26-.2 1 .87.55 1.07-.45 5.78-3.4 7.88-5.83C21.33 14.29 22 12.72 22 11c0-4.42-4.48-8-10-8Z" />
    </svg>
  );
}

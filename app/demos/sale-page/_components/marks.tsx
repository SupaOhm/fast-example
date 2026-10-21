import { Star } from "lucide-react";

/** Five-petal jasmine blossom used as the brand mark. */
export function JasmineMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      {[0, 72, 144, 216, 288].map((deg) => (
        <ellipse key={deg} cx="20" cy="10.5" rx="5.6" ry="9.5" transform={`rotate(${deg} 20 20)`} fill="currentColor" />
      ))}
      <circle cx="20" cy="20" r="3.4" fill="var(--gold)" />
    </svg>
  );
}

/** Five stars, `count` of them filled. `label` is the spoken rating, e.g. "4 out of 5 stars". */
export function Stars({
  count,
  label,
  className = "",
  starClassName = "size-4",
  empty = "currentColor",
}: {
  count: number;
  label: string;
  className?: string;
  starClassName?: string;
  empty?: string;
}) {
  return (
    <span className={`flex gap-0.5 ${className}`} role="img" aria-label={label}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={starClassName}
          aria-hidden
          strokeWidth={1.5}
          fill={i < count ? "var(--gold)" : "none"}
          stroke={i < count ? "var(--gold)" : empty}
        />
      ))}
    </span>
  );
}

/** LINE's speech bubble, drawn as a plain chat glyph for the order buttons. */
export function LineBubble({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="currentColor"
        d="M12 2.6c-5.7 0-10.3 3.7-10.3 8.3 0 4.1 3.6 7.5 8.6 8.2.3.1.8.2.9.5.1.3.1.7 0 1l-.1.9c0 .3-.2 1 .9.5 1.1-.5 6.1-3.6 8.3-6.1 1.5-1.7 2.2-3.3 2.2-5 0-4.6-4.6-8.3-10.5-8.3Z"
      />
    </svg>
  );
}

/**
 * The fat LINE button: LINE green, white 20px heavy text (large text, 4.10:1),
 * sitting on a solid darker slab that it presses into.
 */
export function lineButtonClass(ring: "gold" | "ink" = "gold") {
  return `inline-flex items-center justify-center gap-3 rounded-xl bg-(--line-green) py-4 leading-[1.25] font-extrabold text-white shadow-[0_6px_0_var(--line-deep)] transition-[translate,box-shadow] duration-100 hover:translate-y-0.5 hover:shadow-[0_4px_0_var(--line-deep)] active:translate-y-1.5 active:shadow-[0_0_0_var(--line-deep)] motion-reduce:transition-none focus-visible:outline-3 focus-visible:outline-offset-[5px] ${
    ring === "gold" ? "focus-visible:outline-(--gold)" : "focus-visible:outline-(--green-deep)"
  }`;
}

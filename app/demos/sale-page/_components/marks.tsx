import { Star } from "lucide-react";

/** Five-petal jasmine blossom used as the brand mark. */
export function JasmineMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      {[0, 72, 144, 216, 288].map((deg) => (
        <ellipse
          key={deg}
          cx="20"
          cy="10.5"
          rx="5.6"
          ry="9.5"
          transform={`rotate(${deg} 20 20)`}
          fill="currentColor"
        />
      ))}
      <circle cx="20" cy="20" r="3.4" fill="var(--gold)" />
    </svg>
  );
}

/** Scalloped, petal-edged promo seal: the page's one loud element. */
export function PromoSeal({ percent, className }: { percent: number; className?: string }) {
  const scallops = Array.from({ length: 14 }, (_, i) => (i * 360) / 14);
  return (
    <div className={`grid place-items-center ${className ?? ""}`}>
      <svg viewBox="0 0 100 100" className="absolute inset-0 size-full drop-shadow-md" aria-hidden>
        {scallops.map((deg) => (
          <circle
            key={deg}
            cx="50"
            cy="9"
            r="9"
            transform={`rotate(${deg} 50 50)`}
            fill="var(--gold)"
          />
        ))}
        <circle cx="50" cy="50" r="41" fill="var(--gold)" />
        <circle
          cx="50"
          cy="50"
          r="34"
          fill="none"
          stroke="var(--cream)"
          strokeOpacity="0.55"
          strokeWidth="0.8"
          strokeDasharray="1.5 2.5"
        />
      </svg>
      <p className="relative text-center leading-[1.15] text-(--cream)">
        <span className="block text-[0.8em] font-light">ลด</span>
        <span className="block text-[1.9em] font-semibold">{percent}%</span>
      </p>
    </div>
  );
}

export function Stars({ count, className }: { count: number; className?: string }) {
  return (
    <span className={`flex gap-0.5 ${className ?? ""}`} role="img" aria-label={`${count} จาก 5 ดาว`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className="size-4"
          aria-hidden
          fill={i < count ? "var(--gold)" : "none"}
          stroke={i < count ? "var(--gold)" : "var(--line)"}
        />
      ))}
    </span>
  );
}

/** A tiny dropper-bottle silhouette; bundles show one per bottle. */
export function BottleGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 32" className={className} aria-hidden>
      <rect x="6" y="0" width="4" height="7" rx="2" fill="currentColor" opacity="0.55" />
      <rect x="5" y="7" width="6" height="4" rx="0.8" fill="currentColor" opacity="0.8" />
      <rect x="1.5" y="11" width="13" height="21" rx="3.5" fill="currentColor" />
      <rect x="4" y="18" width="8" height="7" rx="1" fill="var(--cream)" opacity="0.6" />
    </svg>
  );
}

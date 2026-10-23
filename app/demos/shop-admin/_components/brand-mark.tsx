/**
 * ร้านดี's shop sign: a mustard board hung from a nail, "ดี" painted on it.
 * The cord and nail take `currentColor`, so the sign reads on wood and on kraft.
 */
export function BrandMark({ className = "size-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 44 44" aria-hidden className={`shrink-0 ${className}`}>
      <path d="M22 5 9.5 15.5M22 5l12.5 10.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="22" cy="4.6" r="2.3" fill="currentColor" />
      <g transform="rotate(-3 22 28)">
        <rect x="4" y="14" width="36" height="27" rx="4" fill="#e2b04a" stroke="#2b2217" strokeWidth="1.6" />
        <rect x="7" y="17" width="30" height="21" rx="2" fill="none" stroke="#2b2217" strokeWidth="1" strokeDasharray="2.2 1.8" opacity=".55" />
        <text
          x="22"
          y="34.5"
          textAnchor="middle"
          fontFamily="inherit"
          fontSize="17"
          fontWeight="700"
          fill="#2b2217"
        >
          ดี
        </text>
      </g>
    </svg>
  );
}

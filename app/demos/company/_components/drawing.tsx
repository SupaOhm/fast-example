/** Technical-drawing vernacular: dimension lines and the blueprint grid used on navy bands. */

export const gridStyle: React.CSSProperties = {
  backgroundImage:
    "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
  backgroundSize: "32px 32px",
};

function Arrow({ dir }: { dir: "left" | "right" }) {
  return (
    <svg viewBox="0 0 10 8" className="h-2 w-2.5 shrink-0" aria-hidden>
      <path d={dir === "left" ? "M0 4 10 0v8z" : "M10 4 0 0v8z"} fill="currentColor" />
    </svg>
  );
}

/** A horizontal dimension: extension ticks, arrowheads, and a centred value. */
export function DimensionLine({ label, className = "" }: { label: string; className?: string }) {
  return (
    <div className={`flex items-center text-(--orange) ${className}`} aria-hidden>
      <span className="h-4 w-px bg-current" />
      <Arrow dir="left" />
      <span className="h-px flex-1 bg-current" />
      <span className="px-3 text-[13px] leading-[1.3] font-medium whitespace-nowrap tabular-nums">{label}</span>
      <span className="h-px flex-1 bg-current" />
      <Arrow dir="right" />
      <span className="h-4 w-px bg-current" />
    </div>
  );
}

/** Corner registration marks around a framed image. */
export function CropMarks() {
  const base = "absolute size-4 border-(--orange)";
  return (
    <span aria-hidden>
      <span className={`${base} -top-2 -left-2 border-t-2 border-l-2`} />
      <span className={`${base} -top-2 -right-2 border-t-2 border-r-2`} />
      <span className={`${base} -bottom-2 -left-2 border-b-2 border-l-2`} />
      <span className={`${base} -right-2 -bottom-2 border-r-2 border-b-2`} />
    </span>
  );
}

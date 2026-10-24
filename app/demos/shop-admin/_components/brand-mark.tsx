/** ร้านดี's mark: "ดี" on a green square. Decorative; the shop name always sits next to it. */
export function BrandMark({ className = "size-9 text-base" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`grid shrink-0 place-items-center rounded-[10px] bg-(--brand) font-semibold leading-[1.2] text-white shadow-[inset_0_-2px_0_rgba(0,0,0,0.18)] ${className}`}
    >
      ดี
    </span>
  );
}

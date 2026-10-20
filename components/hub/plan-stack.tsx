import Image from "next/image";

// A plan's pages fanned out: 1, 3 or 5 screenshots, so the bigger plan visibly holds more.
// The first page (the demo's home) sits in front, in the middle; the rest alternate left, right, left, right.
// Geometry lives in globals.css (.plan-stack); hovering the plan card spreads and enlarges the fan.
export function PlanStack({ pages, className = "" }: { pages: string[]; className?: string }) {
  return (
    <div aria-hidden className={`plan-stack relative ${className}`}>
      {pages.map((src, i) => {
        const o = i === 0 ? 0 : i % 2 === 1 ? -Math.ceil(i / 2) : Math.ceil(i / 2);
        return (
          <div
            key={src}
            className="absolute bottom-0 left-1/2 aspect-[16/10] w-[68%] origin-bottom overflow-hidden rounded-md bg-white shadow-[0_18px_40px_#0009,0_0_0_1px_#ffffff1a]"
            style={{ "--o": o, "--ao": Math.abs(o), zIndex: 10 - Math.abs(o) } as React.CSSProperties}
          >
            <Image
              src={src}
              alt=""
              width={640}
              height={400}
              sizes="(min-width: 768px) 24vw, 60vw"
              className="h-full w-full object-cover object-top"
            />
          </div>
        );
      })}
    </div>
  );
}

import Image from "next/image";

// A plan's pages fanned out: 1, 3 or 5 screenshots, so the bigger plan visibly holds more.
export function PlanStack({ pages, className = "" }: { pages: string[]; className?: string }) {
  const mid = (pages.length - 1) / 2;
  return (
    <div aria-hidden className={`relative ${className}`}>
      {pages.map((src, i) => {
        const o = i - mid;
        return (
          <div
            key={src}
            className="absolute bottom-0 left-1/2 aspect-[16/10] w-[58%] origin-bottom overflow-hidden rounded-md bg-white shadow-[0_18px_40px_#0009,0_0_0_1px_#ffffff1a]"
            style={{
              transform: `translateX(calc(-50% + ${o * 34}px)) translateY(${Math.abs(o) * 10}px) rotate(${o * 7}deg)`,
              zIndex: 10 - Math.abs(o),
            }}
          >
            <Image
              src={src}
              alt=""
              width={640}
              height={400}
              sizes="(min-width: 768px) 20vw, 50vw"
              className="h-full w-full object-cover object-top"
            />
          </div>
        );
      })}
    </div>
  );
}

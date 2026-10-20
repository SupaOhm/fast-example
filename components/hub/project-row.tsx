import Image from "next/image";
import Link from "next/link";
import type { Dictionary, Locale } from "@/lib/i18n";
import { formatTHB, type Package } from "@/lib/packages";

export function ProjectRow({ pkg, index, locale, t }: { pkg: Package; index: number; locale: Locale; t: Dictionary }) {
  const flip = index % 2 === 1;
  return (
    <article
      data-testid={`package-${pkg.id}`}
      className="grid items-center gap-6 border-t border-rule py-12 md:grid-cols-[11fr_9fr] md:gap-12 lg:py-16"
    >
      <Link
        href={pkg.demoPath}
        prefetch={false}
        tabIndex={-1}
        aria-hidden
        className={`group block overflow-hidden rounded-xl border border-rule ${flip ? "md:order-2" : ""}`}
      >
        <Image
          src={`/thumbs/${pkg.id}.jpg`}
          alt=""
          width={1440}
          height={900}
          sizes="(min-width: 768px) 55vw, 100vw"
          className="aspect-[16/10] w-full object-cover object-top transition duration-500 group-hover:scale-[1.02]"
        />
      </Link>
      <div className={flip ? "md:order-1" : ""}>
        <p aria-hidden className="font-display text-5xl font-extrabold tracking-[-0.04em] text-lime">
          {String(index + 1).padStart(2, "0")}
        </p>
        <h4 className="display-heading mt-3 font-display text-2xl leading-tight font-extrabold tracking-[-0.02em] sm:text-3xl">
          {pkg.demoName[locale]}
        </h4>
        <p className="mt-6 text-xs font-semibold text-cream-muted">{t.work.tryHeading}</p>
        <ul className="mt-2 space-y-2">
          {t.work.try[pkg.id].map((item) => (
            <li key={item} className="flex gap-3 leading-relaxed">
              <span aria-hidden className="text-lime">
                →
              </span>
              {item}
            </li>
          ))}
        </ul>
        <p className="mt-6 flex flex-wrap items-baseline gap-x-3">
          <span className="text-sm text-cream-muted">{t.work.tiers[pkg.tier]}</span>
          <span className="font-display text-3xl font-extrabold">{formatTHB(pkg.priceTHB)}</span>
        </p>
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {pkg.scope[locale].map((item) => (
            <li key={item} className="rounded-md border border-rule px-2.5 py-1 text-xs text-cream-muted">
              {item}
            </li>
          ))}
        </ul>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            href={pkg.demoPath}
            prefetch={false}
            className="rounded-md bg-lime px-5 py-3 text-sm font-bold text-forest transition hover:bg-cream"
          >
            {t.work.tryLive}
          </Link>
          <a
            href={pkg.fastworkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border border-cream/40 px-5 py-3 text-sm font-semibold transition hover:border-cream"
          >
            {t.work.order}
            <span className="sr-only"> {t.nav.newTab}</span>
          </a>
        </div>
      </div>
    </article>
  );
}

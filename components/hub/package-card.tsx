import Image from "next/image";
import Link from "next/link";
import type { Dictionary, Locale } from "@/lib/i18n";
import { formatTHB, type Package } from "@/lib/packages";

export function PackageCard({ pkg, locale, t }: { pkg: Package; locale: Locale; t: Dictionary }) {
  return (
    <article
      data-testid={`package-${pkg.id}`}
      className="flex flex-col rounded-3xl border border-line bg-white/55 p-5 transition hover:border-ink/30"
    >
      <Link
        href={pkg.demoPath}
        prefetch={false}
        tabIndex={-1}
        aria-hidden
        className="block overflow-hidden rounded-2xl border border-line"
      >
        <Image
          src={`/thumbs/${pkg.id}.jpg`}
          alt=""
          width={1440}
          height={900}
          sizes="(min-width: 768px) 33vw, 100vw"
          className="aspect-[16/10] w-full object-cover object-top transition duration-500 hover:scale-[1.03]"
        />
      </Link>
      <div className="mt-5 flex items-baseline justify-between gap-3">
        <h3 className="font-display text-xl font-bold">{t.services.tiers[pkg.tier]}</h3>
        <p className="text-right">
          <span className="font-display text-2xl font-bold">{formatTHB(pkg.priceTHB)}</span>{" "}
          <span className="text-xs text-muted">{t.services.perProject}</span>
        </p>
      </div>
      <ul className="mt-4 space-y-1.5 text-sm text-muted">
        {pkg.scope[locale].map((item) => (
          <li key={item} className="flex gap-2">
            <span aria-hidden className="text-accent">
              —
            </span>
            {item}
          </li>
        ))}
      </ul>
      <div className="mt-auto flex flex-wrap gap-2 pt-6">
        <Link
          href={pkg.demoPath}
          prefetch={false}
          className="flex-1 rounded-full bg-ink px-4 py-2.5 text-center text-sm font-semibold text-paper transition hover:bg-accent"
        >
          {t.services.viewDemo}
        </Link>
        <a
          href={pkg.fastworkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 rounded-full border border-ink/20 px-4 py-2.5 text-center text-sm font-semibold transition hover:border-ink"
        >
          {t.services.order}
        </a>
      </div>
    </article>
  );
}

import Link from "next/link";
import type { Dictionary, Locale } from "@/lib/i18n";
import { formatTHB, type Package, type PackageId } from "@/lib/packages";

// Stand-in preview until Task 11 replaces it with real screenshots.
const previewTone: Record<PackageId, string> = {
  "web-basic": "linear-gradient(135deg,#f6efe2,#d9e4cf)",
  "web-standard": "linear-gradient(135deg,#1d2a3f,#3c5a80)",
  "web-premium": "linear-gradient(135deg,#e9dcc6,#5e8c88)",
  "app-basic": "linear-gradient(135deg,#0f1115,#283041)",
  "app-standard": "linear-gradient(135deg,#eef2ef,#7fb59a)",
  "app-premium": "linear-gradient(135deg,#fbe9ea,#d98a96)",
};

export function PackageCard({ pkg, locale, t }: { pkg: Package; locale: Locale; t: Dictionary }) {
  return (
    <article
      data-testid={`package-${pkg.id}`}
      className="flex flex-col rounded-3xl border border-line bg-white/55 p-5 transition hover:border-ink/30"
    >
      <Link href={pkg.demoPath} prefetch={false} tabIndex={-1} aria-hidden className="block overflow-hidden rounded-2xl">
        <div className="flex aspect-[16/10] items-end p-4" style={{ background: previewTone[pkg.id] }}>
          <span className="rounded-full bg-white/85 px-3 py-1 text-xs font-medium text-ink">
            {pkg.demoName[locale]}
          </span>
        </div>
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

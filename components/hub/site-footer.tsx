import type { Dictionary } from "@/lib/i18n";
import { FASTWORK_PROFILE_URL } from "@/lib/packages";

export function SiteFooter({ t }: { t: Dictionary }) {
  return (
    <footer className="bg-forest text-cream">
      <div className="bg-lime text-forest">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <h2 className="display-heading max-w-3xl font-display text-4xl leading-none font-extrabold tracking-[-0.04em] sm:text-6xl">
            {t.cta.heading}
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed sm:text-lg">{t.cta.body}</p>
          <a
            href={FASTWORK_PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-block rounded-md bg-forest px-6 py-3.5 text-sm font-bold text-lime transition hover:bg-forest-2"
          >
            {t.cta.button}
            <span className="sr-only"> {t.nav.newTab}</span>
          </a>
        </div>
      </div>
      <p className="mx-auto max-w-6xl px-4 py-6 text-xs text-cream-muted sm:px-6">
        {t.footer.note} · © {new Date().getFullYear()} SupaOhm
      </p>
    </footer>
  );
}

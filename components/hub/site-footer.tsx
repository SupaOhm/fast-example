import type { Dictionary } from "@/lib/i18n";
import { FASTWORK_PROFILE_URL } from "@/lib/packages";

export function SiteFooter({ t }: { t: Dictionary }) {
  return (
    <footer className="px-4 pb-8 sm:px-6">
      <div className="mx-auto max-w-6xl rounded-[2rem] bg-ink px-6 py-14 text-paper sm:px-12">
        <h2 className="font-display text-3xl font-bold leading-[1.2] sm:text-5xl">{t.footer.heading}</h2>
        <p className="mt-4 max-w-xl leading-relaxed text-paper/70">{t.footer.body}</p>
        <a
          href={FASTWORK_PROFILE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-block rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-paper hover:text-ink"
        >
          {t.footer.button}
        </a>
      </div>
      <p className="mx-auto mt-6 max-w-6xl text-xs text-muted">
        {t.footer.note} · © {new Date().getFullYear()} SupaOhm
      </p>
    </footer>
  );
}

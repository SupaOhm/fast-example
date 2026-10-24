"use client";

// Back to the hub's work section. The href works without JavaScript; on click it carries the service picked
// here (?service=, kept in the URL by CompareView), so the hub opens on the same tab.
export function BackToWork({ locale, label }: { locale: string; label: string }) {
  return (
    <a
      href={`/${locale}#work`}
      onClick={(e) => {
        const service = new URLSearchParams(window.location.search).get("service");
        if (service) e.currentTarget.href = `/${locale}?service=${encodeURIComponent(service)}#work`;
      }}
      className="-ml-1 inline-flex min-h-11 items-center gap-2 rounded-sm px-1 text-cream-muted transition hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime"
    >
      <span aria-hidden>←</span>
      {label}
    </a>
  );
}

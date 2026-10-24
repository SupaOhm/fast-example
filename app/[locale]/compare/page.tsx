import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BackToWork } from "@/components/compare/back-to-work";
import { CompareView } from "@/components/compare/compare-view";
import { RememberLocale } from "@/components/hub/remember-locale";
import { SiteFooter } from "@/components/hub/site-footer";
import { SiteHeader } from "@/components/hub/site-header";
import { getDictionary, isLocale } from "@/lib/i18n";
import { serviceTiles } from "@/lib/packages";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  return {
    title: t.compare.metaTitle,
    description: t.compare.metaDescription,
    alternates: { languages: { th: "/th/compare", en: "/en/compare", "x-default": "/en/compare" } },
  };
}

export default async function ComparePage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  return (
    <>
      <RememberLocale locale={locale} />
      <SiteHeader locale={locale} t={t} path="/compare" />
      <main className="bg-forest text-cream">
        <div className="mx-auto max-w-6xl px-4 pt-8 pb-20 sm:px-6 lg:pt-12 lg:pb-28">
          <BackToWork locale={locale} label={t.compare.back} />
          <h1 className="mt-6 display-heading font-display text-4xl leading-none font-extrabold tracking-[-0.04em] sm:text-6xl">
            {t.compare.heading}
          </h1>
          <p className="mt-4 max-w-xl leading-relaxed text-cream-muted">{t.compare.intro}</p>
          <div className="mt-8">
            <CompareView
              locale={locale}
              tiles={serviceTiles(locale)}
              labels={{
                services: t.work.servicesLabel,
                plansFrom: t.work.plansFrom,
                tryDemo: t.work.tryDemo,
                included: t.work.included,
                notIncluded: t.work.notIncluded,
                tiers: t.work.tiers,
              }}
            />
          </div>
        </div>
      </main>
      <SiteFooter locale={locale} t={t} path="/compare" />
    </>
  );
}

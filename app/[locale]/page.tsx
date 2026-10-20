import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AboutSection } from "@/components/hub/about-section";
import { Hero } from "@/components/hub/hero";
import { ProcessSection } from "@/components/hub/process-section";
import { RememberLocale } from "@/components/hub/remember-locale";
import { WorkSection } from "@/components/hub/work-section";
import { SiteFooter } from "@/components/hub/site-footer";
import { SiteHeader } from "@/components/hub/site-header";
import { getDictionary, isLocale } from "@/lib/i18n";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  return {
    title: t.meta.title,
    description: t.meta.description,
    alternates: { languages: { th: "/th", en: "/en" } },
  };
}

export default async function HubPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  return (
    <>
      <RememberLocale locale={locale} />
      <SiteHeader locale={locale} t={t} />
      <main>
        <Hero t={t} />
        <WorkSection locale={locale} t={t} />
        <ProcessSection t={t} />
        <AboutSection t={t} />
      </main>
      <SiteFooter t={t} />
    </>
  );
}

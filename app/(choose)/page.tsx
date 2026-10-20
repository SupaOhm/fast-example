import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SupaOhm | Choose your language · เลือกภาษา",
  description: "Websites and web apps with live demos. รับทำเว็บไซต์และเว็บแอป พร้อมเดโม่ให้ลอง",
  alternates: { languages: { en: "/en", th: "/th", "x-default": "/" } },
};

const CHOICES = [
  { href: "/en", lang: "en", name: "English", note: "Continue in English" },
  { href: "/th", lang: "th", name: "ภาษาไทย", note: "ดูต่อเป็นภาษาไทย" },
] as const;

export default function ChooseLanguagePage() {
  return (
    <main className="grid min-h-dvh place-items-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-forest-2 p-8 text-center ring-1 ring-rule ring-inset sm:p-10">
        <p className="font-display text-2xl font-extrabold tracking-[-0.03em]">SupaOhm</p>
        <h1 className="mt-8 font-display text-3xl leading-tight font-extrabold tracking-[-0.03em]">Choose your language</h1>
        <p lang="th" className="mt-1 text-lg text-cream-muted">
          เลือกภาษา
        </p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {CHOICES.map((c) => (
            <a
              key={c.lang}
              href={c.href}
              hrefLang={c.lang}
              lang={c.lang}
              className="rounded-xl border border-cream/40 px-4 py-4 transition hover:border-lime hover:bg-lime hover:text-forest focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime"
            >
              <span className="block text-lg font-bold">{c.name}</span>
              <span className="mt-0.5 block text-xs opacity-70">{c.note}</span>
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}

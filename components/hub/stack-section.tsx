import type { Dictionary } from "@/lib/i18n";

const STACK = ["Next.js", "React", "TypeScript", "Tailwind CSS", "Node.js", "Python", "PostgreSQL", "Supabase", "Vercel"];

export function StackSection({ t }: { t: Dictionary }) {
  return (
    <section id="stack" className="scroll-mt-20 border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-20 sm:px-6 md:grid-cols-[1fr_2fr]">
        <div>
          <h2 className="font-display text-3xl font-bold sm:text-4xl">{t.stack.heading}</h2>
          <p className="mt-4 text-sm leading-relaxed text-muted">{t.stack.body}</p>
        </div>
        <ul className="flex flex-wrap content-start gap-2">
          {STACK.map((tool) => (
            <li key={tool} className="rounded-full border border-line bg-white/55 px-4 py-2 text-sm font-medium">
              {tool}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

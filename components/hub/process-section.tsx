import Image from "next/image";
import type { Dictionary } from "@/lib/i18n";

// Syntax-coloured lines for the Build step: [text, colour class].
const CODE: [string, string?][][] = [
  [["export", "text-lime"], [" "], ["function", "text-sky"], [" Contact() {"]],
  [["  "], ["return", "text-lime"], [" <Form"]],
  [["    onSubmit={send}"]],
  [["  />"]],
  [["}"]],
];

// A small picture of what the buyer sees at each step. Decorative; the step text carries the meaning.
function Artefact({ step, t }: { step: number; t: Dictionary }) {
  const a = t.process.artefacts;
  if (step === 0)
    return (
      <div className="flex h-full flex-col justify-center gap-1.5 p-2 text-[10px] leading-snug sm:gap-2 sm:p-2.5 sm:text-[11px]">
        <p className="max-w-[90%] self-start rounded-[10px] rounded-bl-[3px] bg-cream px-2 py-1 sm:max-w-[85%] sm:px-2.5 sm:py-1.5 text-forest">{a.ask}</p>
        <p className="max-w-[90%] self-end rounded-[10px] rounded-br-[3px] bg-lime px-2 py-1 sm:max-w-[85%] sm:px-2.5 sm:py-1.5 text-forest">{a.reply}</p>
      </div>
    );
  if (step === 1)
    return (
      <div className="absolute inset-x-[18px] inset-y-3.5 rounded-md border-[1.5px] border-dashed border-cream/35 p-2">
        <div className="h-2.5 w-2/5 rounded-sm bg-cream/15" />
        <div className="mt-2 h-5 w-3/5 rounded-sm bg-cream/15" />
        <div className="mt-2 grid grid-cols-3 gap-1.5">
          <div className="h-6 rounded-sm bg-cream/15" />
          <div className="h-6 rounded-sm bg-cream/15" />
          <div className="h-6 rounded-sm bg-cream/15" />
        </div>
      </div>
    );
  if (step === 2)
    return (
      <div className="p-2.5 font-mono text-[9px] leading-[1.55] sm:p-3 sm:text-[11px] whitespace-pre text-cream-muted">
        {CODE.map((line, i) => (
          <div key={i}>
            {line.map(([text, cls], j) => (
              <span key={j} className={cls}>
                {text}
              </span>
            ))}
          </div>
        ))}
      </div>
    );
  if (step === 3)
    return (
      <>
        <Image
          src="/thumbs/pages/web-standard-1.jpg"
          alt=""
          width={640}
          height={400}
          sizes="240px"
          className="absolute inset-x-3.5 inset-y-3 h-[calc(100%-1.5rem)] w-[calc(100%-1.75rem)] rounded-md object-cover object-top"
        />
        <span className="absolute top-8 left-8 h-10 w-24 -rotate-6 rounded-[50%] border-2 border-lime" />
        <span className="hand-note absolute right-4 bottom-3 -rotate-3 rounded bg-forest px-1.5 py-0.5 text-sm text-lime">
          {a.note}
        </span>
      </>
    );
  return (
    <div className="grid h-full content-center gap-1.5 p-2.5 text-[10px] sm:p-3.5 sm:text-[11.5px]">
      {[
        [a.source, ".zip"],
        [a.live, a.online],
        [a.handover, ".pdf"],
      ].map(([name, tag]) => (
        <div key={name} className="flex justify-between gap-2 rounded-md bg-forest px-2 py-1.5 sm:px-2.5">
          <span>{name}</span>
          <span className="text-lime">{tag}</span>
        </div>
      ))}
    </div>
  );
}

export function ProcessSection({ t }: { t: Dictionary }) {
  return (
    <section id="process" className="scroll-mt-16 border-t border-rule bg-forest text-cream">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-24">
        <h2 className="display-heading font-display text-4xl leading-none font-extrabold tracking-[-0.04em] sm:text-5xl">
          {t.process.heading}
        </h2>
        <ol className="mt-10 grid gap-6 lg:grid-cols-5 lg:gap-3.5">
          {t.process.steps.map((step, i) => (
            <li
              key={step.title}
              className="grid grid-cols-[minmax(0,10.5rem)_1fr] items-start gap-4 sm:grid-cols-[minmax(0,13rem)_1fr] lg:block"
            >
              <div aria-hidden className="relative h-[120px] overflow-hidden rounded-[10px] bg-forest-2 ring-1 ring-rule ring-inset">
                <Artefact step={i} t={t} />
              </div>
              <div>
                <h3 className="font-display text-[19px] leading-tight font-extrabold tracking-[-0.03em] lg:mt-3.5">
                  <span className="mr-2 text-lime">{i + 1}</span>
                  {step.title}
                </h3>
                <p className="mt-1 text-[13px] leading-relaxed text-cream-muted">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

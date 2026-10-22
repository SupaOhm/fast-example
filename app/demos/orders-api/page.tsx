import { T } from "@/components/demo/lang";
import { ui } from "./_components/copy";
import { OwnerHero } from "./_components/owner-hero";
import { Playground } from "./_components/playground";
import { Reference } from "./_components/reference";
import { SiteHeader } from "./_components/site-header";
import { StoryLanes } from "./_components/story-lanes";
import { StoryMotion } from "./_components/story-motion";
import { StoryPlayer } from "./_components/story-player";
import { TryIntro } from "./_components/try-intro";

export default function OrdersApiPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[1320px] px-4 pb-28 lg:px-8">
        <StoryMotion />
        <StoryPlayer>
          <OwnerHero />
          <StoryLanes />
        </StoryPlayer>

        <section id="try" aria-labelledby="try-heading" className="scroll-mt-6 border-t border-(--line) py-14 lg:py-20">
          <TryIntro />
          <Playground />
        </section>

        <Reference />

        <footer className="border-t border-(--line) pt-8 text-sm leading-[1.6] text-(--muted)">
          <T value={ui.footer} />
        </footer>
      </main>
    </>
  );
}

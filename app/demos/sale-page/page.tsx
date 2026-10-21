import { CountdownBar } from "./_components/countdown-bar";
import { DayTimeline } from "./_components/day-timeline";
import { Hero } from "./_components/hero";
import { OrderSection } from "./_components/order-section";
import { Benefits, Faq, Ingredients, Reviews, SiteFooter } from "./_components/sections";
import { SiteHeader } from "./_components/site-header";

export default function SalePage() {
  return (
    <>
      <CountdownBar />
      <SiteHeader />
      <main>
        <Hero />
        <DayTimeline />
        <Benefits />
        <Ingredients />
        <Reviews />
        <OrderSection />
        <Faq />
      </main>
      <SiteFooter />
    </>
  );
}

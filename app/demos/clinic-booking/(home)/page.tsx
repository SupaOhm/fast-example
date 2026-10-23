import type { Metadata } from "next";
import { HomeHeader } from "../_components/home-header";
import { HomeHero } from "../_components/home-hero";
import { ClinicInfo, HomeFooter, HowBooking, Team, Treatments } from "../_components/home-sections";

export const metadata: Metadata = { title: "Skin clinic · คลินิกดูแลผิว" };

export default function ClinicHome() {
  return (
    <>
      <HomeHeader />
      <main>
        <HomeHero />
        <Treatments />
        <Team />
        <ClinicInfo />
        <HowBooking />
      </main>
      <HomeFooter />
    </>
  );
}

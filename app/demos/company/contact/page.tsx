import { Clock, Mail, MapPin, Phone } from "lucide-react";
import type { Metadata } from "next";
import { T } from "@/components/demo/lang";
import { company } from "@/lib/demos/company/content";
import { ui } from "../_components/copy";
import { PageHeader } from "../_components/page-header";
import { ContactForm } from "./contact-form";
import { MapPlaceholder } from "./map-placeholder";

export const metadata: Metadata = { title: "Contact · ติดต่อเรา", description: ui.contactIntro.en };

const info = [
  { icon: MapPin, label: ui.addressLabel, value: <T value={company.address} /> },
  {
    icon: Phone,
    label: ui.phoneLabel,
    value: (
      <>
        {company.phone} <T value={ui.sample} />
      </>
    ),
  },
  {
    icon: Mail,
    label: ui.emailLabel,
    value: (
      <>
        {company.email} <T value={ui.sample} />
      </>
    ),
  },
  { icon: Clock, label: ui.hoursLabel, value: <T value={company.hours} /> },
];

export default function ContactPage() {
  return (
    <main>
      <PageHeader crumb={ui.contact} title={ui.requestQuote} intro={ui.contactIntro} />

      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 lg:grid-cols-[1.3fr_1fr] lg:gap-12 lg:px-8 lg:py-20">
        <section aria-labelledby="form-heading" className="border border-(--line) bg-white p-5 sm:p-8">
          <h2 id="form-heading" className="text-2xl leading-[1.3] font-bold text-(--navy)">
            <T value={ui.formHeading} />
          </h2>
          <p className="mt-2 text-base leading-[1.6] text-(--muted)">
            <T value={ui.requiredBefore} /> <span className="font-bold text-(--orange-ink)">*</span> <T value={ui.requiredAfter} />
          </p>
          <ContactForm />
        </section>

        <aside className="space-y-6">
          <section aria-labelledby="info-heading" className="bg-(--navy) p-6 text-white sm:p-8">
            <h2 id="info-heading" className="text-xl leading-[1.3] font-bold">
              <T value={company.name} />
            </h2>
            <dl className="mt-6 space-y-5">
              {info.map(({ icon: Icon, label, value }) => (
                <div key={label.en} className="flex gap-4">
                  <Icon className="mt-0.5 size-5 shrink-0 text-(--orange)" aria-hidden />
                  <div>
                    <dt className="text-sm leading-[1.4] text-white/60"><T value={label} />
                    </dt>
                    <dd className="mt-0.5 text-base leading-[1.6]">{value}</dd>
                  </div>
                </div>
              ))}
            </dl>
            <p className="mt-6 border-t border-white/15 pt-4 text-sm leading-[1.5] text-white/60">
              <T value={ui.contactNote} />
            </p>
          </section>

          <MapPlaceholder />
        </aside>
      </div>
    </main>
  );
}

import { Clock, Mail, MapPin, Phone } from "lucide-react";
import type { Metadata } from "next";
import { company } from "@/lib/demos/company/content";
import { PageHeader } from "../_components/page-header";
import { ContactForm } from "./contact-form";
import { MapPlaceholder } from "./map-placeholder";

export const metadata: Metadata = {
  title: "ติดต่อเรา",
  description: "ขอใบเสนอราคางานกลึง CNC งานโครงสร้าง และระบบอัตโนมัติ ตอบกลับภายใน 48 ชั่วโมง",
};

const info = [
  { icon: MapPin, label: "ที่อยู่โรงงาน", value: company.address },
  { icon: Phone, label: "โทรศัพท์", value: company.phone },
  { icon: Mail, label: "อีเมลฝ่ายขาย", value: `${company.email} (ตัวอย่าง)` },
  { icon: Clock, label: "เวลาทำการ", value: company.hours },
];

export default function ContactPage() {
  return (
    <main>
      <PageHeader
        crumb="ติดต่อเรา"
        title="ขอใบเสนอราคา"
        intro="บอกเราว่าต้องการผลิตอะไร จำนวนเท่าไร ทีมขายจะติดต่อกลับพร้อมใบเสนอราคาภายใน 48 ชั่วโมง"
      />

      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 lg:grid-cols-[1.3fr_1fr] lg:gap-12 lg:px-8 lg:py-20">
        <section aria-labelledby="form-heading" className="border border-(--line) bg-white p-5 sm:p-8">
          <h2 id="form-heading" className="text-2xl leading-[1.3] font-bold text-(--navy)">
            แบบฟอร์มขอใบเสนอราคา
          </h2>
          <p className="mt-2 text-[15px] leading-[1.6] text-(--muted)">
            ช่องที่มีเครื่องหมาย <span className="font-bold text-(--orange-ink)">*</span> จำเป็นต้องกรอก
          </p>
          <ContactForm />
        </section>

        <aside className="space-y-6">
          <section aria-labelledby="info-heading" className="bg-(--navy) p-6 text-white sm:p-8">
            <h2 id="info-heading" className="text-xl leading-[1.3] font-bold">
              {company.name}
            </h2>
            <dl className="mt-6 space-y-5">
              {info.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex gap-4">
                  <Icon className="mt-0.5 size-5 shrink-0 text-(--orange)" aria-hidden />
                  <div>
                    <dt className="text-[13px] leading-[1.4] text-white/60">{label}</dt>
                    <dd className="mt-0.5 text-[15px] leading-[1.6]">{value}</dd>
                  </div>
                </div>
              ))}
            </dl>
            <p className="mt-6 border-t border-white/15 pt-4 text-[13px] leading-[1.5] text-white/60">
              ข้อมูลติดต่อทั้งหมดเป็นตัวอย่างสำหรับเว็บสาธิต
            </p>
          </section>

          <MapPlaceholder />
        </aside>
      </div>
    </main>
  );
}

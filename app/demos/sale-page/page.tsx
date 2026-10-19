import { Droplets, Feather, Plus, ShieldCheck, Sparkles } from "lucide-react";
import Image from "next/image";
import { unsplash } from "@/lib/images";
import { formatTHB } from "@/lib/packages";
import { benefits, brand, faqs, ingredients, product, reviews } from "@/lib/demos/sale-page/content";
import { Hero } from "./_components/hero";
import { JasmineMark, Stars } from "./_components/marks";
import { OrderSection } from "./_components/order-section";
import { Phrases } from "./_components/phrases";

const benefitIcons = [Sparkles, Droplets, ShieldCheck, Feather];

export default function SalePage() {
  return (
    <main>
      <p className="bg-(--leaf) px-5 py-2 text-center text-[13px] leading-[1.5] text-(--leaf-soft)">
        โปรเปิดตัว ลดเหลือขวดละ {formatTHB(product.promoPrice)} และส่งฟรีเมื่อซื้อ 3 ขวด
      </p>

      <header className="sticky top-0 z-40 border-b border-(--line) bg-(--cream)/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <p className="flex items-center gap-2.5 text-(--leaf)">
            <JasmineMark className="size-7" />
            <span className="text-lg leading-[1.3] font-semibold tracking-tight text-(--ink)">
              {brand.name}
            </span>
          </p>
          <a
            href="#order"
            className="rounded-full border border-(--leaf) px-5 py-2 text-sm leading-[1.4] text-(--leaf) transition-colors hover:bg-(--leaf) hover:text-(--cream) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--leaf)"
          >
            สั่งซื้อ
          </a>
        </div>
      </header>

      <Hero />

      {/* Benefits */}
      <section className="bg-(--leaf) px-5 py-16 text-(--cream) sm:px-8 lg:py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="max-w-lg text-3xl leading-[1.3] font-semibold sm:text-4xl">
            <Phrases text="สิ่งที่ผิวจะได้รับ ตั้งแต่ขวดแรก" />
          </h2>
          <ul className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 sm:gap-x-8 lg:grid-cols-4 lg:gap-0">
            {benefits.map((b, i) => {
              const Icon = benefitIcons[i];
              return (
                <li key={b.title} className="lg:border-l lg:border-(--cream)/20 lg:px-8 lg:first:border-l-0 lg:first:pl-0">
                  <Icon className="size-7 text-(--gold)" strokeWidth={1.5} aria-hidden />
                  <h3 className="mt-4 text-lg leading-[1.3] font-semibold sm:text-xl">{b.title}</h3>
                  <p className="mt-2 text-[15px] leading-[1.7] font-light text-(--leaf-soft) sm:text-base">{b.body}</p>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Ingredients */}
      <section className="px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-xl">
            <h2 className="text-3xl leading-[1.3] font-semibold sm:text-4xl">
              <Phrases text="สารสกัดจากพืชไทย ที่ผิวคุ้นเคย" />
            </h2>
            <p className="mt-3 leading-[1.7] font-light text-(--muted)">
              คัดเฉพาะส่วนผสมหลักสามชนิด ที่อ่อนโยนพอสำหรับใช้ทุกวัน
            </p>
          </div>
          <ul className="mt-10 grid gap-6 sm:mt-12 sm:grid-cols-3 sm:gap-6 lg:gap-10">
            {ingredients.map((ing) => (
              <li key={ing.name} className="flex items-center gap-4 sm:block">
                <div className="relative aspect-[3/4] w-24 shrink-0 overflow-hidden rounded-t-full bg-(--leaf-soft) sm:w-auto sm:aspect-[4/5]">
                  <Image
                    src={unsplash(ing.image, 700)}
                    alt={ing.name}
                    fill
                    sizes="(min-width: 1024px) 340px, (min-width: 640px) 30vw, 96px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-xl leading-[1.3] font-semibold text-(--leaf) sm:mt-5">{ing.name}</h3>
                  <p className="mt-1.5 text-[15px] leading-[1.7] font-light text-(--muted) sm:mt-2 sm:text-base">{ing.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Reviews */}
      <section className="bg-(--leaf-soft) px-5 py-20 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl leading-[1.3] font-semibold sm:text-4xl">เสียงจากคนที่ใช้จริง</h2>
          <ul className="mt-10 grid gap-5 md:grid-cols-3">
            {reviews.map((r) => (
              <li key={r.name} className="flex flex-col rounded-3xl bg-(--cream) p-6 sm:p-7">
                <Stars count={r.stars} />
                <blockquote className="mt-4 flex-1 text-[17px] leading-[1.65] font-light sm:text-lg">“{r.text}”</blockquote>
                <p className="mt-6 text-sm leading-[1.5] font-semibold text-(--leaf)">{r.name}</p>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm leading-[1.5] text-(--muted)">รีวิวตัวอย่างสำหรับเว็บสาธิต</p>
        </div>
      </section>

      <OrderSection />

      {/* FAQ */}
      <section className="border-t border-(--line) px-5 py-20 sm:px-8 lg:py-24">
        <div className="mx-auto grid max-w-6xl items-start gap-10 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
          <div className="lg:sticky lg:top-24">
            <h2 className="text-3xl leading-[1.3] font-semibold sm:text-4xl">คำถามที่พบบ่อย</h2>
            <p className="mt-3 max-w-xs leading-[1.7] font-light text-(--muted)">
              ข้อมูลการใช้และการจัดส่ง ก่อนตัดสินใจสั่งซื้อ
            </p>
          </div>
          <div className="border-t border-(--line)">
            {faqs.map((f) => (
              <details key={f.q} data-testid="faq-item" className="group border-b border-(--line)">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-lg leading-[1.4] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--leaf) [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-(--leaf-soft) text-(--leaf) transition-transform duration-200 group-open:rotate-45 motion-reduce:transition-none">
                    <Plus className="size-4" aria-hidden />
                  </span>
                </summary>
                <p className="-mt-1 max-w-prose pb-6 pr-12 leading-[1.75] font-light text-(--muted)">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-(--ink) px-5 pt-14 pb-28 text-(--cream) sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="flex items-center gap-2.5 text-(--cream)">
              <JasmineMark className="size-7" />
              <span className="text-xl leading-[1.3] font-semibold">{brand.name}</span>
            </p>
            <p className="mt-2 text-sm leading-[1.5] font-light text-(--cream)/70">{brand.tagline}</p>
          </div>
          <p className="text-sm leading-[1.5] text-(--cream)/60">© Mali Botanics (ธุรกิจสมมติ)</p>
        </div>
      </footer>
    </main>
  );
}

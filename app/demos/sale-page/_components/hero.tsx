import { MessageCircle } from "lucide-react";
import Image from "next/image";
import { unsplash } from "@/lib/images";
import { formatTHB } from "@/lib/packages";
import { brand, product, reviews } from "@/lib/demos/sale-page/content";
import { PromoSeal, Stars } from "./marks";
import { Phrases } from "./phrases";

const discount = Math.round((1 - product.promoPrice / product.fullPrice) * 100);
const avgStars = reviews.reduce((sum, r) => sum + r.stars, 0) / reviews.length;

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* soft leaf wash behind the photo column */}
      <div
        aria-hidden
        className="absolute inset-y-0 right-0 hidden w-[42%] rounded-bl-[200px] bg-(--leaf-soft) lg:block"
      />
      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 pt-8 pb-14 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:pt-14 lg:pb-20">
        <div>
          <p className="flex items-center gap-2 text-sm text-(--leaf)">
            <span className="h-px w-8 bg-(--gold)" aria-hidden />
            {brand.tagline}
          </p>
          <h1 className="mt-5 text-[2.5rem] leading-[1.2] font-semibold text-balance text-(--ink) sm:text-6xl lg:text-[4.1rem]">
            <Phrases text={product.headline} />
          </h1>
          <p className="mt-5 max-w-md text-base leading-[1.75] font-light text-(--muted) sm:text-lg">
            {product.sub}
          </p>

          <div className="mt-8 flex flex-wrap items-end gap-x-4 gap-y-1">
            <p className="leading-[1.2]">
              <span className="block text-sm text-(--muted)">
                {product.name} {product.size}
              </span>
              <span className="mt-1 flex items-baseline gap-3">
                <span className="text-5xl font-semibold text-(--leaf)">{formatTHB(product.promoPrice)}</span>
                <s className="text-xl font-light text-(--muted) decoration-(--gold) decoration-2">
                  {formatTHB(product.fullPrice)}
                </s>
              </span>
            </p>
            <span className="mb-1.5 rounded-full border border-(--gold) px-3 py-1 text-sm text-(--gold)">
              ราคาโปรเปิดตัว
            </span>
          </div>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
            <a
              href="#order"
              data-testid="hero-cta"
              className="inline-flex items-center justify-center gap-2.5 rounded-full bg-(--leaf) px-8 py-4 text-lg text-(--cream) shadow-[0_10px_30px_-12px_rgba(63,91,58,0.7)] transition-colors hover:bg-(--ink) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--leaf)"
            >
              <MessageCircle className="size-5" aria-hidden />
              สั่งซื้อทาง LINE
            </a>
            <div className="flex items-center gap-3 text-sm leading-[1.4] text-(--muted)">
              <Stars count={Math.round(avgStars)} />
              <span>
                {avgStars.toFixed(1)} จากรีวิวตัวอย่าง
              </span>
            </div>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[25rem] lg:max-w-[27rem]">
          <div className="relative aspect-[4/5] overflow-hidden rounded-t-full border-[10px] border-(--cream) bg-(--leaf-soft) shadow-[0_30px_60px_-30px_rgba(42,38,32,0.45)]">
            <Image
              src={unsplash(product.image, 900)}
              alt="ขวดเซรั่มน้ำนมข้าวมะลิ ขวดแก้วสีอำพันพร้อมหลอดหยด วางบนหิน"
              fill
              preload
              sizes="(min-width: 1024px) 432px, (min-width: 640px) 400px, 90vw"
              className="object-cover"
            />
          </div>
          <PromoSeal
            percent={discount}
            className="absolute -top-3 -left-3 size-24 text-[15px] sm:size-28 sm:text-base lg:-left-10 lg:top-10"
          />
          <div className="absolute -right-2 bottom-8 rounded-2xl bg-(--cream) px-4 py-3 shadow-lg sm:-right-6">
            <p className="text-xs leading-[1.4] text-(--muted)">ขนาด</p>
            <p className="text-lg leading-[1.3] font-semibold text-(--leaf)">{product.size}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

import type { L } from "@/lib/demos/lang";
import { PHOTOS } from "@/lib/images";

/** Replaces `{name}` placeholders, so Thai and English can put a value in different places. */
export function fill(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => vars[key] ?? match);
}

export const brand = {
  name: "Mali Botanics",
  tagline: { th: "สกินแคร์จากมะลิและข้าวไทย", en: "Skincare from Thai jasmine and rice" } satisfies L,
};

export const product = {
  name: { th: "เซรั่มน้ำนมข้าวมะลิ", en: "Jasmine Rice Milk Serum" } satisfies L,
  size: "30 ml",
  // The headline has one word set in gold, so it comes in three parts.
  headline: {
    before: { th: "ผิวใสแบบ", en: "Skin as clear as" } satisfies L,
    accent: { th: "มะลิ", en: "jasmine" } satisfies L,
    after: { th: "ใน 14 วัน", en: "in 14 days" } satisfies L,
  },
  sub: {
    th: "เซรั่มน้ำนมข้าวหอมมะลิ เนื้อบางเบา ซึมไว ไม่เหนียวเหนอะหนะ เหมาะกับอากาศร้อนชื้น",
    en: "A light jasmine rice milk serum that sinks in fast and never feels sticky, made for hot, humid days.",
  } satisfies L,
  fullPrice: 590,
  promoPrice: 390,
  photo: PHOTOS.saleIngredient1,
  photoAlt: { th: "ดอกมะลิบานเต็มกิ่ง", en: "Jasmine flowers in full bloom" } satisfies L,
};

export const days = [
  { day: 1, text: { th: "ซึมไว ไม่เหนียว", en: "Sinks in, never sticky" } satisfies L },
  { day: 7, text: { th: "ผิวนุ่ม ชุ่มชื้นขึ้น", en: "Softer, more hydrated skin" } satisfies L },
  { day: 14, text: { th: "ผิวดูกระจ่างใส", en: "Visibly brighter skin" } satisfies L },
];

export const benefits = [
  {
    title: { th: "กระจ่างใสขึ้น", en: "Brighter skin" } satisfies L,
    body: { th: "น้ำนมข้าวช่วยให้ผิวดูสว่างและสม่ำเสมอ", en: "Rice milk helps skin look brighter and more even." } satisfies L,
  },
  {
    title: { th: "ชุ่มชื้นทั้งวัน", en: "Hydrated all day" } satisfies L,
    body: { th: "ล็อกความชุ่มชื้นได้นาน แม้อยู่ในห้องแอร์", en: "Locks in moisture, even in air-conditioned rooms." } satisfies L,
  },
  {
    title: { th: "อ่อนโยน", en: "Gentle" } satisfies L,
    body: { th: "ไม่มีน้ำหอมสังเคราะห์และแอลกอฮอล์", en: "No synthetic fragrance and no alcohol." } satisfies L,
  },
  {
    title: { th: "เนื้อบางเบา", en: "Light texture" } satisfies L,
    body: { th: "ซึมไว แต่งหน้าทับได้ทันที", en: "Sinks in fast, so makeup can go on right away." } satisfies L,
  },
];

export const ingredients = [
  {
    name: { th: "น้ำนมข้าวหอมมะลิ", en: "Jasmine rice milk" } satisfies L,
    body: { th: "อุดมด้วยวิตามินอีและกรดอะมิโน", en: "Rich in vitamin E and amino acids." } satisfies L,
    image: PHOTOS.saleIngredient2,
  },
  {
    name: { th: "สารสกัดดอกมะลิ", en: "Jasmine flower extract" } satisfies L,
    body: {
      th: "ช่วยปลอบประโลมผิวและให้กลิ่นหอมอ่อน ๆ ตามธรรมชาติ",
      en: "Soothes skin and leaves a soft, natural scent.",
    } satisfies L,
    image: PHOTOS.saleIngredient1,
  },
  {
    name: { th: "ว่านหางจระเข้", en: "Aloe vera" } satisfies L,
    body: { th: "เติมความชุ่มชื้นและลดการระคายเคือง", en: "Adds moisture and calms irritation." } satisfies L,
    image: PHOTOS.saleIngredient3,
  },
];

export const reviews = [
  {
    name: { th: "คุณแพร (ตัวอย่าง)", en: "Prae (sample)" } satisfies L,
    text: {
      th: "ใช้ไปสองอาทิตย์ หน้าดูสว่างขึ้นจริง เนื้อไม่เหนียวเลย",
      en: "Two weeks in and my face really looks brighter. Not sticky at all.",
    } satisfies L,
    stars: 5,
  },
  {
    name: { th: "คุณบีม (ตัวอย่าง)", en: "Beam (sample)" } satisfies L,
    text: {
      th: "ผิวแพ้ง่ายแต่ใช้ได้ ไม่แสบ ไม่มีสิวขึ้น",
      en: "My skin is sensitive, but this works. No stinging, no breakouts.",
    } satisfies L,
    stars: 5,
  },
  {
    name: { th: "คุณออม (ตัวอย่าง)", en: "Aom (sample)" } satisfies L,
    text: { th: "กลิ่นมะลิหอมอ่อน ๆ ชอบมาก ซื้อซ้ำแล้ว", en: "I love the soft jasmine scent. Already bought it again." } satisfies L,
    stars: 4,
  },
];

export const bundles = [
  { id: "one", qty: 1, label: { th: "1 ขวด", en: "1 bottle" } satisfies L, price: 390, note: { th: "ทดลองใช้", en: "To try" } satisfies L, highlight: false },
  { id: "two", qty: 2, label: { th: "2 ขวด", en: "2 bottles" } satisfies L, price: 690, note: { th: "ประหยัด ฿90", en: "Save ฿90" } satisfies L, highlight: true },
  {
    id: "three",
    qty: 3,
    label: { th: "3 ขวด", en: "3 bottles" } satisfies L,
    price: 990,
    note: { th: "ส่งฟรี + ประหยัด ฿180", en: "Free shipping + save ฿180" } satisfies L,
    highlight: false,
  },
];

export const faqs = [
  {
    q: { th: "เหมาะกับผิวแบบไหน", en: "Which skin types is it for?" } satisfies L,
    a: {
      th: "ทุกสภาพผิว รวมถึงผิวแพ้ง่าย แนะนำให้ทดสอบที่ท้องแขนก่อนใช้ครั้งแรก",
      en: "All skin types, including sensitive skin. Try it on your inner arm before the first use.",
    } satisfies L,
  },
  {
    q: { th: "ใช้กี่ครั้งต่อวัน", en: "How often do I use it?" } satisfies L,
    a: { th: "เช้าและก่อนนอน ครั้งละ 2–3 หยด หลังล้างหน้า", en: "Morning and night, 2–3 drops after cleansing." } satisfies L,
  },
  {
    q: { th: "ขวดหนึ่งใช้ได้นานเท่าไร", en: "How long does a bottle last?" } satisfies L,
    a: { th: "ประมาณ 4–6 สัปดาห์", en: "About 4–6 weeks." } satisfies L,
  },
  {
    q: { th: "จัดส่งกี่วัน", en: "How long does delivery take?" } satisfies L,
    a: { th: "1–3 วันทำการทั่วประเทศ", en: "1–3 working days anywhere in Thailand." } satisfies L,
  },
  {
    q: { th: "มีเลขจดแจ้ง อย. หรือไม่", en: "Is it registered with the Thai FDA?" } satisfies L,
    a: {
      th: "นี่คือเว็บตัวอย่าง สินค้าจริงจะแสดงเลขจดแจ้งตรงนี้",
      en: "This is a demo site. A real product would show its Thai FDA notification number here.",
    } satisfies L,
  },
];

export const discountPercent = Math.round((1 - product.promoPrice / product.fullPrice) * 100);
export const avgRating = reviews.reduce((sum, r) => sum + r.stars, 0) / reviews.length;

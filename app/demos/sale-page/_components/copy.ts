import type { L } from "@/lib/demos/lang";

/** Interface copy. Business content lives in lib/demos/sale-page/content.ts. `{price}` is filled with fill(). */
export const ui = {
  promoBar: { th: "ราคาโปรเปิดตัว {price} · หมดเขตใน", en: "Launch price {price} · ends in" },
  order: { th: "สั่งซื้อ", en: "Order" },
  orderOnLine: { th: "สั่งซื้อทาง LINE", en: "Order on LINE" },
  freeShipping: { th: "ส่งฟรีเมื่อซื้อ 3 ขวด", en: "Free shipping on 3 bottles" },
  todayOnly: { th: "วันนี้เท่านั้น", en: "Today only" },
  size: { th: "ขนาด", en: "Size" },
  bottleLabel: { th: "ขวดเซรั่มน้ำนมข้าวมะลิ ฉลาก Mali", en: "A bottle of Mali jasmine rice milk serum" },
  daysHeading: { th: "ผิวเปลี่ยนไปอย่างไรใน 14 วัน", en: "What 14 days look like" },
  dayLabel: { th: "วันที่", en: "Day" },
  benefitsHeading: { th: "สิ่งที่ผิวจะได้รับ ตั้งแต่ขวดแรก", en: "What your skin gets from the first bottle" },
  ingredientsHeading: { th: "สารสกัดจากพืชไทย ที่ผิวคุ้นเคย", en: "Thai botanicals your skin already knows" },
  ingredientsSub: { th: "คัดเฉพาะส่วนผสมหลักสามชนิด ที่อ่อนโยนพอสำหรับใช้ทุกวัน", en: "Three key ingredients, gentle enough for every day." },
  reviewsHeading: { th: "เสียงจาก คนที่ใช้จริง", en: "From people who use it" },
  reviewsNote: { th: "รีวิวตัวอย่างสำหรับเว็บสาธิต", en: "Sample reviews for a demo site" },
  ratingSuffix: { th: "จากรีวิวตัวอย่าง", en: "from sample reviews" },
  starsLabel: { th: "{count} จาก 5 ดาว", en: "{count} out of 5 stars" },
  orderHeading: { th: "เลือกชุดที่เหมาะกับคุณ", en: "Choose your set" },
  orderSub: {
    th: "ราคาโปรโมชัน จากปกติขวดละ {price} ยิ่งซื้อหลายขวด ยิ่งคุ้ม",
    en: "Launch price. Usually {price} a bottle, and the more you buy, the more you save.",
  },
  perBottle: { th: "ตกขวดละ {price}", en: "{price} per bottle" },
  bestSeller: { th: "ขายดี", en: "Best seller" },
  delivery: { th: "จัดส่ง 1–3 วันทำการ", en: "Delivered in 1–3 working days" },
  bundleCta: { th: "สั่งซื้อทาง LINE (ตัวอย่าง)", en: "Order on LINE (demo)" },
  faqHeading: { th: "คำถามที่พบบ่อย", en: "Questions" },
  faqSub: { th: "ข้อมูลการใช้และการจัดส่ง ก่อนตัดสินใจสั่งซื้อ", en: "How to use it and how delivery works, before you order." },
  legal: { th: "© Mali Botanics (ธุรกิจสมมติ)", en: "© Mali Botanics (fictional business)" },
} satisfies Record<string, L>;

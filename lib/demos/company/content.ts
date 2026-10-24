import type { L } from "@/lib/demos/lang";
import { PHOTOS } from "@/lib/images";

export const company = {
  name: { th: "สยามพรีซิชั่น เอ็นจิเนียริ่ง", en: "Siam Precision Engineering" } satisfies L,
  legal: {
    th: "บริษัท สยามพรีซิชั่น เอ็นจิเนียริ่ง จำกัด (ธุรกิจสมมติ)",
    en: "Siam Precision Engineering Co., Ltd. (fictional business)",
  } satisfies L,
  tagline: {
    th: "งานกลึง CNC และชิ้นส่วนอุตสาหกรรม แม่นยำระดับไมครอน",
    en: "CNC machining and industrial parts with micron-level precision",
  } satisfies L,
  intro: {
    th: "รับผลิตชิ้นส่วนโลหะความแม่นยำสูงสำหรับโรงงานยานยนต์ อาหาร และอิเล็กทรอนิกส์ ตั้งแต่ชิ้นต้นแบบจนถึงการผลิตจำนวนมาก",
    en: "Precision metal parts for automotive, food and electronics plants, from a first prototype to full production runs.",
  } satisfies L,
  address: {
    th: "88/8 นิคมอุตสาหกรรมตัวอย่าง ต.ตัวอย่าง อ.เมือง จ.ชลบุรี 20000",
    en: "88/8 Sample Industrial Estate, Sample Subdistrict, Mueang District, Chonburi 20000",
  } satisfies L,
  phone: "038-000-000",
  email: "sales@example.com",
  hours: { th: "จันทร์–เสาร์ 08:00–17:00", en: "Mon–Sat, 08:00–17:00" } satisfies L,
  heroImage: PHOTOS.companyHero,
  heroAlt: { th: "เพลาโลหะกำลังกลึงบนเครื่องกลึง CNC", en: "A steel shaft being turned on a CNC lathe" } satisfies L,
};

export const stats = [
  { value: { th: "2008", en: "2008" } satisfies L, label: { th: "ก่อตั้ง", en: "Founded" } satisfies L },
  { value: { th: "350+", en: "350+" } satisfies L, label: { th: "โปรเจกต์ที่ส่งมอบ", en: "Projects delivered" } satisfies L },
  { value: { th: "±0.01 mm", en: "±0.01 mm" } satisfies L, label: { th: "ความคลาดเคลื่อน", en: "Tolerance" } satisfies L },
  { value: { th: "48 ชม.", en: "48 hrs" } satisfies L, label: { th: "ใบเสนอราคา", en: "Quote turnaround" } satisfies L },
];

export const SERVICES = [
  {
    id: "cnc",
    name: { th: "งานกลึงและกัด CNC", en: "CNC turning and milling" } satisfies L,
    short: { th: "ชิ้นส่วนเหล็ก สแตนเลส อลูมิเนียม ตามแบบ", en: "Steel, stainless and aluminium parts made to your drawing" } satisfies L,
    detail: {
      th: "เครื่อง CNC 5 แกน รองรับงานซับซ้อนและงานจำนวนมาก ตรวจสอบทุกชิ้นด้วยเครื่องวัด CMM",
      en: "5-axis CNC machines handle complex parts and large runs, and every part is checked on a CMM.",
    } satisfies L,
    image: PHOTOS.companyService1,
  },
  {
    id: "fabrication",
    name: { th: "งานโครงสร้างและเชื่อม", en: "Fabrication and welding" } satisfies L,
    short: { th: "โครงเครื่องจักร แท่นวาง และงานเหล็กแผ่น", en: "Machine frames, bases and sheet-metal work" } satisfies L,
    detail: {
      th: "ช่างเชื่อมมีใบรับรอง ออกแบบโครงสร้างให้แข็งแรงและติดตั้งหน้างานได้",
      en: "Certified welders, and structures designed to be strong and easy to install on site.",
    } satisfies L,
    image: PHOTOS.companyService3,
  },
  {
    id: "automation",
    name: { th: "ระบบอัตโนมัติ", en: "Automation" } satisfies L,
    short: { th: "จิ๊ก ฟิกเจอร์ และสายพานลำเลียง", en: "Jigs, fixtures and conveyors" } satisfies L,
    detail: {
      th: "ออกแบบอุปกรณ์ช่วยผลิตเพื่อลดเวลาและของเสียในไลน์การผลิต",
      en: "Production aids designed to cut cycle time and scrap on your line.",
    } satisfies L,
    image: PHOTOS.companyService4,
  },
  {
    id: "design",
    name: { th: "ออกแบบและเขียนแบบ", en: "Design and drafting" } satisfies L,
    short: { th: "แบบ 2D/3D และงานถอดแบบชิ้นส่วนเดิม", en: "2D/3D drawings and reverse engineering of existing parts" } satisfies L,
    detail: {
      th: "วิศวกรช่วยปรับแบบให้ผลิตได้ง่ายขึ้นและต้นทุนต่ำลง ก่อนเริ่มผลิตจริง",
      en: "Our engineers adjust the design so it is easier and cheaper to make, before production starts.",
    } satisfies L,
    image: PHOTOS.companyService2,
  },
] as const;

export const processSteps: L[] = [
  { th: "ส่งแบบหรือตัวอย่างชิ้นงาน", en: "Send a drawing or a sample part" },
  { th: "รับใบเสนอราคาใน 48 ชม.", en: "Get a quote within 48 hours" },
  { th: "ผลิตและตรวจสอบคุณภาพ", en: "Production and quality inspection" },
  { th: "จัดส่งพร้อมรายงานการวัด", en: "Delivery with a measurement report" },
];

/** Regular clients. `logo` picks the drawn wordmark in client-logos.tsx (Task 2). */
export const clients = [
  { logo: "thai-auto", name: { th: "ไทยออโต้พาร์ท", en: "Thai Auto Parts" } satisfies L },
  { logo: "siam-food-pack", name: { th: "สยามฟู้ดแพ็ค", en: "Siam Food Pack" } satisfies L },
  { logo: "eastern-elec", name: { th: "อีสเทิร์นอิเล็กทรอนิกส์", en: "Eastern Electronics" } satisfies L },
  { logo: "bangna-logistics", name: { th: "บางนาโลจิสติกส์", en: "Bangna Logistics" } satisfies L },
  { logo: "chonburi-steel", name: { th: "ชลบุรีสตีล", en: "Chonburi Steel" } satisfies L },
] as const;

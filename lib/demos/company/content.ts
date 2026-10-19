import { PHOTOS } from "@/lib/images";

export const company = {
  name: "สยามพรีซิชั่น เอ็นจิเนียริ่ง",
  nameEn: "Siam Precision Engineering",
  legal: "บริษัท สยามพรีซิชั่น เอ็นจิเนียริ่ง จำกัด (ธุรกิจสมมติ)",
  tagline: "งานกลึง CNC และชิ้นส่วนอุตสาหกรรม แม่นยำระดับไมครอน",
  intro: "รับผลิตชิ้นส่วนโลหะความแม่นยำสูงสำหรับโรงงานยานยนต์ อาหาร และอิเล็กทรอนิกส์ ตั้งแต่ชิ้นต้นแบบจนถึงการผลิตจำนวนมาก",
  address: "88/8 นิคมอุตสาหกรรมตัวอย่าง ต.ตัวอย่าง อ.เมือง จ.ชลบุรี 20000",
  phone: "038-000-000 (ตัวอย่าง)",
  email: "sales@example.com",
  hours: "จันทร์–เสาร์ 08:00–17:00",
  heroImage: PHOTOS.companyHero,
};

export const stats = [
  { value: "2008", label: "ก่อตั้ง" },
  { value: "350+", label: "โปรเจกต์ที่ส่งมอบ" },
  { value: "±0.01 mm", label: "ความคลาดเคลื่อน" },
  { value: "48 ชม.", label: "ใบเสนอราคา" },
];

export const SERVICES = [
  {
    id: "cnc",
    name: "งานกลึงและกัด CNC",
    short: "ชิ้นส่วนเหล็ก สแตนเลส อลูมิเนียม ตามแบบ",
    detail: "เครื่อง CNC 5 แกน รองรับงานซับซ้อนและงานจำนวนมาก ตรวจสอบทุกชิ้นด้วยเครื่องวัด CMM",
    image: PHOTOS.companyService1,
  },
  {
    id: "fabrication",
    name: "งานโครงสร้างและเชื่อม",
    short: "โครงเครื่องจักร แท่นวาง และงานเหล็กแผ่น",
    detail: "ช่างเชื่อมมีใบรับรอง ออกแบบโครงสร้างให้แข็งแรงและติดตั้งหน้างานได้",
    image: PHOTOS.companyService3,
  },
  {
    id: "automation",
    name: "ระบบอัตโนมัติ",
    short: "จิ๊ก ฟิกเจอร์ และสายพานลำเลียง",
    detail: "ออกแบบอุปกรณ์ช่วยผลิตเพื่อลดเวลาและของเสียในไลน์การผลิต",
    image: PHOTOS.companyService4,
  },
  {
    id: "design",
    name: "ออกแบบและเขียนแบบ",
    short: "แบบ 2D/3D และงานถอดแบบชิ้นส่วนเดิม",
    detail: "วิศวกรช่วยปรับแบบให้ผลิตได้ง่ายขึ้นและต้นทุนต่ำลง ก่อนเริ่มผลิตจริง",
    image: PHOTOS.companyService2,
  },
] as const;

export type ServiceId = (typeof SERVICES)[number]["id"];

export const processSteps = ["ส่งแบบหรือตัวอย่างชิ้นงาน", "รับใบเสนอราคาใน 48 ชม.", "ผลิตและตรวจสอบคุณภาพ", "จัดส่งพร้อมรายงานการวัด"];

export const clients = ["ไทยออโต้พาร์ท", "สยามฟู้ดแพ็ค", "อีสเทิร์นอิเล็กทรอนิกส์", "บางนาโลจิสติกส์", "ชลบุรีสตีล"];

import type { Locale } from "@/lib/i18n/config";

export type ServiceId = "web" | "app";
export type Tier = "basic" | "standard" | "premium";
export type PackageId = `${ServiceId}-${Tier}`;

export interface Package {
  id: PackageId;
  service: ServiceId;
  tier: Tier;
  priceTHB: number;
  title: Record<Locale, string>;
  scope: Record<Locale, string[]>;
  demoName: Record<Locale, string>;
  demoPath: string;
  fastworkUrl: string;
}

export const FASTWORK_PROFILE_URL = "https://fastwork.com/user/devohm";

const WEB_URL =
  "https://fastwork.com/user/devohm/gigs/i-will-build-a-responsive-website-or-landing-page-with-next-js-s.f879y5wiwf0nr2";
const APP_URL =
  "https://fastwork.com/user/devohm/gigs/i-will-build-a-custom-web-application-dashboard-or-backend-api-s.pu39xm3f7rrynh";

export const packages: Package[] = [
  {
    id: "web-basic",
    service: "web",
    tier: "basic",
    priceTHB: 4900,
    title: { th: "เว็บไซต์ · Basic", en: "Website · Basic" },
    scope: {
      th: ["แลนดิ้งเพจ 1 หน้า", "รองรับมือถือ แท็บเล็ต เดสก์ท็อป", "SEO พื้นฐาน", "แก้ไข 1 ครั้ง"],
      en: ["1 responsive landing page", "Mobile, tablet & desktop", "Basic on-page SEO", "1 revision"],
    },
    demoName: { th: "Mali Botanics — เซลเพจสกินแคร์", en: "Mali Botanics — skincare sale page" },
    demoPath: "/demos/sale-page",
    fastworkUrl: WEB_URL,
  },
  {
    id: "web-standard",
    service: "web",
    tier: "standard",
    priceTHB: 7900,
    title: { th: "เว็บไซต์ · Standard", en: "Website · Standard" },
    scope: {
      th: ["สูงสุด 3 หน้า", "ฟอร์มติดต่อ", "SEO พื้นฐาน", "แก้ไข 2 ครั้ง"],
      en: ["Up to 3 pages", "Contact form", "Basic SEO", "2 revisions"],
    },
    demoName: { th: "สยามพรีซิชั่น — เว็บไซต์บริษัท", en: "Siam Precision — company website" },
    demoPath: "/demos/company",
    fastworkUrl: WEB_URL,
  },
  {
    id: "web-premium",
    service: "web",
    tier: "premium",
    priceTHB: 14900,
    title: { th: "เว็บไซต์ · Premium", en: "Website · Premium" },
    scope: {
      th: ["สูงสุด 5 หน้า", "คอมโพเนนต์ใช้ซ้ำได้", "อินเทอร์แอกชันเพิ่มเติม", "แก้ไข 3 ครั้ง"],
      en: ["Up to 5 pages", "Reusable components", "Additional interactions", "3 revisions"],
    },
    demoName: { th: "แสงจันทร์ รีสอร์ท — เว็บไซต์รีสอร์ท", en: "Saeng Chan Resort — resort website" },
    demoPath: "/demos/resort",
    fastworkUrl: WEB_URL,
  },
  {
    id: "app-basic",
    service: "app",
    tier: "basic",
    priceTHB: 5900,
    title: { th: "เว็บแอป · Basic", en: "Web app · Basic" },
    scope: {
      th: ["ระบบหลังบ้าน 1 โมดูล", "REST API สูงสุด 4 endpoint", "ข้อมูล 1 ประเภท"],
      en: ["One small backend module", "Up to 4 REST endpoints", "One data resource"],
    },
    demoName: { th: "Orders API — เอกสาร API ทดลองยิงได้", en: "Orders API — interactive API docs" },
    demoPath: "/demos/orders-api",
    fastworkUrl: APP_URL,
  },
  {
    id: "app-standard",
    service: "app",
    tier: "standard",
    priceTHB: 14900,
    title: { th: "เว็บแอป · Standard", en: "Web app · Standard" },
    scope: {
      th: ["แดชบอร์ดสูงสุด 3 หน้าจอ", "ระบบล็อกอินพื้นฐาน", "ข้อมูล 2 โมดูล", "ตารางและกราฟ"],
      en: ["Up to 3 dashboard screens", "Basic login", "2 data modules", "Tables & simple charts"],
    },
    demoName: { th: "ร้านดี — ระบบหลังร้าน", en: "Ran Dee — shop back office" },
    demoPath: "/demos/shop-admin",
    fastworkUrl: APP_URL,
  },
  {
    id: "app-premium",
    service: "app",
    tier: "premium",
    priceTHB: 29900,
    title: { th: "เว็บแอป · Premium", en: "Web app · Premium" },
    scope: {
      th: ["MVP สูงสุด 5 หน้าจอ", "ระบบยืนยันตัวตน", "ข้อมูลหลักสูงสุด 3 โมดูล", "รองรับทุกอุปกรณ์"],
      en: ["MVP with up to 5 screens", "Authentication", "Up to 3 core data modules", "Responsive"],
    },
    demoName: { th: "ลูมิ คลินิก — ระบบจองคิว", en: "Lumi Clinic — booking system" },
    demoPath: "/demos/clinic-booking",
    fastworkUrl: APP_URL,
  },
];

export function getPackage(id: PackageId): Package {
  const pkg = packages.find((p) => p.id === id);
  if (!pkg) throw new Error(`Unknown package: ${id}`);
  return pkg;
}

export function packagesByService(service: ServiceId): Package[] {
  return packages.filter((p) => p.service === service);
}

export function formatTHB(n: number): string {
  return `฿${new Intl.NumberFormat("en-US").format(n)}`;
}

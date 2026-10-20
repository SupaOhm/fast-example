import type { Locale } from "@/lib/i18n/config";

export type ServiceId = "web" | "app";
export type Tier = "basic" | "standard" | "premium";
export type PackageId = `${ServiceId}-${Tier}`;

export type RowKind = "count" | "bool" | "text";

export interface CompareRow {
  key: string;
  kind: RowKind;
  /** Compare-page section heading; set on the first row of each group. */
  group?: Record<Locale, string>;
  label: Record<Locale, string>;
}

/** count → { n, unit }; bool → boolean; text → localized text, or false when the plan doesn't include it. */
export type RowValue = { n: number; unit: Record<Locale, string> } | boolean | Record<Locale, string>;

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
  tagline: Record<Locale, string>;
  /** Screenshots of the demo, one per page or screen the plan includes (scripts/capture-thumbs.mjs). */
  pages: string[];
  /** One value per row key of the package's service. */
  values: Record<string, RowValue>;
}

export interface Service {
  id: ServiceId;
  name: Record<Locale, string>;
  blurb: Record<Locale, string>;
  lede: Record<Locale, string>;
  sub: Record<Locale, string>;
  accent: "lime" | "sky";
  fastworkUrl: string;
  /** Three screenshots fanned out on the service tile. */
  fan: string[];
  rows: CompareRow[];
  /** Four row keys shown under each plan in the hub lineup. */
  lineupRows: string[];
}

export interface ServiceTile {
  id: ServiceId;
  name: string;
  blurb: string;
  from: string;
  count: number;
  fan: string[];
  accent: Service["accent"];
}

export const FASTWORK_PROFILE_URL = "https://fastwork.com/user/devohm";

const WEB_URL =
  "https://fastwork.com/user/devohm/gigs/i-will-build-a-responsive-website-or-landing-page-with-next-js-s.f879y5wiwf0nr2";
const APP_URL =
  "https://fastwork.com/user/devohm/gigs/i-will-build-a-custom-web-application-dashboard-or-backend-api-s.pu39xm3f7rrynh";

const l = (en: string, th: string): Record<Locale, string> => ({ th, en });
const count = (n: number, en: string, th: string): RowValue => ({ n, unit: l(en, th) });
const shots = (id: PackageId, n: number) => Array.from({ length: n }, (_, i) => `/thumbs/pages/${id}-${i + 1}.jpg`);

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
    tagline: l("One landing page that sells one product or campaign.", "แลนดิ้งเพจ 1 หน้า สำหรับขายสินค้าหรือแคมเปญเดียว"),
    pages: shots("web-basic", 1),
    values: {
      pages: count(1, "landing page", "แลนดิ้งเพจ"),
      resp: true,
      form: false,
      seo: true,
      comps: false,
      inter: false,
      rev: count(1, "revision", "ครั้ง"),
      src: true,
      live: true,
    },
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
    tagline: l("A small company site with a working contact form.", "เว็บบริษัทขนาดเล็ก พร้อมฟอร์มติดต่อที่ใช้งานได้จริง"),
    pages: shots("web-standard", 3),
    values: {
      pages: count(3, "pages", "หน้า"),
      resp: true,
      form: true,
      seo: true,
      comps: false,
      inter: false,
      rev: count(2, "revisions", "ครั้ง"),
      src: true,
      live: true,
    },
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
    tagline: l(
      "A full brand site with reusable sections and richer interactions.",
      "เว็บแบรนด์เต็มรูปแบบ มีส่วนประกอบใช้ซ้ำได้และอินเทอร์แอกชันมากขึ้น",
    ),
    pages: shots("web-premium", 5),
    values: {
      pages: count(5, "pages", "หน้า"),
      resp: true,
      form: true,
      seo: true,
      comps: true,
      inter: true,
      rev: count(3, "revisions", "ครั้ง"),
      src: true,
      live: true,
    },
  },
  {
    id: "app-basic",
    service: "app",
    tier: "basic",
    priceTHB: 5900,
    title: { th: "เว็บแอป · Basic", en: "Web app · Basic" },
    scope: {
      th: ["ระบบหลังบ้าน 1 โมดูล", "REST API สูงสุด 4 endpoint", "ตรวจสอบข้อมูลและเชื่อมฐานข้อมูล", "แก้ไข 1 ครั้ง"],
      en: ["One small backend module", "Up to 4 REST endpoints", "Validation & database connection", "1 revision"],
    },
    demoName: { th: "Orders API — เอกสาร API ทดลองยิงได้", en: "Orders API — interactive API docs" },
    demoPath: "/demos/orders-api",
    fastworkUrl: APP_URL,
    tagline: l("One backend module with a small REST API.", "ระบบหลังบ้าน 1 โมดูล พร้อม REST API ขนาดเล็ก"),
    pages: shots("app-basic", 1),
    values: {
      screens: count(1, "backend module", "โมดูลหลังบ้าน"),
      mods: count(1, "data module", "โมดูลข้อมูล"),
      login: false,
      charts: false,
      api: l("Up to 4 REST endpoints", "REST API สูงสุด 4 endpoint"),
      db: true,
      resp: false,
      rev: count(1, "revision", "ครั้ง"),
      src: true,
      live: false,
    },
  },
  {
    id: "app-standard",
    service: "app",
    tier: "standard",
    priceTHB: 14900,
    title: { th: "เว็บแอป · Standard", en: "Web app · Standard" },
    scope: {
      th: ["แดชบอร์ดสูงสุด 3 หน้าจอ", "ระบบล็อกอินพื้นฐาน", "ข้อมูล 2 โมดูล", "ตารางและกราฟ", "แก้ไข 2 ครั้ง"],
      en: ["Up to 3 dashboard screens", "Basic login", "2 data modules", "Tables & simple charts", "2 revisions"],
    },
    demoName: { th: "ร้านดี — ระบบหลังร้าน", en: "Ran Dee — shop back office" },
    demoPath: "/demos/shop-admin",
    fastworkUrl: APP_URL,
    tagline: l("An admin dashboard with login, tables and charts.", "แดชบอร์ดหลังบ้าน พร้อมล็อกอิน ตาราง และกราฟ"),
    pages: shots("app-standard", 3),
    values: {
      screens: count(3, "dashboard screens", "หน้าจอแดชบอร์ด"),
      mods: count(2, "data modules", "โมดูลข้อมูล"),
      login: l("Basic login", "ล็อกอินพื้นฐาน"),
      charts: true,
      api: l("Connected to your database", "เชื่อมต่อฐานข้อมูลของคุณ"),
      db: true,
      resp: false,
      rev: count(2, "revisions", "ครั้ง"),
      src: true,
      live: false,
    },
  },
  {
    id: "app-premium",
    service: "app",
    tier: "premium",
    priceTHB: 29900,
    title: { th: "เว็บแอป · Premium", en: "Web app · Premium" },
    scope: {
      th: ["MVP สูงสุด 5 หน้าจอ", "ระบบยืนยันตัวตน", "ข้อมูลหลักสูงสุด 3 โมดูล", "รองรับทุกอุปกรณ์", "แก้ไข 3 ครั้ง"],
      en: ["MVP with up to 5 screens", "Authentication", "Up to 3 core data modules", "Responsive", "3 revisions"],
    },
    demoName: { th: "ลูมิ คลินิก — ระบบจองคิว", en: "Lumi Clinic — booking system" },
    demoPath: "/demos/clinic-booking",
    fastworkUrl: APP_URL,
    tagline: l(
      "A scoped MVP with a customer side, a staff side and accounts.",
      "MVP ครบทั้งฝั่งลูกค้า ฝั่งพนักงาน และระบบบัญชีผู้ใช้",
    ),
    pages: shots("app-premium", 5),
    values: {
      screens: count(5, "screens", "หน้าจอ"),
      mods: count(3, "data modules", "โมดูลข้อมูล"),
      login: l("Accounts and sign-in", "ระบบบัญชีและการเข้าสู่ระบบ"),
      charts: true,
      api: l("Backend APIs", "Backend API"),
      db: true,
      resp: true,
      rev: count(3, "revisions", "ครั้ง"),
      src: true,
      live: true,
    },
  },
];

const delivery: CompareRow[] = [
  { key: "rev", kind: "count", group: l("Delivery", "การส่งมอบ"), label: l("Revisions", "จำนวนครั้งที่แก้ไข") },
  { key: "src", kind: "bool", label: l("Full source code", "ซอร์สโค้ดทั้งหมด") },
  { key: "live", kind: "bool", label: l("Help going live", "ช่วยนำขึ้นออนไลน์") },
];

export const services: Service[] = [
  {
    id: "web",
    name: l("Websites", "เว็บไซต์"),
    blurb: l("Landing pages and company sites, built in Next.js.", "แลนดิ้งเพจและเว็บบริษัท สร้างด้วย Next.js"),
    lede: l("Websites and landing pages", "เว็บไซต์และแลนดิ้งเพจ"),
    sub: l(
      "The same build at three sizes: more pages, more interaction and more revisions as you go up.",
      "งานแบบเดียวกันในสามขนาด ยิ่งแพ็กเกจสูง ยิ่งได้จำนวนหน้า อินเทอร์แอกชัน และรอบแก้ไขมากขึ้น",
    ),
    accent: "lime",
    fastworkUrl: WEB_URL,
    fan: ["/thumbs/pages/web-premium-1.jpg", "/thumbs/pages/web-premium-3.jpg", "/thumbs/pages/web-standard-1.jpg"],
    rows: [
      { key: "pages", kind: "count", group: l("Size", "ขนาดงาน"), label: l("Pages", "จำนวนหน้า") },
      {
        key: "resp",
        kind: "bool",
        group: l("Features", "ฟีเจอร์"),
        label: l("Mobile, tablet and desktop", "รองรับมือถือ แท็บเล็ต และเดสก์ท็อป"),
      },
      { key: "form", kind: "bool", label: l("Contact form", "ฟอร์มติดต่อ") },
      { key: "seo", kind: "bool", label: l("Basic on-page SEO", "SEO พื้นฐาน") },
      { key: "comps", kind: "bool", label: l("Reusable components", "คอมโพเนนต์ใช้ซ้ำได้") },
      { key: "inter", kind: "bool", label: l("Extra interactions", "อินเทอร์แอกชันเพิ่มเติม") },
      ...delivery,
    ],
    lineupRows: ["pages", "form", "comps", "rev"],
  },
  {
    id: "app",
    name: l("Web apps", "เว็บแอป"),
    blurb: l("Dashboards, back offices and APIs for daily work.", "แดชบอร์ด ระบบหลังบ้าน และ API สำหรับงานประจำวัน"),
    lede: l("Web apps, dashboards and APIs", "เว็บแอป แดชบอร์ด และ API"),
    sub: l(
      "The same build at three sizes: from one backend module up to a full MVP with accounts.",
      "งานแบบเดียวกันในสามขนาด ตั้งแต่ระบบหลังบ้าน 1 โมดูล ไปจนถึง MVP ที่มีระบบบัญชีผู้ใช้",
    ),
    accent: "sky",
    fastworkUrl: APP_URL,
    fan: ["/thumbs/pages/app-premium-2.jpg", "/thumbs/pages/app-standard-1.jpg", "/thumbs/pages/app-basic-1.jpg"],
    rows: [
      { key: "screens", kind: "count", group: l("Size", "ขนาดงาน"), label: l("Screens", "จำนวนหน้าจอ") },
      { key: "mods", kind: "count", label: l("Data modules", "โมดูลข้อมูล") },
      { key: "login", kind: "text", group: l("Features", "ฟีเจอร์"), label: l("Login", "ระบบล็อกอิน") },
      { key: "charts", kind: "bool", label: l("Tables and charts", "ตารางและกราฟ") },
      { key: "api", kind: "text", label: l("API", "API") },
      { key: "db", kind: "bool", label: l("Validation and database", "ตรวจสอบข้อมูลและฐานข้อมูล") },
      { key: "resp", kind: "bool", label: l("Works on phones", "ใช้งานบนมือถือได้") },
      ...delivery,
    ],
    lineupRows: ["screens", "login", "charts", "rev"],
  },
];

export function getPackage(id: PackageId): Package {
  const pkg = packages.find((p) => p.id === id);
  if (!pkg) throw new Error(`Unknown package: ${id}`);
  return pkg;
}

export function getService(id: ServiceId): Service {
  const service = services.find((s) => s.id === id);
  if (!service) throw new Error(`Unknown service: ${id}`);
  return service;
}

export function packagesByService(service: ServiceId): Package[] {
  return packages.filter((p) => p.service === service);
}

export function formatTHB(n: number): string {
  return `฿${new Intl.NumberFormat("en-US").format(n)}`;
}

export function serviceTiles(locale: Locale): ServiceTile[] {
  return services.map((s) => {
    const plans = packagesByService(s.id);
    return {
      id: s.id,
      name: s.name[locale],
      blurb: s.blurb[locale],
      from: formatTHB(Math.min(...plans.map((p) => p.priceTHB))),
      count: plans.length,
      fan: s.fan,
      accent: s.accent,
    };
  });
}

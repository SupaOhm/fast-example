import { PHOTOS } from "@/lib/images";
import type { L } from "@/lib/demos/lang";
import type { Room } from "./logic";

export const resort = {
  name: { th: "แสงจันทร์ รีสอร์ท", en: "Saeng Chan Resort" } satisfies L,
  location: { th: "อ่าวนาง กระบี่", en: "Ao Nang, Krabi" } satisfies L,
  tagline: { th: "พักผ่อนริมทะเลอันดามัน ใต้แสงจันทร์", en: "Moonlit calm on the Andaman Sea" } satisfies L,
  intro: {
    th: "บูทีครีสอร์ท 24 ห้อง ท่ามกลางสวนเขตร้อน เดินถึงชายหาดใน 3 นาที",
    en: "A 24-key boutique resort in a tropical garden, three minutes' walk from the beach.",
  } satisfies L,
  heroImage: PHOTOS.resortHero,
  aboutImage: PHOTOS.resortAbout,
  aboutAlt: { th: "บรรยากาศภายในแสงจันทร์ รีสอร์ท", en: "Inside Saeng Chan Resort" } satisfies L,
};

export const nav: { href: string; label: L }[] = [
  { href: "/demos/resort", label: { th: "หน้าแรก", en: "Home" } },
  { href: "/demos/resort/rooms", label: { th: "ห้องพัก", en: "Rooms" } },
  { href: "/demos/resort/gallery", label: { th: "แกลเลอรี", en: "Gallery" } },
  { href: "/demos/resort/about", label: { th: "เกี่ยวกับเรา", en: "About" } },
  { href: "/demos/resort/booking", label: { th: "จองห้องพัก", en: "Book" } },
];

export const ROOMS: Room[] = [
  {
    id: "garden-deluxe",
    type: "deluxe",
    name: { th: "ดีลักซ์ วิวสวน", en: "Garden Deluxe" },
    guests: 2,
    sizeSqm: 32,
    pricePerNight: 2900,
    features: [{ th: "ระเบียงส่วนตัว", en: "Private balcony" }, { th: "อาหารเช้า", en: "Breakfast included" }],
    image: PHOTOS.resortRoom1,
  },
  {
    id: "sea-deluxe",
    type: "deluxe",
    name: { th: "ดีลักซ์ วิวทะเล", en: "Sea View Deluxe" },
    guests: 2,
    sizeSqm: 34,
    pricePerNight: 3600,
    features: [{ th: "วิวทะเล", en: "Sea view" }, { th: "อ่างอาบน้ำ", en: "Bathtub" }],
    image: PHOTOS.resortRoom2,
  },
  {
    id: "family-suite",
    type: "suite",
    name: { th: "แฟมิลี่ สวีท", en: "Family Suite" },
    guests: 4,
    sizeSqm: 58,
    pricePerNight: 5400,
    features: [{ th: "2 ห้องนอน", en: "Two bedrooms" }, { th: "มุมนั่งเล่น", en: "Living area" }],
    image: PHOTOS.resortRoom3,
  },
  {
    id: "pool-villa",
    type: "villa",
    name: { th: "พูลวิลล่า", en: "Pool Villa" },
    guests: 2,
    sizeSqm: 80,
    pricePerNight: 8900,
    features: [{ th: "สระว่ายน้ำส่วนตัว", en: "Private pool" }, { th: "บริการบัตเลอร์", en: "Butler service" }],
    image: PHOTOS.resortRoom4,
  },
  {
    id: "family-villa",
    type: "villa",
    name: { th: "แฟมิลี่ พูลวิลล่า", en: "Family Pool Villa" },
    guests: 6,
    sizeSqm: 140,
    pricePerNight: 14500,
    features: [{ th: "3 ห้องนอน", en: "Three bedrooms" }, { th: "สระว่ายน้ำส่วนตัว", en: "Private pool" }],
    image: PHOTOS.resortRoom5,
  },
];

export const GALLERY: { id: string; alt: L }[] = [
  { id: PHOTOS.resortGallery1, alt: { th: "ห้องอาหารริมสระ", en: "Poolside restaurant" } },
  { id: PHOTOS.resortGallery2, alt: { th: "ชายหาดและรีสอร์ทจากมุมสูง", en: "The beach and resort from above" } },
  { id: PHOTOS.resortGallery3, alt: { th: "ระเบียงสระวิวทะเลของพูลวิลล่า", en: "Pool villa terrace with a sea view" } },
  { id: PHOTOS.resortGallery4, alt: { th: "สระว่ายน้ำในสวนเขตร้อน", en: "Pool in the tropical garden" } },
  { id: PHOTOS.resortGallery5, alt: { th: "เรือหางยาวในอ่าว", en: "Longtail boats in the bay" } },
  { id: PHOTOS.resortGallery6, alt: { th: "พระอาทิตย์ตกเหนืออ่าว", en: "Sunset over the bay" } },
  { id: PHOTOS.resortGallery7, alt: { th: "อาหารเช้าลอยน้ำ", en: "Floating breakfast" } },
  { id: PHOTOS.resortGallery8, alt: { th: "เตียงพักผ่อนริมหาด", en: "Beach daybeds" } },
  { id: PHOTOS.resortGallery9, alt: { th: "สระอินฟินิตี้หันหน้าสู่ทะเลอันดามัน", en: "Infinity pool facing the Andaman Sea" } },
];

export const highlights: { title: L; body: L }[] = [
  { title: { th: "ใกล้ชายหาด", en: "Steps from the beach" }, body: { th: "เดิน 3 นาทีถึงหาดอ่าวนาง", en: "Three minutes to Ao Nang beach" } },
  { title: { th: "อาหารใต้ต้นตำรับ", en: "Southern Thai kitchen" }, body: { th: "วัตถุดิบจากชาวประมงท้องถิ่น", en: "Sourced from local fishers" } },
  { title: { th: "ทริปเกาะ", en: "Island trips" }, body: { th: "จัดทริปเรือหางยาวส่วนตัว", en: "Private longtail boat tours" } },
];

/** The home page's three big facts. `unit` sits small beside the figure; the moonrise has none. */
export const facts: { figure: string; unit?: L; title: L; body: L; photo: string; alt: L }[] = [
  {
    figure: "3",
    unit: { th: "นาที", en: "min" },
    title: { th: "เดินถึงหาดอ่าวนาง", en: "Walk to Ao Nang beach" },
    body: { th: "ผ่านสวนเขตร้อนของรีสอร์ท ไม่ต้องข้ามถนน", en: "Through the resort's tropical garden, without crossing a road." },
    photo: PHOTOS.resortGallery2,
    alt: { th: "ชายหาดและรีสอร์ทจากมุมสูง", en: "The beach and resort from above" },
  },
  {
    figure: "24",
    unit: { th: "ห้อง", en: "rooms" },
    title: { th: "เท่านั้น ไม่พลุกพล่าน", en: "That's all, so it never feels crowded" },
    body: { th: "พนักงานจำชื่อแขกได้ตั้งแต่วันแรก", en: "Our team knows every guest by name from the first day." },
    photo: PHOTOS.resortGallery4,
    alt: { th: "สระว่ายน้ำในสวนเขตร้อน", en: "Pool in the tropical garden" },
  },
  {
    figure: "19:30",
    title: { th: "พระจันทร์ขึ้นเหนืออ่าว", en: "Moonrise over the bay" },
    body: { th: "มื้อค่ำริมทะเลจัดตามเวลาพระจันทร์ขึ้นของแต่ละคืน", en: "Beachside dinner is timed to each night's moonrise." },
    photo: PHOTOS.resortGallery6,
    alt: { th: "พระอาทิตย์ตกเหนืออ่าว", en: "Sunset over the bay" },
  },
];

export const about: { heading: L; body: L } = {
  heading: { th: "ครอบครัวเล็ก\u00a0ๆ ริมทะเลกระบี่", en: "A small family place on the Krabi coast" },
  body: {
    th: "แสงจันทร์เริ่มจากบ้านพักของครอบครัวเมื่อปี 2012 วันนี้เรายังดูแลแขกทุกคนเหมือนญาติที่มาเยี่ยม (ธุรกิจสมมติสำหรับเว็บสาธิต)",
    en: "Saeng Chan began as our family's beach house in 2012, and we still host every guest like visiting relatives. (Fictional business for a demo site.)",
  },
};

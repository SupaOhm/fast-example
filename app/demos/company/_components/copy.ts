import type { L } from "@/lib/demos/lang";

/** Interface copy. Business content lives in lib/demos/company/content.ts. `{name}` is filled with fill(). */
export const ui = {
  // header, nav, footer
  home: { th: "หน้าแรก", en: "Home" },
  services: { th: "บริการ", en: "Services" },
  contact: { th: "ติดต่อเรา", en: "Contact" },
  mainNav: { th: "เมนูหลัก", en: "Main menu" },
  requestQuote: { th: "ขอใบเสนอราคา", en: "Request a quote" },
  factory: { th: "ที่ตั้งโรงงาน", en: "Factory" },
  openHours: { th: "เวลาทำการ {hours}", en: "Open {hours}" },
  // home
  heroKicker: { th: "โรงงานผลิตชิ้นส่วนโลหะ ชลบุรี", en: "Metal parts factory, Chonburi" },
  allServices: { th: "ดูบริการทั้งหมด", en: "See all services" },
  captionTitle: { th: "ตรวจวัดทุกชิ้นก่อนส่งมอบ", en: "Every part measured before delivery" },
  captionBody: { th: "เครื่อง CNC 5 แกน พร้อมเครื่องวัด CMM ในโรงงาน", en: "5-axis CNC machines and an in-house CMM" },
  companyFacts: { th: "ข้อมูลบริษัท", en: "Company facts" },
  whatWeMake: { th: "งานที่เรารับผลิต", en: "What we make" },
  whatWeMakeSub: {
    th: "ทุกขั้นตอนทำในโรงงานของเราเอง ตั้งแต่ปรับแบบ ผลิต ไปจนถึงตรวจวัดก่อนส่งมอบ",
    en: "Every step happens in our own factory, from refining the design to production and final inspection.",
  },
  serviceDetails: { th: "ดูรายละเอียดบริการ", en: "Service details" },
  clientsHeading: { th: "โรงงานที่ใช้บริการเราเป็นประจำ", en: "Factories that work with us regularly" },
  // CTA band
  ctaHeading: { th: "มีแบบชิ้นงานอยู่แล้ว ส่งมาให้วิศวกรของเราประเมินราคา", en: "Already have a drawing? Send it to our engineers for a quote." },
  ctaBody: {
    th: "ส่งไฟล์ 2D/3D หรือรูปถ่ายชิ้นงานเดิม รับใบเสนอราคาภายใน 48 ชั่วโมง ไม่มีค่าใช้จ่าย",
    en: "Send 2D/3D files or photos of an existing part and get a free quote within 48 hours.",
  },
  orCall: { th: "หรือโทร {phone} (ตัวอย่าง)", en: "or call {phone} (sample)" },
  // services page
  servicesTitle: { th: "บริการผลิตและวิศวกรรม", en: "Manufacturing and engineering services" },
  servicesIntro: {
    th: "รับงานตั้งแต่ชิ้นต้นแบบชิ้นเดียวไปจนถึงล็อตผลิตหลายพันชิ้น วิศวกรของเราดูแลตั้งแต่ตรวจแบบจนส่งมอบพร้อมรายงานการวัด",
    en: "From a single prototype to runs of several thousand parts. Our engineers stay with the job from drawing review to delivery with a measurement report.",
  },
  quoteThis: { th: "ขอใบเสนอราคางานนี้", en: "Request a quote for this service" },
  processHeading: { th: "ขั้นตอนการสั่งผลิต", en: "How ordering works" },
  processSub: {
    th: "ชัดเจนทุกขั้น รู้ราคาและกำหนดส่งก่อนเริ่มงาน",
    en: "Clear at every step: you know the price and delivery date before work starts.",
  },
  // contact page
  contactIntro: {
    th: "บอกเราว่าต้องการผลิตอะไร จำนวนเท่าไร ทีมขายจะติดต่อกลับพร้อมใบเสนอราคาภายใน 48 ชั่วโมง",
    en: "Tell us what you need made and how many. Our sales team will reply with a quote within 48 hours.",
  },
  formHeading: { th: "แบบฟอร์มขอใบเสนอราคา", en: "Quote request form" },
  requiredBefore: { th: "ช่องที่มีเครื่องหมาย", en: "Fields marked" },
  requiredAfter: { th: "จำเป็นต้องกรอก", en: "are required" },
  addressLabel: { th: "ที่อยู่โรงงาน", en: "Factory address" },
  phoneLabel: { th: "โทรศัพท์", en: "Phone" },
  emailLabel: { th: "อีเมลฝ่ายขาย", en: "Sales email" },
  hoursLabel: { th: "เวลาทำการ", en: "Opening hours" },
  sample: { th: "(ตัวอย่าง)", en: "(sample)" },
  contactNote: { th: "ข้อมูลติดต่อทั้งหมดเป็นตัวอย่างสำหรับเว็บสาธิต", en: "All contact details are samples for a demo site." },
  mapLabel: { th: "แผนที่ตั้งโรงงาน (ภาพประกอบ)", en: "Map of the factory location (illustration)" },
  mapRoad: { th: "ถนนสายหลักนิคมฯ", en: "Estate main road" },
  // contact form
  fieldName: { th: "ชื่อผู้ติดต่อ", en: "Contact name" },
  fieldCompany: { th: "บริษัท", en: "Company" },
  fieldEmail: { th: "อีเมล", en: "Email" },
  fieldPhone: { th: "เบอร์โทร", en: "Phone" },
  fieldService: { th: "บริการที่สนใจ", en: "Service" },
  fieldMessage: { th: "รายละเอียดงาน", en: "Job details" },
  optional: { th: "(ไม่บังคับ)", en: "(optional)" },
  chooseService: { th: "เลือกบริการ", en: "Choose a service" },
  messagePlaceholder: {
    th: "เช่น วัสดุ ขนาด จำนวนชิ้น และวันที่ต้องการรับงาน",
    en: "For example: material, size, quantity and when you need the parts",
  },
  send: { th: "ส่งข้อมูล", en: "Send" },
  sending: { th: "กำลังส่ง…", en: "Sending…" },
  replyTime: { th: "ตอบกลับภายใน 1 วันทำการ", en: "We reply within 1 working day" },
  successTitle: { th: "ได้รับข้อมูลแล้ว", en: "Thank you, we've received your request" },
  successBody: {
    th: "ทีมขายจะติดต่อกลับภายใน 1 วันทำการ (เว็บตัวอย่าง: ไม่มีการส่งข้อมูลจริง)",
    en: "Our sales team will get back to you within 1 working day. (Demo site: nothing is actually sent.)",
  },
  sendAnother: { th: "ส่งอีกครั้ง", en: "Send another" },
} satisfies Record<string, L>;

import type { L } from "@/lib/demos/lang";

/** Interface copy that is not business content. Business content lives in lib/demos/resort/content.ts. */
export const ui = {
  menu: { th: "เมนู", en: "Menu" },
  closeMenu: { th: "ปิดเมนู", en: "Close menu" },
  mainNav: { th: "เมนูหลัก", en: "Main menu" },
  footerNav: { th: "ลิงก์ท้ายเว็บ", en: "Footer links" },

  checkAvailability: { th: "เช็กห้องว่าง", en: "Check availability" },
  viewRooms: { th: "ดูห้องพัก", en: "View rooms" },
  allRooms: { th: "ดูห้องพักทั้งหมด", en: "See all rooms" },
  roomsHeading: { th: "ห้องพักที่แขกเลือกบ่อย", en: "Rooms guests ask for most" },
  galleryHeading: { th: "วันหนึ่งที่แสงจันทร์", en: "A day at Saeng Chan" },
  openGallery: { th: "เปิดแกลเลอรี", en: "Open the gallery" },
  ctaHeading: { th: "คืนนี้พระจันทร์ขึ้นเหนือทะเลตอนหนึ่งทุ่มครึ่ง", en: "Tonight the moon rises over the bay at 7:30 pm" },
  ctaBody: {
    th: "ส่งวันที่ที่สนใจมา แล้วทีมต้อนรับจะตอบกลับภายใน 24 ชั่วโมง",
    en: "Send us your dates and our front desk will reply within 24 hours.",
  },
  ctaButton: { th: "ส่งคำขอจอง", en: "Send a booking inquiry" },
  fromPerNight: { th: "เริ่มต้น", en: "From" },
  perNight: { th: "/ คืน", en: "/ night" },
  guestsUnit: { th: "คน", en: "guests" },
  sqm: { th: "ตร.ม.", en: "m²" },

  roomsTitle: { th: "ห้องพักและวิลล่า", en: "Rooms and villas" },
  roomsLede: {
    th: "ทุกห้องรวมอาหารเช้า ไวไฟ และรถรับส่งจากสนามบินกระบี่เมื่อพัก 3 คืนขึ้นไป",
    en: "Every stay includes breakfast, Wi-Fi and a Krabi airport transfer for three nights or more.",
  },
  roomType: { th: "ประเภทห้อง", en: "Room type" },
  guests: { th: "จำนวนผู้เข้าพัก", en: "Guests" },
  bookThisRoom: { th: "จองห้องนี้", en: "Book this room" },
  emptyTitle: { th: "ยังไม่มีห้องที่รองรับจำนวนนี้", en: "No room fits this group yet" },
  emptyBody: {
    th: "ลองลดจำนวนผู้เข้าพักหรือเลือกประเภทห้องอื่น หรือส่งคำขอให้เราจัดห้องติดกันให้",
    en: "Try fewer guests or another room type, or send an inquiry and we'll arrange connecting rooms.",
  },
  clearFilters: { th: "ล้างตัวกรอง", en: "Clear filters" },

  galleryTitle: { th: "แกลเลอรี", en: "Gallery" },
  galleryLede: {
    th: "สระว่ายน้ำ ชายหาด ทริปเรือหางยาว และอาหารเช้าลอยน้ำ แตะรูปเพื่อดูภาพใหญ่",
    en: "The pools, the beach, longtail trips and a floating breakfast. Tap a photo to enlarge it.",
  },
  previous: { th: "รูปก่อนหน้า", en: "Previous photo" },
  next: { th: "รูปถัดไป", en: "Next photo" },
  close: { th: "ปิด", en: "Close" },
  enlarge: { th: "ดูภาพใหญ่", en: "Enlarge" },

  whatToExpect: { th: "สิ่งที่รอคุณอยู่", en: "What to expect" },
  visitHeading: { th: "การเดินทาง", en: "Getting here" },
  visitAirport: { th: "สนามบินกระบี่ 35 นาที", en: "35 minutes from Krabi Airport" },
  visitTimes: { th: "เช็กอิน 14:00 น. เช็กเอาต์ 12:00 น.", en: "Check-in 2 pm, check-out noon" },

  bookingTitle: { th: "ส่งคำขอจองห้องพัก", en: "Send a booking inquiry" },
  bookingLede: {
    th: "เลือกวันและห้องที่สนใจ เราจะยืนยันห้องว่างและราคาให้ทางอีเมล",
    en: "Pick your dates and room. We'll confirm availability and the rate by email.",
  },
  checkIn: { th: "วันเช็กอิน", en: "Check-in" },
  checkOut: { th: "วันเช็กเอาต์", en: "Check-out" },
  room: { th: "ห้องพัก", en: "Room" },
  anyRoom: { th: "ห้องใดก็ได้", en: "Any room" },
  name: { th: "ชื่อผู้จอง", en: "Your name" },
  email: { th: "อีเมล", en: "Email" },
  optional: { th: "(ไม่บังคับ)", en: "(optional)" },
  submit: { th: "ส่งคำขอจอง", en: "Send inquiry" },
  sending: { th: "กำลังส่ง…", en: "Sending…" },
  yourStay: { th: "สรุปการเข้าพัก", en: "Your stay" },
  nights: { th: "คืน", en: "nights" },
  estimate: { th: "ราคาประมาณ", en: "Estimated total" },
  pickDates: { th: "เลือกวันเช็กอินและเช็กเอาต์เพื่อดูจำนวนคืน", en: "Choose your dates to see the number of nights" },
  pickRoom: { th: "เลือกห้องเพื่อดูราคาประมาณ", en: "Choose a room to see an estimate" },
  estimateNote: {
    th: "ราคารวมภาษีและค่าบริการ ยังไม่ตัดบัตร",
    en: "Includes tax and service. Nothing is charged now.",
  },
  another: { th: "ส่งคำขออีกครั้ง", en: "Send another inquiry" },
  loading: { th: "กำลังโหลดแบบฟอร์ม…", en: "Loading the form…" },

  address: { th: "88 หมู่ 2 ต.อ่าวนาง อ.เมือง จ.กระบี่ 81180", en: "88 Moo 2, Ao Nang, Mueang Krabi 81180" },
  phone: { th: "โทร 080-000-0000 (ตัวอย่าง)", en: "Tel 080-000-0000 (sample)" },
  footerNote: { th: "ธุรกิจสมมติสำหรับเว็บตัวอย่าง", en: "A fictional business for a demo site" },
  // moonrise hero
  heroMoonrise: { th: "คืนนี้พระจันทร์ขึ้นเหนืออ่าว 19:30 น.", en: "Tonight the moon rises over the bay at 7:30 pm" },
  // availability strip
  availabilityHeading: { th: "ห้องว่าง 14 คืนข้างหน้า", en: "Availability for the next 14 nights" },
  pickFirstNight: { th: "เลือกคืนแรกที่เข้าพัก", en: "Pick your first night" },
  pickCheckOutDay: { th: "เลือกวันเช็กเอาต์", en: "Now pick your check-out day" },
  crossesFull: { th: "ช่วงนี้มีคืนที่เต็มแล้ว เลือกคืนแรกใหม่อีกครั้ง", en: "Those dates include a full night. Pick a new first night." },
  fullNight: { th: "เต็ม", en: "Full" },
  nightOne: { th: "1 คืน", en: "1 night" },
  nightsMany: { th: "{n} คืน", en: "{n} nights" },
  bookTheseDates: { th: "จองช่วงนี้", en: "Book these dates" },
  weekendNote: { th: "คืนวันศุกร์และเสาร์ราคาสูงกว่าวันธรรมดา", en: "Friday and Saturday nights cost more." },
  nightLabel: { th: "{date} · {price}", en: "{date} · {price}" },
  nightLabelFull: { th: "{date} · เต็ม", en: "{date} · full" },
  // room rail
  railHeading: { th: "ห้องพักทั้ง 5 แบบ", en: "All five room types" },
  railSub: { th: "ทุกห้องรวมอาหารเช้า เดินถึงหาด 3 นาที", en: "Breakfast included with every room, three minutes from the beach." },
  seeRoomAndDates: { th: "ดูห้องและเช็กวันว่าง", en: "See the room and dates" },
  previousRoom: { th: "ห้องก่อนหน้า", en: "Previous room" },
  nextRoom: { th: "ห้องถัดไป", en: "Next room" },
  // booking form
  nightsLabel: { th: "จำนวนคืน", en: "Nights" },
} satisfies Record<string, L>;

export const roomTypeLabel = {
  all: { th: "ทั้งหมด", en: "All" },
  deluxe: { th: "ดีลักซ์", en: "Deluxe" },
  suite: { th: "สวีท", en: "Suite" },
  villa: { th: "พูลวิลล่า", en: "Pool villa" },
} satisfies Record<string, L>;

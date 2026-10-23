import type { L } from "@/lib/demos/lang";
import type { BookingStatus, ClinicErrorCode } from "@/lib/demos/clinic-booking/data";

export const ui = {
  brand: { th: "ลูมิ คลินิก", en: "Lumi Clinic" },
  minutes: { th: "{n} นาที", en: "{n} min" },
  free: { th: "ฟรี", en: "Free" },
  clockTime: { th: "{time} น.", en: "{time}" },
  resetData: { th: "รีเซ็ตข้อมูล", en: "Reset data" },
  hours: { th: "เปิดทุกวัน {open}–{close} น.", en: "Open daily, {open}–{close}" },
  bookAhead: { th: "จองผ่าน LINE ได้ตลอด 24 ชั่วโมง", en: "Book on LINE at any hour" },
  mainNav: { th: "เมนูหลัก", en: "Main menu" },

  // Home
  homeLink: { th: "ลูมิ คลินิก หน้าแรก", en: "Lumi Clinic home" },
  navTreatments: { th: "ทรีตเมนต์", en: "Treatments" },
  navTeam: { th: "ทีมแพทย์", en: "Our team" },
  navClinic: { th: "คลินิก", en: "The clinic" },
  bookOnLine: { th: "จองผ่าน LINE", en: "Book on LINE" },
  heroKicker: { th: "คลินิกดูแลผิว ซอยทองหล่อ กรุงเทพฯ", en: "A skin clinic in Thonglor, Bangkok" },
  heroPromise: { th: "ดูแลผิวโดยแพทย์ผิวหนัง จองคิวเองได้ใน LINE", en: "Skin care led by a dermatologist, booked by you on LINE" },
  heroBody: {
    th: "เลือกทรีตเมนต์ ดูเวลาที่ว่างจริง แล้วกดยืนยัน คิวของคุณเข้าตารางคลินิกทันที ไม่ต้องโทร ไม่ต้องรอแอดมินตอบ",
    en: "Pick a treatment, see the times that are really free, and confirm. Your booking goes straight into the clinic's schedule, with no calls and no waiting for a reply.",
  },
  heroCta: { th: "จองคิวผ่าน LINE", en: "Book on LINE" },
  heroPrices: { th: "ดูราคาทรีตเมนต์", en: "See treatment prices" },
  heroPhotoAlt: {
    th: "ห้องทรีตเมนต์โทนชมพูอ่อน มีเตียงทรีตเมนต์และเครื่องมือดูแลผิว",
    en: "A soft pink treatment room with a treatment bed and skin care equipment",
  },
  nextFreeToday: { th: "คิวว่างถัดไปวันนี้ {time} · {staff}", en: "Next free time today {time} · {staff}" },
  nextFreeTomorrow: { th: "คิวว่างถัดไปพรุ่งนี้ {time} · {staff}", en: "Next free time tomorrow {time} · {staff}" },
  nextFreeNone: { th: "ดูเวลาว่างในหน้าจองคิว", en: "See free times on the booking page" },
  lineCardApp: { th: "LINE", en: "LINE" },
  lineCardNow: { th: "ตอนนี้", en: "now" },
  lineCardText: {
    th: "ยืนยันคิวแล้วค่ะ ทรีตเมนต์หน้าใสกับคุณมิว พรุ่งนี้ 13:00 น.",
    en: "Your booking is confirmed: Brightening facial with Khun Mew, tomorrow at 13:00.",
  },
  treatmentsTitle: { th: "ทรีตเมนต์และราคา", en: "Treatments and prices" },
  treatmentsBody: {
    th: "ราคารวมผลิตภัณฑ์แล้ว ไม่มีค่าใช้จ่ายเพิ่มหน้าเคาน์เตอร์ ถ้ายังไม่แน่ใจว่าเหมาะกับอะไร เริ่มจากปรึกษาแพทย์ได้ฟรี",
    en: "Prices include products, with nothing added at the counter. If you're not sure what suits your skin, start with a free consultation.",
  },
  teamTitle: { th: "ทีมที่ดูแลผิวคุณ", en: "The team who looks after your skin" },
  teamBody: {
    th: "ทุกเวลาว่างในหน้าจองคิวบอกไว้ว่าใครจะเป็นคนดูแลคุณ คุณจึงรู้ก่อนมาถึง",
    en: "Every free time on the booking page shows who will look after you, so you know before you arrive.",
  },
  staffPhotoAlt: { th: "รูป{name}", en: "Portrait of {name}" },
  staffTreatments: { th: "ทรีตเมนต์ที่{name}ดูแล", en: "Treatments with {name}" },
  clinicTitle: { th: "มาถึงแล้วไม่ต้องรอ", en: "No waiting when you arrive" },
  clinicBody: {
    th: "เราจองคิวแยกตามผู้ดูแลแต่ละคน ทุกคนจึงได้เวลาของตัวเองเต็ม ๆ ห้องทรีตเมนต์เป็นห้องส่วนตัว เงียบ และทำความสะอาดทุกรอบ",
    en: "We book each person's time separately, so your appointment is yours from start to finish. Treatment rooms are private, quiet and cleaned after every visit.",
  },
  interiorPhotoAlt: {
    th: "ห้องทรีตเมนต์สีขาว มีเก้าอี้ทรีตเมนต์และพื้นหินอ่อน",
    en: "A white treatment room with treatment chairs and a marble floor",
  },
  addressLabel: { th: "ที่อยู่", en: "Address" },
  addressNote: { th: "(ที่อยู่สมมติ)", en: "(a fictional address)" },
  hoursLabel: { th: "เวลาเปิด", en: "Opening hours" },
  parkingLabel: { th: "ที่จอดรถ", en: "Parking" },
  parking: { th: "จอดฟรี 2 ชั่วโมงที่อาคารข้างคลินิก", en: "Two hours of free parking in the building next door" },
  stepsTitle: { th: "จองคิวใน LINE ไม่ถึงนาที", en: "Book on LINE in under a minute" },
  stepsBody: {
    th: "สามขั้นตอน แล้วคิวของคุณจะเข้าตารางคลินิกทันที ก่อนถึงเวลานัด เราส่งข้อความเตือนให้ใน LINE",
    en: "Three steps, and your booking is in the clinic's schedule. We send a reminder on LINE before your appointment.",
  },
  stepsCta: { th: "เริ่มจองคิว", en: "Start booking" },
  footerNote: {
    th: "ลูมิ คลินิก เป็นคลินิกสมมติสำหรับเว็บตัวอย่าง ข้อมูลทั้งหมดไม่ใช่ของจริง",
    en: "Lumi Clinic is a fictional clinic made for a demo site. None of its details are real.",
  },
  footerAdmin: { th: "ดูระบบหลังร้านคลินิก", en: "See the clinic's back office" },
} satisfies Record<string, L>;

/** How booking works on the home page; matches the three taps on the booking page. */
export const homeSteps: { title: L; body: L }[] = [
  {
    title: { th: "เลือกทรีตเมนต์", en: "Pick a treatment" },
    body: { th: "เห็นราคาและเวลาที่ใช้ของทุกทรีตเมนต์", en: "Every treatment shows its price and how long it takes." },
  },
  {
    title: { th: "เลือกเวลาที่ว่าง", en: "Pick a free time" },
    body: { th: "ทุกเวลาบอกไว้ว่าใครจะเป็นคนดูแลคุณ", en: "Each time shows who will look after you." },
  },
  {
    title: { th: "กดยืนยัน", en: "Confirm" },
    body: { th: "ข้อความยืนยันส่งถึงคุณใน LINE ทันที", en: "Your confirmation arrives on LINE straight away." },
  },
];

export const statusLabel: Record<BookingStatus, L> = {
  booked: { th: "จองแล้ว", en: "Booked" },
  "checked-in": { th: "มาถึงแล้ว", en: "Arrived" },
  done: { th: "เสร็จสิ้น", en: "Done" },
  "no-show": { th: "ไม่มา", en: "No-show" },
};

export const errorText: Record<ClinicErrorCode, L> = {
  "name-required": { th: "กรุณากรอกชื่อ", en: "Please enter a name." },
  "phone-invalid": { th: "เบอร์โทรไม่ถูกต้อง", en: "That phone number doesn't look right." },
  "slot-taken": { th: "เวลานี้ไม่ว่างแล้ว กรุณาเลือกเวลาใหม่", en: "That time was just taken. Please pick another." },
  "customer-has-bookings": { th: "ลบไม่ได้ ลูกค้ารายนี้มีประวัติการจอง", en: "Can't delete: this customer has bookings." },
  "service-has-bookings": { th: "ลบไม่ได้ บริการนี้มีการจองอยู่", en: "Can't delete: this treatment has bookings." },
};

// The clinic's own (fictional) address. It stays in Thai in both languages, as a Thai business's address would.
export const CLINIC_ADDRESS = "ซอยทองหล่อ 13 แขวงคลองตันเหนือ กรุงเทพฯ";

import type { L } from "@/lib/demos/lang";

export const ui = {
  // Brand and hero (new)
  brand: { th: "ร้านดี", en: "Raan Dee" },
  heroKicker: { th: "ร้านดี · ระบบรับออเดอร์", en: "Raan Dee · order system" },
  heroTitle: { th: "ออเดอร์เข้าปุ๊บ เด้งใน LINE ปั๊บ", en: "An order comes in, and LINE pings right away" },
  heroSub: {
    th: "รับออเดอร์จากเว็บ แชต หรือหน้าร้านไว้ที่เดียว ร้านรู้ทันทีทุกครั้งที่มีออเดอร์ใหม่หรือสถานะเปลี่ยน",
    en: "Orders from your website, chat or counter land in one place, and you hear about every new order and status change straight away.",
  },
  benefitLine: { th: "แจ้งเตือนเข้า LINE ร้านอัตโนมัติ", en: "Automatic alerts in the shop's LINE" },
  benefitStatus: { th: "ติดตามสถานะ รอชำระ → ชำระแล้ว → ส่งแล้ว", en: "Track every order: pending → paid → shipped" },
  benefitApi: { th: "ต่อกับเว็บหรือแอปที่มีอยู่ได้ผ่าน API", en: "Connects to your existing website or app through an API" },
  devLogTitle: { th: "สำหรับนักพัฒนา", en: "For your developer" },
  devLogHint: { th: "คำขอ API ที่อยู่เบื้องหลังแต่ละข้อความ", en: "The API call behind each message" },
  tryIt: { th: "ลองยิงคำขอเอง", en: "Try a request yourself" },
  lanesHeading: { th: "ระบบทำงานอย่างไร", en: "How it works" },
  lanesSub: {
    th: "ทุกออเดอร์วิ่งจากหน้าร้านเข้า API แล้วแจ้งเตือนเข้า LINE ของร้าน",
    en: "Every order travels from your shop front through the API and into the shop's LINE.",
  },
  laneShop: { th: "หน้าร้าน / เว็บ", en: "Shop front / website" },
  laneApi: { th: "Orders API", en: "Orders API" },
  laneLine: { th: "LINE ของร้าน", en: "The shop's LINE" },
  lineNewTitle: { th: "🛒 ออเดอร์ใหม่", en: "🛒 New order" },
  lineNewBody: { th: "{items} ชิ้น · {total}", en: "Items: {items} · {total}" },
  lineStatusTitle: { th: "📦 อัปเดตสถานะออเดอร์", en: "📦 Order status updated" },
  lineStatusBody: { th: "{from} → {to}", en: "{from} → {to}" },
  statusPending: { th: "รอชำระ", en: "pending" },
  statusPaid: { th: "ชำระแล้ว", en: "paid" },
  statusShipped: { th: "ส่งแล้ว", en: "shipped" },
  statusCancelled: { th: "ยกเลิก", en: "cancelled" },
  exampleResponse: { th: "ตัวอย่าง response", en: "Example response" },
  exampleResponseHint: { th: "กด Send เพื่อยิงคำขอจริงในเบราว์เซอร์", en: "Press Send to make a real request in your browser" },
  resetDemo: { th: "รีเซ็ตข้อมูลตัวอย่าง", en: "Reset sample data" },
  navHow: { th: "ทำงานอย่างไร", en: "How it works" },
  storyPhoneLabel: { th: "ข้อความ LINE ตัวอย่างที่ร้านได้รับ", en: "Sample LINE messages the shop receives" },
  storyPause: { th: "หยุดตัวอย่างชั่วคราว", en: "Pause the sample" },
  storyPlay: { th: "เล่นตัวอย่างต่อ", en: "Play the sample" },
  laneNewOrder: { th: "{customer} สั่ง {items}", en: "{customer} orders {items}" },
  laneSetStatus: { th: "ตั้งสถานะเป็น{status}", en: "Marked as {status}" },
  laneSaved: { th: "บันทึก {id} แล้ว", en: "Saved {id}" },

  // page.tsx
  pageNavLabel: { th: "ในหน้านี้", en: "On this page" },
  navTry: { th: "ลองใช้งาน", en: "Try it" },
  navReference: { th: "อ้างอิง", en: "Reference" },
  baseUrl: { th: "Base URL", en: "Base URL" },
  auth: { th: "Auth", en: "Auth" },
  authValue: { th: "Bearer token (ไม่ต้องใช้ในเดโม)", en: "Bearer token (not needed in this demo)" },
  format: { th: "Format", en: "Format" },
  formatValue: { th: "JSON, UTF-8", en: "JSON, UTF-8" },
  referenceHeading: { th: "อ้างอิง", en: "Reference" },
  orderObject: { th: "Order", en: "Order" },
  orderObjectHint: {
    th: "หน้าตาข้อมูลออเดอร์ที่ทุก endpoint ส่งกลับมา",
    en: "The shape of the order data every endpoint returns",
  },
  statusFlow: { th: "ลำดับสถานะ", en: "Status flow" },
  cancelNotePre: { th: "เปลี่ยนเป็น", en: "Switch to" },
  cancelNotePost: {
    th: "ได้ทุกเมื่อ แต่เมื่อยกเลิกแล้วจะเปลี่ยนกลับไม่ได้ (409)",
    en: "at any time, but once cancelled an order cannot change back (409)",
  },
  statusCodesHeading: { th: "รหัสสถานะที่อาจได้รับ", en: "Status codes you may see" },
  statusCodesHint: {
    th: "ทุก error ส่งกลับเป็น JSON ที่มีช่อง error อธิบายเสมอ",
    en: "Every error comes back as JSON with an error field that explains it.",
  },
  footer: {
    th: "ร้านดีเป็นร้านสมมติ ทุกคำขอในหน้านี้ทำงานในเบราว์เซอร์ของคุณ ไม่มีข้อมูลถูกส่งออกไปที่ใด",
    en: "Raan Dee is a fictional shop. Every request on this page runs in your browser, and no data is sent anywhere.",
  },

  // playground.tsx
  endpointsHeading: { th: "Endpoints", en: "Endpoints" },
  endpointsHint: {
    th: "เลือก endpoint แล้วกด Send เพื่อลองยิงคำขอ ทุกอย่างจำลองในเบราว์เซอร์",
    en: "Pick an endpoint and press Send to try a request. Everything is simulated in your browser.",
  },

  // api-console.tsx
  requestPath: { th: "Request path", en: "Request path" },
  send: { th: "Send", en: "Send" },
  requestBody: { th: "Request body", en: "Request body" },
  sendShortcut: { th: "⌘/Ctrl + Enter เพื่อส่ง", en: "⌘/Ctrl + Enter to send" },
  jsonInvalid: {
    th: "JSON ไม่ถูกต้อง ตรวจวงเล็บปีกกาและเครื่องหมายคำพูดอีกครั้ง",
    en: "Invalid JSON. Check the curly braces and quotation marks again.",
  },
  invalidJsonBody: { th: "Invalid JSON body", en: "Invalid JSON body" },
  getNoBody: { th: "GET ไม่มี body", en: "GET has no body" },
  tryFilter: { th: "ลองกรองสถานะ:", en: "Try filtering by status:" },
  response: { th: "Response", en: "Response" },
  sending: { th: "กำลังส่งคำขอ", en: "Sending request" },
  checkedInBrowser: { th: "ตรวจในเบราว์เซอร์", en: "Checked in the browser" },
  waitingForServer: { th: "รอคำตอบจากเซิร์ฟเวอร์จำลอง…", en: "Waiting for the mock server…" },
  lineAsideLabel: { th: "ตัวอย่างแจ้งเตือน LINE", en: "LINE notification preview" },
  lineAsideHeading: { th: "แจ้งเตือนที่ร้านได้รับใน LINE", en: "What the shop receives in LINE" },
  lineAsideNote: {
    th: "ทุกออเดอร์ใหม่และทุกครั้งที่เปลี่ยนสถานะ ระบบส่งข้อความเข้า LINE ของร้านให้อัตโนมัติ",
    en: "For every new order and every status change, the system sends a message to the shop's LINE automatically.",
  },
  curl: { th: "curl", en: "curl" },
  copy: { th: "คัดลอก", en: "Copy" },
  copied: { th: "คัดลอกแล้ว", en: "Copied" },
  sampleDataPre: { th: "ข้อมูลตัวอย่างตอนนี้มี", en: "The sample data currently has" },
  sampleDataPost: {
    th: "ออเดอร์ เก็บไว้ในเบราว์เซอร์นี้เท่านั้น",
    en: "orders, stored only in this browser.",
  },

  // line-preview.tsx
  lineBotName: { th: "ร้านดี Bot", en: "Raan Dee Bot" },
  lineOfficialAccount: { th: "LINE Official Account", en: "LINE Official Account" },
  lineLogLabel: { th: "ข้อความ LINE จากร้านดี Bot", en: "LINE messages from Raan Dee Bot" },
  lineViewOrder: { th: "ดูออเดอร์", en: "View order" },
} satisfies Record<string, L>;

export const endpointCopy: Record<string, L> = {
  "GET /orders": {
    th: "ดูรายการออเดอร์ทั้งหมด กรองตามสถานะได้",
    en: "List orders, optionally filtered by status",
  },
  "GET /orders/:id": { th: "ดูรายละเอียดออเดอร์ทีละรายการ", en: "Get one order" },
  "POST /orders": {
    th: "สร้างออเดอร์ใหม่ แล้วแจ้งร้านทาง LINE",
    en: "Create an order and notify the shop on LINE",
  },
  "PATCH /orders/:id/status": {
    th: "เปลี่ยนสถานะออเดอร์ แล้วแจ้งทาง LINE",
    en: "Update order status and notify on LINE",
  },
};

export const statusHelp: Record<number, L> = {
  200: { th: "สำเร็จ ได้ข้อมูลกลับมาตามที่ขอ", en: "Success. You get back the data you asked for." },
  201: { th: "สร้างออเดอร์ใหม่เรียบร้อย", en: "The new order was created." },
  400: { th: "อ่าน JSON ที่ส่งมาไม่ได้", en: "The JSON you sent could not be read." },
  404: { th: "ไม่พบออเดอร์หรือเส้นทางนี้", en: "That order or route was not found." },
  405: { th: "เส้นทางนี้ไม่รองรับเมธอดที่ใช้", en: "This route does not support that method." },
  409: { th: "ออเดอร์ที่ยกเลิกแล้วเปลี่ยนสถานะไม่ได้", en: "A cancelled order cannot change status." },
  422: {
    th: "ข้อมูลไม่ครบหรือไม่ถูกต้อง มี details บอกว่าช่องไหนผิด",
    en: "The data is incomplete or invalid. The details field says which field is wrong.",
  },
};

export const orderFieldNotes: Record<string, L> = {
  id: { th: "รหัสออเดอร์ ระบบออกให้อัตโนมัติ เช่น ORD-1009", en: "The order ID, issued automatically, e.g. ORD-1009" },
  customer: { th: "ชื่อลูกค้า (บังคับ)", en: "The customer's name (required)" },
  items: {
    th: "รายการสินค้า แต่ละรายการมี sku, name, qty, price",
    en: "The items ordered. Each has sku, name, qty and price.",
  },
  total: { th: "ยอดรวมเป็นบาท คำนวณจาก qty × price ให้เอง", en: "The total in baht, calculated for you from qty × price" },
  status: { th: "pending, paid, shipped หรือ cancelled", en: "pending, paid, shipped or cancelled" },
  createdAt: { th: "เวลาที่สร้าง รูปแบบ ISO 8601", en: "When it was created, in ISO 8601 format" },
};

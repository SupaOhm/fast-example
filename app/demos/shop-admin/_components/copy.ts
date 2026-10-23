import type { L } from "@/lib/demos/lang";
import type { ShopChannel, ShopOrderStatus } from "@/lib/demos/shop-admin/data";

export const ui = {
  // Shell
  brand: { th: "ร้านดี", en: "Raan Dee" },
  brandTagline: { th: "ของฝากเชียงใหม่", en: "Chiang Mai souvenirs" },
  backOffice: { th: "ระบบหลังร้าน สาขานิมมาน", en: "Back office · Nimman branch" },
  ownerName: { th: "คุณนิ่ม", en: "Khun Nim" },
  ownerRole: { th: "เจ้าของร้าน", en: "Shop owner" },
  demoBanner: { th: "กำลังดูในฐานะเจ้าของร้าน (เดโม)", en: "Viewing as the shop owner (demo)" },
  logout: { th: "ออกจากระบบ", en: "Log out" },
  resetData: { th: "รีเซ็ตข้อมูล", en: "Reset data" },
  mainNav: { th: "เมนูหลัก", en: "Main menu" },
  navOverview: { th: "ภาพรวม", en: "Overview" },
  navOrders: { th: "คำสั่งซื้อ", en: "Orders" },
  navStock: { th: "สต็อกสินค้า", en: "Stock" },
  badgeOrders: { th: "รอแพ็ก {n} ออเดอร์", en: "{n} orders to pack" },
  badgeStock: { th: "ใกล้หมด {n} สินค้า", en: "{n} products running low" },

  // Overview
  greeting: { th: "สวัสดี คุณนิ่ม", en: "Hello, Khun Nim" },
  todayIs: { th: "วันนี้ {date}", en: "Today is {date}" },
  todoHeading: { th: "งานวันนี้", en: "Today's to-dos" },
  tileToPack: { th: "ต้องแพ็ก {n} ออเดอร์", en: "{n} orders to pack" },
  tileToPackAction: { th: "ดูออเดอร์ที่ต้องแพ็ก", en: "See orders to pack" },
  tileLow: { th: "ใกล้หมด {n} สินค้า", en: "{n} products running low" },
  tileLowAction: { th: "อัปเดตสต็อก", en: "Update stock" },
  tileSoldToday: { th: "ขายแล้ววันนี้", en: "Sold today" },
  tileSoldTodayFoot: { th: "{n} ออเดอร์ · ดูยอดขาย", en: "{n} orders · see sales" },
  queueHeading: { th: "คิวแพ็กของ", en: "Packing queue" },
  queueHint: {
    th: "แพ็กเสร็จแล้วกดปุ่มเดียว ระบบอัปเดตสถานะออเดอร์ให้ทันที",
    en: "Finished packing? One tap updates the order.",
  },
  markPacked: { th: "แพ็กแล้ว ✓", en: "Packed ✓" },
  markPackedLabel: { th: "แพ็กออเดอร์ {id} แล้ว", en: "Mark {id} as packed" },
  undo: { th: "เลิกทำ", en: "Undo" },
  undoLabel: { th: "เลิกทำออเดอร์ {id}", en: "Undo {id}" },
  queueEmpty: { th: "แพ็กครบทุกออเดอร์แล้ว", en: "Everything is packed." },
  queueMore: { th: "ดูอีก {n} ออเดอร์ในหน้าคำสั่งซื้อ", en: "See {n} more on the orders page" },
  salesHeading: { th: "ยอดขาย", en: "Sales" },
  dailySales: { th: "ยอดขายรายวัน", en: "Daily sales" },
  last30: { th: "30 วันล่าสุด", en: "Last 30 days" },
  salesDelta: { th: "{delta}% จากสัปดาห์ก่อน", en: "{delta}% on last week" },
  bestDay: { th: "วันที่ขายดีที่สุด {date}", en: "Best day {date}" },
  salesChartLabel: {
    th: "กราฟยอดขายรายวัน 30 วันล่าสุด รวม {total} วันที่ขายดีที่สุดคือ {date} {best}",
    en: "Daily sales for the last 30 days, {total} in total. The best day was {date} at {best}.",
  },
  topHeading: { th: "สินค้าขายดี", en: "Best sellers" },
  topHint: { th: "ตามยอดขาย 30 วัน", en: "By sales, last 30 days" },
  pieces: { th: "{n} ชิ้น", en: "{n} pcs" },
  channelHeading: { th: "ยอดขายตามช่องทาง", en: "Sales by channel" },
  orderCount: { th: "{n} บิล", en: "{n} orders" },

  // Orders
  ordersSummary: {
    th: "{n} บิลใน 30 วันล่าสุด รอแพ็ก {pack} บิล",
    en: "{n} orders in the last 30 days, {pack} to pack",
  },
  searchLabel: { th: "ค้นหาด้วยเลขที่บิลหรือชื่อลูกค้า", en: "Search by order number or customer" },
  searchPlaceholder: { th: "ค้นหาเลขที่บิล หรือชื่อลูกค้า", en: "Order number or customer name" },
  statusFilter: { th: "สถานะ", en: "Status" },
  statusAll: { th: "ทั้งหมด", en: "All" },
  orderStatusLabel: { th: "สถานะคำสั่งซื้อ {id}", en: "Order status {id}" },
  emptyTitle: { th: "ไม่พบคำสั่งซื้อที่ตรงกับตัวกรอง", en: "No orders match these filters" },
  emptyHint: {
    th: "ลองค้นด้วยเลขที่บิล เช่น RD-2001 หรือชื่อลูกค้า เช่น คุณเมย์",
    en: "Try an order number such as RD-2001, or a customer such as Khun May.",
  },
  clearFilters: { th: "ล้างตัวกรอง", en: "Clear filters" },
  pageRange: { th: "{from}–{to} จาก {n} บิล", en: "{from}–{to} of {n} orders" },
  prevPage: { th: "หน้าก่อนหน้า", en: "Previous page" },
  nextPage: { th: "หน้าถัดไป", en: "Next page" },
  receiptTotal: { th: "รวม", en: "Total" },

  // Stock
  stockIntro: {
    th: "แก้จำนวนคงเหลือแล้วกดบันทึก ระบบจะแจ้งเตือนเมื่อสินค้าถึงจุดสั่งซื้อ",
    en: "Change the count and press Save. Products at their reorder point are flagged.",
  },
  stockProducts: { th: "สินค้า", en: "Products" },
  stockItems: { th: "{n} รายการ", en: "{n} items" },
  stockValue: { th: "มูลค่าสต็อก", en: "Stock value" },
  stockUnits: { th: "รวม {n} ชิ้น", en: "{n} pieces in total" },
  lowStock: { th: "ใกล้หมด", en: "Running low" },
  colProduct: { th: "สินค้า", en: "Product" },
  colCategory: { th: "หมวด", en: "Category" },
  colPrice: { th: "ราคา", en: "Price" },
  colLevel: { th: "ระดับสต็อก", en: "Stock level" },
  colOnHand: { th: "คงเหลือ (ชิ้น)", en: "On hand (pcs)" },
  onHandLabel: { th: "จำนวนคงเหลือ {name}", en: "On hand: {name}" },
  save: { th: "บันทึก", en: "Save" },
  saved: { th: "บันทึกแล้ว", en: "Saved" },
  reorderAt: { th: "จุดสั่งซื้อ {n} ชิ้น", en: "Reorder at {n}" },
  stockError: { th: "ใส่จำนวนเต็มตั้งแต่ 0 ขึ้นไป", en: "Enter a whole number, 0 or more." },

  // Login
  loginTitle: { th: "ร้านดี — ระบบหลังร้าน", en: "Raan Dee back office" },
  loginSub: {
    th: "ดูยอดขาย จัดการคำสั่งซื้อ และอัปเดตสต็อกได้ในที่เดียว",
    en: "Sales, orders and stock, all in one place.",
  },
  email: { th: "อีเมล", en: "Email" },
  password: { th: "รหัสผ่าน", en: "Password" },
  loginNote: { th: "บัญชีตัวอย่าง กดเข้าสู่ระบบได้เลย", en: "This is a sample account. Just press Log in." },
  loginSubmit: { th: "เข้าสู่ระบบ", en: "Log in" },
  loginFoot: {
    th: "ข้อมูลในระบบตัวอย่างเก็บไว้ในเบราว์เซอร์นี้เท่านั้น",
    en: "The sample data is kept in this browser only.",
  },
} satisfies Record<string, L>;

export const statusLabel: Record<ShopOrderStatus, L> = {
  paid: { th: "รอแพ็ก", en: "To pack" },
  packed: { th: "แพ็กแล้ว", en: "Packed" },
  shipped: { th: "ส่งแล้ว", en: "Shipped" },
  cancelled: { th: "ยกเลิก", en: "Cancelled" },
};

export const channelLabel: Record<ShopChannel, L> = {
  line: { th: "LINE", en: "LINE" },
  shopee: { th: "Shopee", en: "Shopee" },
  store: { th: "หน้าร้าน", en: "In store" },
};

import { addDays, toISODate } from "@/lib/dates";
import type { L } from "@/lib/demos/lang";

export interface Product {
  sku: string;
  name: L;
  category: L;
  price: number;
  stock: number;
  reorderAt: number;
}

// "paid" orders are waiting to be packed; "packed" ones are waiting for the courier.
export type ShopOrderStatus = "paid" | "packed" | "shipped" | "cancelled";
export const SHOP_ORDER_STATUSES: ShopOrderStatus[] = ["paid", "packed", "shipped", "cancelled"];

export type ShopChannel = "line" | "shopee" | "store";
export const SHOP_CHANNELS: ShopChannel[] = ["line", "shopee", "store"];

export interface ShopOrder {
  id: string;
  customer: L;
  channel: ShopChannel;
  date: string;
  items: { sku: string; qty: number }[];
  total: number;
  status: ShopOrderStatus;
}

export interface ShopData {
  products: Product[];
  orders: ShopOrder[];
}

const CHILLI = { th: "น้ำพริก", en: "Chilli dips" };
const SNACKS = { th: "ของทานเล่น", en: "Snacks" };
const CURED = { th: "อาหารแปรรูป", en: "Sausages and cured pork" };
const DRINKS = { th: "เครื่องดื่ม", en: "Tea and coffee" };
const SWEETS = { th: "ขนม", en: "Sweets" };
const GIFTS = { th: "ชุดของขวัญ", en: "Gift sets" };

export const PRODUCTS: Product[] = [
  { sku: "NP-01", name: { th: "น้ำพริกหนุ่ม", en: "Nam prik num green chilli dip" }, category: CHILLI, price: 120, stock: 48, reorderAt: 15 },
  { sku: "NP-02", name: { th: "น้ำพริกอ่อง", en: "Nam prik ong tomato chilli dip" }, category: CHILLI, price: 120, stock: 9, reorderAt: 15 },
  { sku: "KM-01", name: { th: "แคบหมูไร้มัน", en: "Lean pork crackling" }, category: SNACKS, price: 80, stock: 64, reorderAt: 20 },
  { sku: "KM-02", name: { th: "แคบหมูติดมัน", en: "Classic pork crackling" }, category: SNACKS, price: 80, stock: 37, reorderAt: 20 },
  { sku: "SU-01", name: { th: "ไส้อั่วสูญญากาศ", en: "Sai ua sausage, vacuum-packed" }, category: CURED, price: 180, stock: 22, reorderAt: 10 },
  { sku: "SU-02", name: { th: "แหนมหมู", en: "Naem sour pork" }, category: CURED, price: 90, stock: 6, reorderAt: 12 },
  { sku: "TE-01", name: { th: "ชาอูหลงดอยแม่สลอง", en: "Doi Mae Salong oolong tea" }, category: DRINKS, price: 250, stock: 30, reorderAt: 8 },
  { sku: "CO-01", name: { th: "กาแฟดอยช้าง คั่วกลาง", en: "Doi Chang coffee, medium roast" }, category: DRINKS, price: 290, stock: 25, reorderAt: 8 },
  { sku: "SW-01", name: { th: "ข้าวแต๋นน้ำแตงโม", en: "Khao taen rice crackers" }, category: SWEETS, price: 60, stock: 75, reorderAt: 25 },
  { sku: "SW-02", name: { th: "ทองม้วนสด", en: "Thong muan rolled wafers" }, category: SWEETS, price: 70, stock: 41, reorderAt: 20 },
  { sku: "SW-03", name: { th: "มะขามแช่อิ่ม", en: "Candied tamarind" }, category: SWEETS, price: 85, stock: 18, reorderAt: 10 },
  { sku: "GF-01", name: { th: "กล่องของฝากรวม", en: "Chiang Mai gift box" }, category: GIFTS, price: 590, stock: 12, reorderAt: 5 },
];

const CUSTOMERS: L[] = [
  { th: "คุณเมย์", en: "Khun May" },
  { th: "คุณต้น", en: "Khun Ton" },
  { th: "คุณฝน", en: "Khun Fon" },
  { th: "คุณบอส", en: "Khun Boss" },
  { th: "คุณแอน", en: "Khun Ann" },
  { th: "คุณโจ้", en: "Khun Jo" },
  { th: "คุณปุ้ย", en: "Khun Pui" },
  { th: "คุณกิ๊ฟ", en: "Khun Gift" },
  { th: "คุณนิด", en: "Khun Nid" },
  { th: "คุณเอก", en: "Khun Ake" },
];

// Small deterministic PRNG so the seed is stable for tests and screenshots.
function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function buildShopSeed(today: Date): ShopData {
  const rand = mulberry32(42);
  const pick = <T,>(xs: T[]) => xs[Math.floor(rand() * xs.length)];
  const orders: ShopOrder[] = [];
  let n = 2001;
  for (let back = 29; back >= 0; back--) {
    const date = toISODate(addDays(today, -back));
    const count = 3 + Math.floor(rand() * 7);
    for (let k = 0; k < count; k++) {
      const lines = 1 + Math.floor(rand() * 3);
      const items: ShopOrder["items"] = [];
      for (let l = 0; l < lines; l++) {
        const sku = pick(PRODUCTS).sku;
        if (!items.some((i) => i.sku === sku)) items.push({ sku, qty: 1 + Math.floor(rand() * 4) });
      }
      const total = items.reduce((s, i) => s + PRODUCTS.find((p) => p.sku === i.sku)!.price * i.qty, 0);
      const r = rand();
      const status: ShopOrderStatus =
        r < 0.05 ? "cancelled" : back > 2 ? "shipped" : r < 0.5 ? "paid" : r < 0.8 ? "packed" : "shipped";
      orders.push({
        id: `RD-${n++}`,
        customer: pick(CUSTOMERS),
        channel: pick(SHOP_CHANNELS),
        date,
        items,
        total,
        status,
      });
    }
  }
  return { products: structuredClone(PRODUCTS), orders: orders.reverse() };
}

export function isLowStock(p: Product): boolean {
  return p.stock <= p.reorderAt;
}

function validOrders(data: ShopData) {
  return data.orders.filter((o) => o.status !== "cancelled");
}

export function dailySales(data: ShopData, today: Date, days = 30): { date: string; revenue: number }[] {
  const series = Array.from({ length: days }, (_, i) => ({ date: toISODate(addDays(today, i - days + 1)), revenue: 0 }));
  const index = new Map(series.map((d, i) => [d.date, i]));
  for (const o of validOrders(data)) {
    const i = index.get(o.date);
    if (i !== undefined) series[i].revenue += o.total;
  }
  return series;
}

export function kpis(data: ShopData, today: Date) {
  const from = toISODate(addDays(today, -29));
  const recent = validOrders(data).filter((o) => o.date >= from);
  const revenue30d = recent.reduce((s, o) => s + o.total, 0);
  return {
    revenue30d,
    orders30d: recent.length,
    avgOrderValue: recent.length ? Math.round(revenue30d / recent.length) : 0,
    lowStockCount: data.products.filter(isLowStock).length,
  };
}

export function topProducts(data: ShopData, n = 5) {
  const totals = new Map<string, { qty: number; revenue: number }>();
  for (const o of validOrders(data)) {
    for (const item of o.items) {
      const product = data.products.find((p) => p.sku === item.sku);
      if (!product) continue;
      const t = totals.get(item.sku) ?? { qty: 0, revenue: 0 };
      t.qty += item.qty;
      t.revenue += item.qty * product.price;
      totals.set(item.sku, t);
    }
  }
  return [...totals.entries()]
    .map(([sku, t]) => ({ sku, name: data.products.find((p) => p.sku === sku)!.name, ...t }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, n);
}

/** One day's takings, cancelled orders left out. */
export function salesOn(data: ShopData, date: string): { revenue: number; orders: number } {
  const day = validOrders(data).filter((o) => o.date === date);
  return { revenue: day.reduce((s, o) => s + o.total, 0), orders: day.length };
}

export function channelSales(data: ShopData, today: Date, days = 30) {
  const from = toISODate(addDays(today, 1 - days));
  return SHOP_CHANNELS.map((channel) => {
    const orders = validOrders(data).filter((o) => o.channel === channel && o.date >= from);
    return { channel, count: orders.length, revenue: orders.reduce((s, o) => s + o.total, 0) };
  }).sort((a, b) => b.revenue - a.revenue);
}

const oldestFirst = (a: ShopOrder, b: ShopOrder) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id);

/** Paid orders still waiting to be packed, oldest first. */
export function toPack(data: ShopData): ShopOrder[] {
  return data.orders.filter((o) => o.status === "paid").sort(oldestFirst);
}

/**
 * The overview's packing queue. Orders packed during this visit (`keep`) hold their
 * place, so a row doesn't jump away the moment the owner taps it.
 */
export function packingQueue(data: ShopData, keep: readonly string[], limit = 6): ShopOrder[] {
  return data.orders
    .filter((o) => o.status === "paid" || (o.status === "packed" && keep.includes(o.id)))
    .sort(oldestFirst)
    .slice(0, limit);
}

/** Marks a paid order as packed. Any other order is left as it is. */
export function markPacked(data: ShopData, id: string): ShopData {
  const order = data.orders.find((o) => o.id === id);
  return order?.status === "paid" ? setOrderStatus(data, id, "packed") : data;
}

export function updateStock(data: ShopData, sku: string, stock: number): ShopData {
  if (!Number.isInteger(stock) || stock < 0) throw new Error("Stock must be a whole number ≥ 0");
  if (!data.products.some((p) => p.sku === sku)) throw new Error(`Unknown SKU ${sku}`);
  return { ...data, products: data.products.map((p) => (p.sku === sku ? { ...p, stock } : p)) };
}

export function setOrderStatus(data: ShopData, id: string, status: ShopOrderStatus): ShopData {
  return { ...data, orders: data.orders.map((o) => (o.id === id ? { ...o, status } : o)) };
}

export type OrderFilter = ShopOrderStatus | "all";

/** The orders page's status filter from `?status=…`, so the overview can link to a filtered list. */
export function parseOrderFilter(search: string): OrderFilter {
  const status = new URLSearchParams(search).get("status");
  return SHOP_ORDER_STATUSES.find((s) => s === status) ?? "all";
}

/** Search by order number or customer name, in either language. */
export function matchesQuery(order: ShopOrder, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [order.id, order.customer.th, order.customer.en].some((s) => s.toLowerCase().includes(q));
}

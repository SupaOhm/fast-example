import { addDays, toISODate } from "@/lib/dates";

export interface Product {
  sku: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  reorderAt: number;
}

export type ShopOrderStatus = "paid" | "packing" | "shipped" | "cancelled";
export const SHOP_ORDER_STATUSES: ShopOrderStatus[] = ["paid", "packing", "shipped", "cancelled"];

export interface ShopOrder {
  id: string;
  customer: string;
  channel: "LINE" | "Shopee" | "หน้าร้าน";
  date: string;
  items: { sku: string; qty: number }[];
  total: number;
  status: ShopOrderStatus;
}

export interface ShopData {
  products: Product[];
  orders: ShopOrder[];
}

export const PRODUCTS: Product[] = [
  { sku: "NP-01", name: "น้ำพริกหนุ่ม", category: "น้ำพริก", price: 120, stock: 48, reorderAt: 15 },
  { sku: "NP-02", name: "น้ำพริกอ่อง", category: "น้ำพริก", price: 120, stock: 9, reorderAt: 15 },
  { sku: "KM-01", name: "แคบหมูไร้มัน", category: "ของทานเล่น", price: 80, stock: 64, reorderAt: 20 },
  { sku: "KM-02", name: "แคบหมูติดมัน", category: "ของทานเล่น", price: 80, stock: 37, reorderAt: 20 },
  { sku: "SU-01", name: "ไส้อั่วสูญญากาศ", category: "อาหารแปรรูป", price: 180, stock: 22, reorderAt: 10 },
  { sku: "SU-02", name: "แหนมหมู", category: "อาหารแปรรูป", price: 90, stock: 6, reorderAt: 12 },
  { sku: "TE-01", name: "ชาอูหลงดอยแม่สลอง", category: "เครื่องดื่ม", price: 250, stock: 30, reorderAt: 8 },
  { sku: "CO-01", name: "กาแฟดอยช้าง คั่วกลาง", category: "เครื่องดื่ม", price: 290, stock: 25, reorderAt: 8 },
  { sku: "SW-01", name: "ข้าวแต๋นน้ำแตงโม", category: "ขนม", price: 60, stock: 75, reorderAt: 25 },
  { sku: "SW-02", name: "ทองม้วนสด", category: "ขนม", price: 70, stock: 41, reorderAt: 20 },
  { sku: "SW-03", name: "มะขามแช่อิ่ม", category: "ขนม", price: 85, stock: 18, reorderAt: 10 },
  { sku: "GF-01", name: "กล่องของฝากรวม", category: "ชุดของขวัญ", price: 590, stock: 12, reorderAt: 5 },
];

const CUSTOMERS = ["คุณเมย์", "คุณต้น", "คุณฝน", "คุณบอส", "คุณแอน", "คุณโจ้", "คุณปุ้ย", "คุณกิ๊ฟ", "คุณนิด", "คุณเอก"];
const CHANNELS: ShopOrder["channel"][] = ["LINE", "Shopee", "หน้าร้าน"];

// Small deterministic PRNG so the seed is stable for tests and screenshots.
export function mulberry32(seed: number): () => number {
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
        r < 0.05 ? "cancelled" : back > 2 ? "shipped" : r < 0.5 ? "paid" : r < 0.8 ? "packing" : "shipped";
      orders.push({ id: `RD-${n++}`, customer: pick(CUSTOMERS), channel: pick(CHANNELS), date, items, total, status });
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

export function updateStock(data: ShopData, sku: string, stock: number): ShopData {
  if (!Number.isInteger(stock) || stock < 0) throw new Error("Stock must be a whole number ≥ 0");
  if (!data.products.some((p) => p.sku === sku)) throw new Error(`Unknown SKU ${sku}`);
  return { ...data, products: data.products.map((p) => (p.sku === sku ? { ...p, stock } : p)) };
}

export function setOrderStatus(data: ShopData, id: string, status: ShopOrderStatus): ShopData {
  return { ...data, orders: data.orders.map((o) => (o.id === id ? { ...o, status } : o)) };
}

import type { Order } from "./api";

export const SEED_ORDERS: Order[] = [
  { id: "ORD-1008", customer: "คุณเมย์ (ตัวอย่าง)", items: [{ sku: "NP-01", name: "น้ำพริกหนุ่ม", qty: 3, price: 120 }], total: 360, status: "pending", createdAt: "2026-10-19T03:12:00.000Z" },
  { id: "ORD-1007", customer: "คุณต้น (ตัวอย่าง)", items: [{ sku: "SU-03", name: "ไส้อั่ว", qty: 2, price: 180 }], total: 360, status: "paid", createdAt: "2026-10-18T09:40:00.000Z" },
  { id: "ORD-1006", customer: "คุณฝน (ตัวอย่าง)", items: [{ sku: "KM-02", name: "แคบหมู", qty: 4, price: 80 }], total: 320, status: "paid", createdAt: "2026-10-18T05:05:00.000Z" },
  { id: "ORD-1005", customer: "คุณบอส (ตัวอย่าง)", items: [{ sku: "TE-04", name: "ชาอูหลง", qty: 1, price: 250 }, { sku: "NP-01", name: "น้ำพริกหนุ่ม", qty: 1, price: 120 }], total: 370, status: "shipped", createdAt: "2026-10-17T11:22:00.000Z" },
  { id: "ORD-1004", customer: "คุณแอน (ตัวอย่าง)", items: [{ sku: "CO-05", name: "กาแฟดอยช้าง", qty: 2, price: 290 }], total: 580, status: "cancelled", createdAt: "2026-10-16T14:00:00.000Z" },
  { id: "ORD-1003", customer: "คุณโจ้ (ตัวอย่าง)", items: [{ sku: "SU-03", name: "ไส้อั่ว", qty: 1, price: 180 }], total: 180, status: "shipped", createdAt: "2026-10-16T02:30:00.000Z" },
  { id: "ORD-1002", customer: "คุณปุ้ย (ตัวอย่าง)", items: [{ sku: "KM-02", name: "แคบหมู", qty: 2, price: 80 }, { sku: "TE-04", name: "ชาอูหลง", qty: 1, price: 250 }], total: 410, status: "shipped", createdAt: "2026-10-15T08:15:00.000Z" },
  { id: "ORD-1001", customer: "คุณกิ๊ฟ (ตัวอย่าง)", items: [{ sku: "NP-01", name: "น้ำพริกหนุ่ม", qty: 2, price: 120 }], total: 240, status: "paid", createdAt: "2026-10-15T01:00:00.000Z" },
];

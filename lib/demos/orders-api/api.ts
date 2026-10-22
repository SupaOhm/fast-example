export type OrderStatus = "pending" | "paid" | "shipped" | "cancelled";
export const ORDER_STATUSES: OrderStatus[] = ["pending", "paid", "shipped", "cancelled"];

export interface OrderItem {
  sku: string;
  name: string;
  qty: number;
  price: number;
}

export interface Order {
  id: string;
  customer: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
}

export type HttpMethod = "GET" | "POST" | "PATCH";

export interface ApiRequest {
  method: HttpMethod;
  path: string;
  body?: unknown;
}

export type LineNotification =
  | { kind: "new"; orderId: string; customer: string; itemCount: number; total: number }
  | { kind: "status"; orderId: string; customer: string; from: OrderStatus; to: OrderStatus };

export interface ApiResponse {
  status: number;
  body: unknown;
  notification?: LineNotification;
}

export interface ApiResult {
  orders: Order[];
  response: ApiResponse;
}

export const ENDPOINTS: { method: HttpMethod; path: string; summary: string; example: { path: string; body?: unknown } }[] = [
  { method: "GET", path: "/orders", summary: "List orders, optionally filtered by ?status=", example: { path: "/orders?status=paid" } },
  { method: "GET", path: "/orders/:id", summary: "Get one order", example: { path: "/orders/ORD-1001" } },
  {
    method: "POST",
    path: "/orders",
    summary: "Create an order and notify the shop on LINE",
    example: {
      path: "/orders",
      body: { customer: "คุณนิด (ตัวอย่าง)", items: [{ sku: "NP-01", name: "น้ำพริกหนุ่ม", qty: 2, price: 120 }] },
    },
  },
  {
    method: "PATCH",
    path: "/orders/:id/status",
    summary: "Update order status and notify on LINE",
    example: { path: "/orders/ORD-1001/status", body: { status: "shipped" } },
  },
];

const respond = (status: number, body: unknown, notification?: LineNotification): ApiResponse =>
  notification ? { status, body, notification } : { status, body };

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function isStatus(v: unknown): v is OrderStatus {
  return typeof v === "string" && (ORDER_STATUSES as string[]).includes(v);
}

function validateNewOrder(body: unknown): { customer: string; items: OrderItem[] } | string[] {
  if (!isRecord(body)) return ["body must be a JSON object"];
  const details: string[] = [];
  const customer = typeof body.customer === "string" ? body.customer.trim() : "";
  if (!customer) details.push("customer is required");
  if (!Array.isArray(body.items) || body.items.length === 0) {
    details.push("items must be a non-empty array");
    return details;
  }
  const items: OrderItem[] = [];
  body.items.forEach((raw, i) => {
    const item = isRecord(raw) ? raw : {};
    const sku = typeof item.sku === "string" ? item.sku.trim() : "";
    const name = typeof item.name === "string" ? item.name.trim() : "";
    if (!sku) details.push(`items[${i}].sku is required`);
    if (!name) details.push(`items[${i}].name is required`);
    if (!Number.isInteger(item.qty) || (item.qty as number) < 1) details.push(`items[${i}].qty must be an integer ≥ 1`);
    if (typeof item.price !== "number" || item.price < 0) details.push(`items[${i}].price must be a number ≥ 0`);
    items.push({ sku, name, qty: item.qty as number, price: item.price as number });
  });
  return details.length ? details : { customer, items };
}

function nextId(orders: Order[]): string {
  const max = orders.reduce((m, o) => Math.max(m, Number(o.id.replace("ORD-", "")) || 0), 1000);
  return `ORD-${String(max + 1).padStart(4, "0")}`;
}

export function handleRequest(orders: Order[], req: ApiRequest, now: Date = new Date()): ApiResult {
  const url = new URL(req.path, "https://api.example.test");
  const segments = url.pathname.split("/").filter(Boolean);
  const same = (response: ApiResponse): ApiResult => ({ orders, response });

  if (segments[0] !== "orders" || segments.length > 3) return same(respond(404, { error: "Route not found" }));

  if (segments.length === 1) {
    if (req.method === "GET") {
      const status = url.searchParams.get("status");
      if (status !== null && !isStatus(status)) {
        return same(respond(422, { error: "Invalid status filter", allowed: ORDER_STATUSES }));
      }
      const data = status ? orders.filter((o) => o.status === status) : orders;
      return same(respond(200, { data, count: data.length }));
    }
    if (req.method === "POST") {
      const parsed = validateNewOrder(req.body);
      if (Array.isArray(parsed)) return same(respond(422, { error: "Validation failed", details: parsed }));
      const order: Order = {
        id: nextId(orders),
        customer: parsed.customer,
        items: parsed.items,
        total: parsed.items.reduce((sum, i) => sum + i.qty * i.price, 0),
        status: "pending",
        createdAt: now.toISOString(),
      };
      return {
        orders: [order, ...orders],
        response: respond(201, { data: order }, {
          kind: "new",
          orderId: order.id,
          customer: order.customer,
          itemCount: order.items.reduce((sum, i) => sum + i.qty, 0),
          total: order.total,
        }),
      };
    }
    return same(respond(405, { error: "Method not allowed" }));
  }

  const id = decodeURIComponent(segments[1]);
  const order = orders.find((o) => o.id === id);

  if (segments.length === 2) {
    if (req.method !== "GET") return same(respond(405, { error: "Method not allowed" }));
    return same(order ? respond(200, { data: order }) : respond(404, { error: `Order ${id} not found` }));
  }

  if (segments[2] !== "status") return same(respond(404, { error: "Route not found" }));
  if (req.method !== "PATCH") return same(respond(405, { error: "Method not allowed" }));
  if (!order) return same(respond(404, { error: `Order ${id} not found` }));
  const status = isRecord(req.body) ? req.body.status : undefined;
  if (!isStatus(status)) return same(respond(422, { error: "Invalid status", allowed: ORDER_STATUSES }));
  if (order.status === "cancelled" && status !== "cancelled") {
    return same(respond(409, { error: "Cancelled orders cannot change status" }));
  }
  const updated: Order = { ...order, status };
  return {
    orders: orders.map((o) => (o.id === id ? updated : o)),
    response: respond(200, { data: updated }, {
      kind: "status",
      orderId: updated.id,
      customer: updated.customer,
      from: order.status,
      to: status,
    }),
  };
}

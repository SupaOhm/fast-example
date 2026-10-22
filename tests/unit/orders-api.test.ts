import { describe, expect, it } from "vitest";
import { handleRequest, type Order } from "@/lib/demos/orders-api/api";
import { SEED_ORDERS } from "@/lib/demos/orders-api/seed";

const now = new Date("2026-10-19T10:00:00.000Z");
const seed = (): Order[] => structuredClone(SEED_ORDERS);

describe("GET /orders", () => {
  it("lists all orders", () => {
    const { response } = handleRequest(seed(), { method: "GET", path: "/orders" });
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ count: 8 });
  });

  it("filters by status", () => {
    const { response } = handleRequest(seed(), { method: "GET", path: "/orders?status=paid" });
    const body = response.body as { data: Order[]; count: number };
    expect(body.count).toBe(body.data.length);
    expect(body.data.every((o) => o.status === "paid")).toBe(true);
  });

  it("rejects an invalid status filter", () => {
    const { response } = handleRequest(seed(), { method: "GET", path: "/orders?status=lost" });
    expect(response.status).toBe(422);
  });
});

describe("GET /orders/:id", () => {
  it("returns one order", () => {
    const { response } = handleRequest(seed(), { method: "GET", path: "/orders/ORD-1001" });
    expect(response.status).toBe(200);
    expect((response.body as { data: Order }).data.id).toBe("ORD-1001");
  });

  it("404s on unknown id", () => {
    const { response } = handleRequest(seed(), { method: "GET", path: "/orders/ORD-9999" });
    expect(response).toEqual({ status: 404, body: { error: "Order ORD-9999 not found" } });
  });
});

describe("POST /orders", () => {
  const body = {
    customer: "คุณนิด (ตัวอย่าง)",
    items: [
      { sku: "NP-01", name: "น้ำพริกหนุ่ม", qty: 2, price: 120 },
      { sku: "KM-02", name: "แคบหมู", qty: 1, price: 80 },
    ],
  };

  it("creates an order with the next id, computed total and a LINE notification", () => {
    const orders = seed();
    const { orders: next, response } = handleRequest(orders, { method: "POST", path: "/orders", body }, now);
    expect(response.status).toBe(201);
    const created = (response.body as { data: Order }).data;
    expect(created).toMatchObject({ id: "ORD-1009", total: 320, status: "pending", createdAt: now.toISOString() });
    expect(next).toHaveLength(9);
    expect(next[0].id).toBe("ORD-1009");
    expect(orders).toHaveLength(8);
    expect(response.notification).toMatchObject({ kind: "new", orderId: "ORD-1009" });
  });

  it("returns 422 with details for invalid bodies", () => {
    const { orders, response } = handleRequest(
      seed(),
      { method: "POST", path: "/orders", body: { customer: "", items: [{ sku: "", name: "x", qty: 0, price: -1 }] } },
      now,
    );
    expect(response.status).toBe(422);
    expect((response.body as { details: string[] }).details).toEqual([
      "customer is required",
      "items[0].sku is required",
      "items[0].qty must be an integer ≥ 1",
      "items[0].price must be a number ≥ 0",
    ]);
    expect(orders).toHaveLength(8);
  });

  it("rejects a non-object body", () => {
    const { response } = handleRequest(seed(), { method: "POST", path: "/orders", body: "hi" }, now);
    expect(response.status).toBe(422);
  });
});

describe("PATCH /orders/:id/status", () => {
  it("updates status with a notification", () => {
    const { orders, response } = handleRequest(seed(), {
      method: "PATCH",
      path: "/orders/ORD-1001/status",
      body: { status: "shipped" },
    });
    expect(response.status).toBe(200);
    expect(orders.find((o) => o.id === "ORD-1001")?.status).toBe("shipped");
    expect(response.notification).toMatchObject({ kind: "status", to: "shipped" });
  });

  it("rejects invalid status, unknown id and cancelled orders", () => {
    expect(
      handleRequest(seed(), { method: "PATCH", path: "/orders/ORD-1001/status", body: { status: "lost" } }).response.status,
    ).toBe(422);
    expect(
      handleRequest(seed(), { method: "PATCH", path: "/orders/ORD-9999/status", body: { status: "paid" } }).response.status,
    ).toBe(404);
    expect(
      handleRequest(seed(), { method: "PATCH", path: "/orders/ORD-1004/status", body: { status: "paid" } }).response.status,
    ).toBe(409);
  });
});

describe("routing", () => {
  it("404s unknown routes and 405s wrong methods", () => {
    expect(handleRequest(seed(), { method: "GET", path: "/users" }).response.status).toBe(404);
    expect(handleRequest(seed(), { method: "PATCH", path: "/orders" }).response.status).toBe(405);
    expect(handleRequest(seed(), { method: "POST", path: "/orders/ORD-1001" }).response.status).toBe(405);
  });
});

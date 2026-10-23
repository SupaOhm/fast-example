import { describe, expect, it } from "vitest";
import { toISODate } from "@/lib/dates";
import {
  buildShopSeed,
  channelSales,
  dailySales,
  isLowStock,
  kpis,
  markPacked,
  matchesQuery,
  packingQueue,
  parseOrderFilter,
  PRODUCTS,
  salesOn,
  setOrderStatus,
  SHOP_CHANNELS,
  toPack,
  topProducts,
  updateStock,
} from "@/lib/demos/shop-admin/data";

const today = new Date(2026, 9, 19);

describe("buildShopSeed", () => {
  it("is deterministic for the same day", () => {
    expect(buildShopSeed(today)).toEqual(buildShopSeed(today));
  });

  it("covers the last 30 days with valid orders", () => {
    const data = buildShopSeed(today);
    const dates = new Set(data.orders.map((o) => o.date));
    expect(dates.size).toBe(30);
    expect([...dates].sort().at(-1)).toBe("2026-10-19");
    expect([...dates].sort()[0]).toBe("2026-09-20");
    for (const order of data.orders) {
      const expected = order.items.reduce((sum, item) => {
        const product = PRODUCTS.find((p) => p.sku === item.sku)!;
        return sum + product.price * item.qty;
      }, 0);
      expect(order.total).toBe(expected);
      expect(SHOP_CHANNELS).toContain(order.channel);
      expect(order.customer.th).toMatch(/^คุณ/);
      expect(order.customer.en).toMatch(/^Khun /);
    }
  });

  it("includes at least two low-stock products", () => {
    expect(buildShopSeed(today).products.filter(isLowStock).length).toBeGreaterThanOrEqual(2);
  });

  it("only recent orders still wait to be packed or for the courier", () => {
    const data = buildShopSeed(today);
    const old = data.orders.filter((o) => o.date < "2026-10-17");
    expect(old.every((o) => o.status === "shipped" || o.status === "cancelled")).toBe(true);
    expect(toPack(data).length).toBeGreaterThanOrEqual(3);
    expect(data.orders.some((o) => o.status === "packed")).toBe(true);
  });

  it("names every product in Thai and English", () => {
    for (const p of PRODUCTS) {
      expect(p.name.th.trim()).not.toBe("");
      expect(p.name.en.trim()).not.toBe("");
      expect(p.category.en.trim()).not.toBe("");
    }
  });
});

describe("metrics", () => {
  const data = buildShopSeed(today);

  it("kpis exclude cancelled orders", () => {
    const valid = data.orders.filter((o) => o.status !== "cancelled");
    const k = kpis(data, today);
    expect(k.orders30d).toBe(valid.length);
    expect(k.revenue30d).toBe(valid.reduce((s, o) => s + o.total, 0));
    expect(k.avgOrderValue).toBe(Math.round(k.revenue30d / k.orders30d));
    expect(k.lowStockCount).toBe(data.products.filter(isLowStock).length);
  });

  it("dailySales returns one ascending entry per day that sums to revenue", () => {
    const series = dailySales(data, today);
    expect(series).toHaveLength(30);
    expect(series[0].date).toBe("2026-09-20");
    expect(series.at(-1)!.date).toBe(toISODate(today));
    expect(series.reduce((s, d) => s + d.revenue, 0)).toBe(kpis(data, today).revenue30d);
  });

  it("topProducts is sorted by revenue, capped, and named in both languages", () => {
    const top = topProducts(data, 5);
    expect(top.length).toBeLessThanOrEqual(5);
    for (let i = 1; i < top.length; i++) expect(top[i - 1].revenue).toBeGreaterThanOrEqual(top[i].revenue);
    expect(top[0].name.en.length).toBeGreaterThan(0);
  });

  it("salesOn counts one day's valid orders", () => {
    const day = toISODate(today);
    const valid = data.orders.filter((o) => o.date === day && o.status !== "cancelled");
    expect(salesOn(data, day)).toEqual({ revenue: valid.reduce((s, o) => s + o.total, 0), orders: valid.length });
    expect(salesOn(data, day).orders).toBeGreaterThan(0);
    expect(salesOn(data, "2020-01-01")).toEqual({ revenue: 0, orders: 0 });
  });

  it("channelSales splits the last 30 days by channel, biggest first", () => {
    const rows = channelSales(data, today);
    expect(rows.map((r) => r.channel).sort()).toEqual([...SHOP_CHANNELS].sort());
    expect(rows.reduce((s, r) => s + r.revenue, 0)).toBe(kpis(data, today).revenue30d);
    for (let i = 1; i < rows.length; i++) expect(rows[i - 1].revenue).toBeGreaterThanOrEqual(rows[i].revenue);
  });
});

describe("packing", () => {
  const data = buildShopSeed(today);

  it("toPack lists paid orders, oldest first", () => {
    const queue = toPack(data);
    expect(queue.every((o) => o.status === "paid")).toBe(true);
    for (let i = 1; i < queue.length; i++) {
      const [a, b] = [queue[i - 1], queue[i]];
      expect(a.date < b.date || (a.date === b.date && a.id < b.id)).toBe(true);
    }
  });

  it("markPacked moves a paid order to packed and leaves others alone", () => {
    const first = toPack(data)[0];
    const next = markPacked(data, first.id);
    expect(next.orders.find((o) => o.id === first.id)?.status).toBe("packed");
    expect(toPack(next)).toHaveLength(toPack(data).length - 1);
    expect(data.orders.find((o) => o.id === first.id)?.status).toBe("paid");
    const shipped = data.orders.find((o) => o.status === "shipped")!;
    expect(markPacked(data, shipped.id)).toBe(data);
  });

  it("packingQueue keeps orders packed this visit in their place", () => {
    const queue = packingQueue(data, [], 4);
    expect(queue).toHaveLength(4);
    const packed = markPacked(data, queue[1].id);
    expect(packingQueue(packed, [queue[1].id], 4).map((o) => o.id)).toEqual(queue.map((o) => o.id));
    expect(packingQueue(packed, [], 4).map((o) => o.id)).not.toContain(queue[1].id);
  });
});

describe("orders page helpers", () => {
  const data = buildShopSeed(today);

  it("parseOrderFilter reads a known status from the query string", () => {
    expect(parseOrderFilter("?status=paid")).toBe("paid");
    expect(parseOrderFilter("status=cancelled")).toBe("cancelled");
    expect(parseOrderFilter("?status=nope")).toBe("all");
    expect(parseOrderFilter("")).toBe("all");
  });

  it("matchesQuery finds an order by number or by either name", () => {
    const o = data.orders[0];
    expect(matchesQuery(o, "")).toBe(true);
    expect(matchesQuery(o, o.id.toLowerCase())).toBe(true);
    expect(matchesQuery(o, `  ${o.customer.th} `)).toBe(true);
    expect(matchesQuery(o, o.customer.en.toUpperCase())).toBe(true);
    expect(matchesQuery(o, "ไม่มีลูกค้าคนนี้")).toBe(false);
  });
});

describe("mutations", () => {
  const data = buildShopSeed(today);

  it("updateStock is immutable and validates", () => {
    const sku = data.products[0].sku;
    const next = updateStock(data, sku, 99);
    expect(next.products[0].stock).toBe(99);
    expect(data.products[0].stock).not.toBe(99);
    expect(() => updateStock(data, sku, -1)).toThrow();
    expect(() => updateStock(data, sku, 1.5)).toThrow();
    expect(() => updateStock(data, "NOPE", 1)).toThrow();
  });

  it("setOrderStatus updates one order", () => {
    const id = data.orders[0].id;
    const next = setOrderStatus(data, id, "cancelled");
    expect(next.orders.find((o) => o.id === id)?.status).toBe("cancelled");
    expect(data.orders.find((o) => o.id === id)?.status).not.toBe("cancelled");
  });
});

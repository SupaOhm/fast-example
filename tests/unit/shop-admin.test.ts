import { describe, expect, it } from "vitest";
import { toISODate } from "@/lib/dates";
import {
  buildShopSeed,
  dailySales,
  isLowStock,
  kpis,
  PRODUCTS,
  setOrderStatus,
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
    }
  });

  it("includes at least two low-stock products", () => {
    expect(buildShopSeed(today).products.filter(isLowStock).length).toBeGreaterThanOrEqual(2);
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

  it("topProducts is sorted by revenue and capped", () => {
    const top = topProducts(data, 5);
    expect(top.length).toBeLessThanOrEqual(5);
    for (let i = 1; i < top.length; i++) expect(top[i - 1].revenue).toBeGreaterThanOrEqual(top[i].revenue);
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

import { createDemoStore } from "@/lib/demo-store";
import { toISODate } from "@/lib/dates";
import { buildShopSeed, type ShopData } from "./data";

export const shopSession = createDemoStore<boolean>("shop-admin:session", false);
// The seed is built relative to today. The data key is scoped by day so a
// visitor returning on a later day gets a fresh seed instead of a saved
// dataset whose fixed calendar dates have drifted out of the "today"/30-day
// windows. Session keys stay unscoped (the e2e smoke test seeds them).
export const shopData = createDemoStore<ShopData>(
  `shop-admin:data:${toISODate(new Date())}`,
  buildShopSeed(new Date()),
);

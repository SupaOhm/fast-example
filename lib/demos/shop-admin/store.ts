import { createDemoStore } from "@/lib/demo-store";
import { buildShopSeed, type ShopData } from "./data";

export const shopSession = createDemoStore<boolean>("shop-admin:session", false);
export const shopData = createDemoStore<ShopData>("shop-admin:data", buildShopSeed(new Date()));

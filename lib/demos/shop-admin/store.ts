import { createDemoStore, pruneDemoKeys } from "@/lib/demo-store";
import { toISODate } from "@/lib/dates";
import { buildShopSeed, type ShopData } from "./data";

// The demo opens signed in, so visitors land on the overview. Logging out stores
// false, and the login screen then guards the admin until they log in again.
// v2: visitors who logged out under the first build have `false` stored under the old key.
export const shopSession = createDemoStore<boolean>("shop-admin:session:v2", true);
// The seed is built relative to today. The data key is scoped by day so a
// visitor returning on a later day gets a fresh seed instead of a saved
// dataset whose fixed calendar dates have drifted out of the "today"/30-day
// windows. "v2" drops data saved before names became bilingual.
const dataKey = `shop-admin:data:v2:${toISODate(new Date())}`;
export const shopData = createDemoStore<ShopData>(dataKey, buildShopSeed(new Date()));
// Earlier days' data and the v1 keys are never read again.
pruneDemoKeys("shop-admin:", ["shop-admin:session:v2", dataKey]);

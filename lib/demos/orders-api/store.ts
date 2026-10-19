import { createDemoStore } from "@/lib/demo-store";
import type { Order } from "./api";
import { SEED_ORDERS } from "./seed";

export const ordersStore = createDemoStore<Order[]>("orders-api:orders", SEED_ORDERS);

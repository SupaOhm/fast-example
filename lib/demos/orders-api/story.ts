import { handleRequest, type ApiRequest, type ApiResponse, type Order } from "./api";

export interface StoryEvent {
  seq: number;
  request: ApiRequest;
  response: ApiResponse;
}

// Four sample orders from a northern-Thai snack shop. They arrive, get paid and ship, interleaved like a real morning.
const ORDERS = [
  { customer: "คุณนิด", items: [{ sku: "NP-01", name: "น้ำพริกหนุ่ม", qty: 2, price: 120 }] },
  { customer: "คุณต้น", items: [{ sku: "KM-02", name: "แคบหมู", qty: 3, price: 80 }] },
  { customer: "คุณแอน", items: [{ sku: "SU-03", name: "ไส้อั่ว", qty: 1, price: 180 }] },
  { customer: "คุณเมย์", items: [{ sku: "NA-04", name: "น้ำพริกอ่อง", qty: 2, price: 110 }] },
];

type Step = [order: number, action: "new" | "paid" | "shipped"];

const STORY: Step[] = [
  [0, "new"], [1, "new"], [0, "paid"], [2, "new"], [1, "paid"], [0, "shipped"],
  [3, "new"], [2, "paid"], [1, "shipped"], [3, "paid"], [2, "shipped"], [3, "shipped"],
];

export const STORY_LENGTH = STORY.length;

/** One full round of the story, replayed through the real mock API on a fresh, private order list. */
export function storyEvents(now: Date): StoryEvent[] {
  let orders: Order[] = [];
  const ids: string[] = [];
  return STORY.map(([n, action], seq) => {
    const request: ApiRequest =
      action === "new"
        ? { method: "POST", path: "/orders", body: ORDERS[n] }
        : { method: "PATCH", path: `/orders/${ids[n]}/status`, body: { status: action } };
    const result = handleRequest(orders, request, new Date(now.getTime() + seq * 60_000));
    orders = result.orders;
    if (action === "new") ids[n] = (result.response.body as { data: Order }).data.id;
    return { seq, request, response: result.response };
  });
}

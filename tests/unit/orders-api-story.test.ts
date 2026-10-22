import { describe, expect, it } from "vitest";
import { STORY_LENGTH, storyEvents } from "@/lib/demos/orders-api/story";

const now = new Date("2026-10-22T03:00:00.000Z");

describe("storyEvents", () => {
  const events = storyEvents(now);

  it("plays one full round of the story", () => {
    expect(events).toHaveLength(STORY_LENGTH);
    expect(events.map((e) => e.seq)).toEqual(events.map((_, i) => i));
  });

  it("only makes requests the API accepts", () => {
    for (const e of events) expect(e.response.status).toBeLessThan(300);
  });

  it("opens with a new order that pings LINE", () => {
    expect(events[0].request.method).toBe("POST");
    expect(events[0].response.status).toBe(201);
    expect(events[0].response.notification).toMatchObject({ kind: "new", orderId: "ORD-1001" });
  });

  it("ends with every order shipped", () => {
    const last = new Map<string, string>();
    for (const e of events) {
      const n = e.response.notification;
      if (n?.kind === "new") last.set(n.orderId, "pending");
      if (n?.kind === "status") last.set(n.orderId, n.to);
    }
    expect([...last.values()].every((s) => s === "shipped")).toBe(true);
    expect(last.size).toBe(4);
  });

  it("is the same every time", () => {
    expect(storyEvents(now)).toEqual(events);
  });
});

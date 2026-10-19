import { describe, expect, it } from "vitest";
import { PHOTOS, unsplash } from "@/lib/images";

describe("images", () => {
  it("builds sized Unsplash URLs", () => {
    expect(unsplash("1500000000000-abc123", 800)).toBe(
      "https://images.unsplash.com/photo-1500000000000-abc123?w=800&q=75&auto=format&fit=crop",
    );
  });

  it("has a well-formed id for every photo slot", () => {
    expect(Object.keys(PHOTOS).length).toBe(27);
    for (const id of Object.values(PHOTOS)) expect(id).toMatch(/^\d{10,13}-[0-9a-f]{12}$/);
  });
});

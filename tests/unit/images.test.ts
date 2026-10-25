import { describe, expect, it } from "vitest";
import imageLoader from "@/lib/image-loader";
import { PHOTOS, unsplash } from "@/lib/images";

describe("images", () => {
  it("builds sized Unsplash URLs", () => {
    expect(unsplash("1500000000000-abc123", 800)).toBe(
      "https://images.unsplash.com/photo-1500000000000-abc123?w=800&q=75&auto=format&fit=crop",
    );
  });

  it("has a well-formed id for every photo slot", () => {
    expect(Object.keys(PHOTOS).length).toBe(29);
    for (const id of Object.values(PHOTOS)) expect(id).toMatch(/^\d{10,13}-[0-9a-f]{12}$/);
  });

  it("asks Unsplash for each srcset width, never wider than the page asked for", () => {
    const src = unsplash("1500000000000-abc123", 900);
    expect(imageLoader({ src, width: 480 })).toBe(unsplash("1500000000000-abc123", 480));
    expect(imageLoader({ src, width: 1920 })).toBe(src);
  });

  it("leaves the site's own files alone", () => {
    expect(imageLoader({ src: "/thumbs/pages/web-basic-1.jpg", width: 640 })).toBe("/thumbs/pages/web-basic-1.jpg");
  });
});

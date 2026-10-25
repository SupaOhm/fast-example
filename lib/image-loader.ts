"use client";

// next/image builds a srcset from this, so phones get a smaller photo than desktops.
// Unsplash resizes on its side; the width the page asked for in unsplash() stays the upper limit.
// So each image's `sizes` must give the width the photo is drawn at. With object-cover in a box taller
// than the photo, that is wider than the box (a 4:5 tile shows a 3:2 photo at about 1.9× its width).
// The hub's own screenshots are already small and pass `unoptimized`, so they never get here.
export default function imageLoader({ src, width }: { src: string; width: number }): string {
  if (!src.startsWith("https://")) return src;
  const url = new URL(src);
  const max = Number(url.searchParams.get("w")) || width;
  url.searchParams.set("w", String(Math.min(width, max)));
  return url.toString();
}

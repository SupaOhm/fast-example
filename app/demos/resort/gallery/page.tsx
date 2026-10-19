import type { Metadata } from "next";
import { GALLERY } from "@/lib/demos/resort/content";
import { ui } from "../_components/copy";
import { Lightbox } from "../_components/lightbox";
import { PageIntro } from "../_components/page-intro";

export const metadata: Metadata = { title: "Gallery" };

export default function GalleryPage() {
  return (
    <main className="pb-24">
      <PageIntro title={ui.galleryTitle} lede={ui.galleryLede} />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <Lightbox items={GALLERY} />
      </div>
    </main>
  );
}

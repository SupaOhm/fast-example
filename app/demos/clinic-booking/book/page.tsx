import type { Metadata } from "next";
import { T } from "@/components/demo/lang";
import { BookHeader } from "../_components/book-header";
import { BookingFlow } from "../_components/booking-flow";
import { ui } from "../_components/copy";

export const metadata: Metadata = { title: "Book on LINE · จองคิวผ่าน LINE" };

export default function BookPage() {
  return (
    <>
      <BookHeader />
      <main className="mx-auto max-w-6xl px-4 pt-3 pb-28 sm:px-6 lg:pt-6">
        <h1 className="max-w-3xl text-[1.75rem] leading-[1.3] font-medium text-balance text-(--wine) sm:text-[2.25rem] sm:leading-[1.25]">
          <T value={ui.bookTitle} />
        </h1>
        <BookingFlow />
      </main>
    </>
  );
}

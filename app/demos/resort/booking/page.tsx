import type { Metadata } from "next";
import { Suspense } from "react";
import { ui } from "../_components/copy";
import { InquiryForm } from "../_components/inquiry-form";
import { PageIntro } from "../_components/page-intro";
import { T } from "../_components/t";

export const metadata: Metadata = { title: "Book a stay" };

export default function BookingPage() {
  return (
    <main className="pb-24">
      <PageIntro title={ui.bookingTitle} lede={ui.bookingLede} />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <Suspense
          fallback={
            <p className="py-20 text-(--muted)" role="status">
              <T value={ui.loading} />
            </p>
          }
        >
          <InquiryForm />
        </Suspense>
      </div>
    </main>
  );
}

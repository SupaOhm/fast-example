import type { Metadata } from "next";
import { PageIntro } from "../_components/page-intro";
import { RoomFilter } from "../_components/room-filter";
import { ui } from "../_components/copy";

export const metadata: Metadata = { title: "Rooms" };

export default function RoomsPage() {
  return (
    <main className="pb-24">
      <PageIntro title={ui.roomsTitle} lede={ui.roomsLede} />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <RoomFilter />
      </div>
    </main>
  );
}

"use client";

import Image from "next/image";
import { useLang } from "@/components/demo/lang";
import { STAFF } from "@/lib/demos/clinic-booking/data";
import { fill } from "@/lib/demos/format";
import { PHOTOS, unsplash } from "@/lib/images";
import { ui } from "./copy";

// Each photo with the point to keep in frame when it is cropped (their face), so small crops still show who it is.
const PHOTO: Record<string, { id: string; focus: string }> = {
  "st-1": { id: PHOTOS.clinicStaffLalita, focus: "50% 18%" },
  "st-2": { id: PHOTOS.clinicStaffMew, focus: "48% 16%" },
  "st-3": { id: PHOTOS.clinicStaffBeam, focus: "52% 16%" },
};

/** A staff member's photo, filling a box the caller sizes and shapes through `className`. */
export function StaffPortrait({
  staffId,
  className = "",
  sizes,
  width = 800,
}: {
  staffId: string;
  className?: string;
  sizes: string;
  /** Pixel width fetched from Unsplash; pass a small value for small faces. */
  width?: number;
}) {
  const lang = useLang();
  const staff = STAFF.find((s) => s.id === staffId);
  const photo = PHOTO[staffId];
  if (!staff || !photo) return null;
  return (
    <span className={`relative block overflow-hidden bg-(--rose-2) ${className}`}>
      <Image
        src={unsplash(photo.id, width)}
        alt={fill(ui.staffPhotoAlt[lang], { name: staff.name[lang] })}
        fill
        sizes={sizes}
        className="object-cover"
        style={{ objectPosition: photo.focus }}
      />
    </span>
  );
}

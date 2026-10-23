"use client";

import Image from "next/image";
import { useLang } from "@/components/demo/lang";
import { STAFF } from "@/lib/demos/clinic-booking/data";
import { fill } from "@/lib/demos/format";
import { PHOTOS, unsplash } from "@/lib/images";
import { ui } from "./copy";

// Each photo with its face's centre (x, y as percentages of the photo) and a zoom. The three come from different
// shoots, so the zoom brings their faces to about the same size: in the 4:5 team cards as given, and in the small
// circles by a further shared factor, with the face lifted to just above the middle, so a 20px avatar is a face.
const PHOTO: Record<string, { id: string; x: number; y: number; zoom: number }> = {
  "st-1": { id: PHOTOS.clinicStaffLalita, x: 49, y: 24, zoom: 1.1 },
  "st-2": { id: PHOTOS.clinicStaffMew, x: 50, y: 25, zoom: 1.6 },
  "st-3": { id: PHOTOS.clinicStaffBeam, x: 51, y: 35, zoom: 1.4 },
};

const SMALL_ZOOM = 2.2;
const SMALL_FACE_Y = 44;

/** The one width fetched for every small avatar (the photos are not optimised, so `sizes` picks nothing). */
export const SMALL = 120;

/** A staff member's photo, filling a box the caller sizes and shapes through `className`. */
export function StaffPortrait({
  staffId,
  className = "",
  sizes,
  width = SMALL,
  decorative = false,
}: {
  staffId: string;
  className?: string;
  sizes: string;
  /** Pixel width fetched from Unsplash. Small faces all share one width, so the browser fetches each photo once. */
  width?: number;
  /** True when the name is written right beside the face, so the photo needs no alt text of its own. */
  decorative?: boolean;
}) {
  const lang = useLang();
  const staff = STAFF.find((s) => s.id === staffId);
  const photo = PHOTO[staffId];
  if (!staff || !photo) return null;
  const focus = `${photo.x}% ${photo.y}%`;
  const small = width <= SMALL;
  return (
    <span className={`relative block overflow-hidden bg-(--rose-2) ${className}`}>
      <Image
        src={unsplash(photo.id, width)}
        alt={decorative ? "" : fill(ui.staffPhotoAlt[lang], { name: staff.name[lang] })}
        fill
        sizes={sizes}
        className="object-cover"
        style={{
          // The focus point lands at the same place in the box, and the zoom grows the photo around it.
          objectPosition: focus,
          transformOrigin: focus,
          transform: small
            ? `translateY(${SMALL_FACE_Y - photo.y}%) scale(${photo.zoom * SMALL_ZOOM})`
            : `scale(${photo.zoom})`,
        }}
      />
    </span>
  );
}

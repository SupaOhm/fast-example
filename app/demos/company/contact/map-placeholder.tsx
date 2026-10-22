import { T } from "@/components/demo/lang";
import { company } from "@/lib/demos/company/content";
import { MapSvg } from "./map-svg";

/** A drawn map instead of a Google Maps embed: industrial-estate plots, roads and a pin. */
export function MapPlaceholder() {
  return (
    <figure className="overflow-hidden border border-(--line) bg-(--steel)">
      <MapSvg />
      <figcaption className="border-t border-(--line) bg-white px-5 py-4 text-[14px] leading-[1.6]">
        <span className="block font-bold text-(--navy)"><T value={company.name} /></span>
        <span className="text-(--muted)"><T value={company.address} /></span>
      </figcaption>
    </figure>
  );
}

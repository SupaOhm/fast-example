"use client";

import { useId } from "react";
import { useLang } from "@/components/demo/lang";
import type { L } from "@/lib/demos/lang";
import type { clients } from "@/lib/demos/company/content";

type ClientLogoId = (typeof clients)[number]["logo"];

/*
 * Client wordmarks, drawn in one colour (currentColor). Each is the client's own brand mark, so the
 * lettering inside the SVG is not translated; the accessible name follows the demo language.
 * Every mark sits on a 40-unit-high canvas so the five share one optical height.
 */

/** Auto-parts maker: a hex nut and a forward-leaning heavy wordmark with a speed rule. */
function ThaiAuto() {
  return (
    <>
      <path
        fillRule="evenodd"
        d="M35 20 26.5 34.7H9.5L1 20 9.5 5.3h17ZM18 13.2a6.8 6.8 0 1 0 0 13.6 6.8 6.8 0 0 0 0-13.6Z"
      />
      <g transform="translate(45 23) skewX(-12)">
        <text fontSize="19" fontWeight="700" letterSpacing="0.3">
          THAI AUTO
        </text>
        <rect x="0" y="5" width="44" height="3" />
        <text x="49" y="11" fontSize="10" fontWeight="500" letterSpacing="3.2">
          PARTS
        </text>
      </g>
    </>
  );
}

/** Food packager: a carton with a fresh leaf, Thai wordmark over a small Latin line. */
function SiamFoodPack({ mask }: { mask: string }) {
  return (
    <>
      <rect x="2.5" y="4.5" width="31" height="31" rx="9" fill="none" stroke="currentColor" strokeWidth="3" />
      <mask id={mask}>
        <path d="M12 28.5c0-10 6.5-16.5 16-16.5 0 10-6 16.5-16 16.5Z" fill="#fff" />
        <path d="M14.5 26c3-4.5 6.5-8.5 10.5-11" fill="none" stroke="#000" strokeWidth="1.6" strokeLinecap="round" />
      </mask>
      <rect x="10" y="10" width="20" height="20" mask={`url(#${mask})`} />
      <path d="M8.5 32 13 27.5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
      <text x="43" y="22" fontSize="18" fontWeight="700">
        สยามฟู้ดแพ็ค
      </text>
      <text x="43.5" y="36" fontSize="8.6" fontWeight="500" letterSpacing="2.1">
        SIAM FOOD PACK
      </text>
    </>
  );
}

/** Electronics firm: an IC package with an E cut through it, lowercase geometric wordmark. */
function EasternElec() {
  return (
    <>
      <path
        fillRule="evenodd"
        d="M10 7h20a3 3 0 0 1 3 3v20a3 3 0 0 1-3 3H10a3 3 0 0 1-3-3V10a3 3 0 0 1 3-3Zm4.5 6.5v13h12v-3h-8.5v-2h6.5v-3h-6.5v-2h8.5v-3Z"
      />
      <path d="M2 12h4v3H2zm0 6.5h4v3H2zm0 6.5h4v3H2zm32-13h4v3h-4zm0 6.5h4v3h-4zm0 6.5h4v3h-4z" />
      <text x="46" y="22" fontSize="20" fontWeight="700" letterSpacing="-0.4">
        eastern
      </text>
      <text x="46.5" y="35.5" fontSize="10.5" fontWeight="400" letterSpacing="1.15">
        electronics
      </text>
    </>
  );
}

/** Logistics firm: a slanted lane with a forward chevron, stacked title-case wordmark. */
function BangnaLogistics() {
  return (
    <>
      <path fillRule="evenodd" d="M3 33 14 7h24L27 33ZM16 12.5h4.5l7.5 7.5-7.5 7.5H16l7.5-7.5Z" />
      <text x="45" y="18" fontSize="16" fontWeight="700">
        Bangna
      </text>
      <text x="45" y="34.5" fontSize="16" fontWeight="400">
        Logistics
      </text>
    </>
  );
}

/** Steel mill: an I-beam section, tracked capitals over a stamped plate with the word cut out. */
function ChonburiSteel({ mask }: { mask: string }) {
  return (
    <>
      <path d="M3 5h28v5h-11.5v20H31v5H3v-5h11.5V10H3Z" />
      <text x="40" y="16" fontSize="13" fontWeight="700" textLength="95" lengthAdjust="spacing">
        CHONBURI
      </text>
      <mask id={mask}>
        <rect x="39" y="20" width="96" height="15" fill="#fff" />
        <text x="45" y="32" fontSize="13" fontWeight="700" textLength="84" lengthAdjust="spacing" fill="#000">
          STEEL
        </text>
      </mask>
      <rect x="39" y="20" width="96" height="15" mask={`url(#${mask})`} />
    </>
  );
}

const WIDTHS: Record<ClientLogoId, number> = {
  "thai-auto": 155,
  "siam-food-pack": 150,
  "eastern-elec": 118,
  "bangna-logistics": 110,
  "chonburi-steel": 136,
};

export function ClientLogo({ id, name, className = "" }: { id: ClientLogoId; name: L; className?: string }) {
  const lang = useLang();
  const mask = `cl-${useId().replace(/[^a-zA-Z0-9-]/g, "")}`;
  return (
    <svg
      role="img"
      aria-label={name[lang]}
      viewBox={`0 0 ${WIDTHS[id]} 40`}
      fill="currentColor"
      className={`h-9 w-auto select-none lg:h-10 ${className}`}
    >
      {id === "thai-auto" && <ThaiAuto />}
      {id === "siam-food-pack" && <SiamFoodPack mask={mask} />}
      {id === "eastern-elec" && <EasternElec />}
      {id === "bangna-logistics" && <BangnaLogistics />}
      {id === "chonburi-steel" && <ChonburiSteel mask={mask} />}
    </svg>
  );
}

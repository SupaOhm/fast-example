"use client";

import { useLang } from "@/components/demo/lang";
import { ui } from "../_components/copy";

/** The drawn map. A client component so its aria-label and road name follow the demo language. */
export function MapSvg() {
  const lang = useLang();
  return (
    <svg viewBox="0 0 400 240" className="block h-auto w-full" role="img" aria-label={ui.mapLabel[lang]}>
        <rect width="400" height="240" fill="#e7ebf0" />
        {/* factory plots */}
        <g fill="#d6dce4">
          <rect x="18" y="18" width="96" height="60" />
          <rect x="132" y="18" width="74" height="60" />
          <rect x="18" y="116" width="60" height="44" />
          <rect x="96" y="116" width="110" height="44" />
          <rect x="18" y="184" width="188" height="40" />
          <rect x="232" y="18" width="150" height="60" />
          <rect x="232" y="180" width="70" height="44" />
          <rect x="316" y="180" width="66" height="44" />
        </g>
        {/* our plot */}
        <rect x="232" y="116" width="150" height="44" fill="#14213d" />
        {/* roads */}
        <g stroke="#fff" strokeLinecap="square">
          <path d="M0 97h400" strokeWidth="18" />
          <path d="M219 0v240" strokeWidth="10" />
          <path d="M0 172h219" strokeWidth="7" />
          <path d="M219 170h181" strokeWidth="7" />
        </g>
        <text x="24" y="101" fontSize="11.5" fill="#4d5868">
          {ui.mapRoad[lang]}
        </text>
        {/* pin, tip on our plot */}
        <g transform="translate(307 119)">
          <path d="M0-34c-11 0-19 8-19 19 0 14 19 34 19 34s19-20 19-34c0-11-8-19-19-19z" fill="#f28c28" />
          <circle cy="-15" r="6.5" fill="#14213d" />
        </g>
    </svg>
  );
}

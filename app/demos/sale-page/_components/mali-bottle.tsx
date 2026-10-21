"use client";

import { useId } from "react";
import { useLang } from "@/components/demo/lang";
import { ui } from "./copy";

/**
 * The product: a 30 ml amber dropper bottle with Mali's printed label.
 * The label is packaging, so it reads the same in both languages; the
 * accessible name follows the page language. Text inherits the page font.
 * `decorative` hides it from screen readers where a caption already says "2 bottles".
 */
export function MaliBottle({ className, decorative = false }: { className?: string; decorative?: boolean }) {
  const lang = useLang();
  const id = useId().replace(/:/g, "");
  const glass = `${id}-glass`;
  const collar = `${id}-collar`;
  const bulb = `${id}-bulb`;
  const wrap = `${id}-wrap`;
  const shine = `${id}-shine`;

  return (
    <svg
      viewBox="0 0 120 290"
      className={className}
      {...(decorative ? { "aria-hidden": true } : { role: "img", "aria-label": ui.bottleLabel[lang] })}
    >
      <defs>
        <linearGradient id={glass} x1="0" x2="1">
          <stop offset="0" stopColor="#3a1404" />
          <stop offset="0.16" stopColor="#7c3510" />
          <stop offset="0.38" stopColor="#a8561c" />
          <stop offset="0.62" stopColor="#7e3811" />
          <stop offset="1" stopColor="#2e1003" />
        </linearGradient>
        <linearGradient id={collar} x1="0" x2="1">
          <stop offset="0" stopColor="#5e4712" />
          <stop offset="0.3" stopColor="#e9cb6c" />
          <stop offset="0.5" stopColor="#f7e3a0" />
          <stop offset="0.75" stopColor="#a8851f" />
          <stop offset="1" stopColor="#4e3a0d" />
        </linearGradient>
        <linearGradient id={bulb} x1="0" x2="1">
          <stop offset="0" stopColor="#141412" />
          <stop offset="0.32" stopColor="#4a4a44" />
          <stop offset="0.55" stopColor="#24241f" />
          <stop offset="1" stopColor="#0c0c0b" />
        </linearGradient>
        {/* Shades the label's edges so it reads as wrapped round a cylinder. */}
        <linearGradient id={wrap} x1="0" x2="1">
          <stop offset="0" stopColor="#5b3a12" stopOpacity="0.3" />
          <stop offset="0.14" stopColor="#5b3a12" stopOpacity="0" />
          <stop offset="0.8" stopColor="#5b3a12" stopOpacity="0" />
          <stop offset="1" stopColor="#5b3a12" stopOpacity="0.34" />
        </linearGradient>
        <linearGradient id={shine} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.5" />
          <stop offset="0.7" stopColor="#fff" stopOpacity="0.16" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* contact shadow */}
      <ellipse cx="60" cy="281" rx="46" ry="6" fill="#000" opacity="0.28" />

      {/* rubber bulb */}
      <path d="M46 58 V26 C46 10 52 4 60 4 C68 4 74 10 74 26 V58 Z" fill={`url(#${bulb})`} />
      <path
        d="M51 22 C51 13 54 9 57 8"
        stroke="#fff"
        strokeOpacity="0.22"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      {[44, 49, 54].map((y) => (
        <line key={y} x1="47" x2="73" y1={y} y2={y} stroke="#000" strokeOpacity="0.45" strokeWidth="1" />
      ))}

      {/* metal collar, knurled */}
      <rect x="35" y="57" width="50" height="34" rx="4" fill={`url(#${collar})`} />
      {Array.from({ length: 11 }, (_, i) => (
        <line
          key={i}
          x1={39 + i * 4.2}
          x2={39 + i * 4.2}
          y1="61"
          y2="87"
          stroke="#3d2d08"
          strokeOpacity="0.22"
          strokeWidth="0.8"
        />
      ))}
      <rect x="35" y="86" width="50" height="5" rx="2" fill="#3d2d08" opacity="0.35" />

      {/* glass neck and body */}
      <rect x="44" y="90" width="32" height="10" fill="#4a1b06" />
      <path
        d="M18 132 C18 110 30 100 48 100 H72 C90 100 102 110 102 132 V264 C102 273 96 278 88 278 H32 C24 278 18 273 18 264 Z"
        fill={`url(#${glass})`}
      />
      {/* serum level and heavy glass base */}
      <path d="M19 122 C30 125 90 125 101 122" stroke="#f2b768" strokeOpacity="0.3" strokeWidth="1" fill="none" />
      <path
        d="M19 262 C19 271 25 276 32 276 H88 C95 276 101 271 101 262 C88 266 32 266 19 262 Z"
        fill="#1d0901"
        opacity="0.4"
      />
      {/* reflections */}
      <path
        d="M25 134 C25 116 33 108 43 106 C35 112 31 122 31 136 V262 C31 268 28 268 25 264 Z"
        fill={`url(#${shine})`}
      />
      <rect x="92" y="128" width="3" height="128" rx="1.5" fill="#fff" opacity="0.12" />

      {/* printed label */}
      <rect x="23" y="142" width="74" height="100" rx="2.5" fill="#f7f1e2" />
      <rect x="23" y="142" width="74" height="100" rx="2.5" fill={`url(#${wrap})`} />
      <rect
        x="27"
        y="146"
        width="66"
        height="92"
        rx="1.5"
        fill="none"
        stroke="#2f5d3a"
        strokeOpacity="0.5"
        strokeWidth="0.6"
      />
      <circle cx="60" cy="163" r="8.5" fill="none" stroke="#2f5d3a" strokeWidth="1.4" />
      <path d="M60 155.6 C64.4 159.6 64.4 166.4 60 170.4 C55.6 166.4 55.6 159.6 60 155.6 Z" fill="#2f5d3a" />
      <line x1="60" x2="60" y1="158" y2="169" stroke="#f7f1e2" strokeWidth="0.6" />
      <text x="61.5" y="191" textAnchor="middle" fontWeight="800" fontSize="15" letterSpacing="3" fill="#17331f">
        MALI
      </text>
      <text x="60" y="204" textAnchor="middle" fontWeight="600" fontSize="7.4" fill="#17331f">
        น้ำนมข้าวมะลิ
      </text>
      <line x1="38" x2="82" y1="210" y2="210" stroke="#7a5c0f" strokeWidth="0.7" />
      <text x="60" y="220" textAnchor="middle" fontWeight="600" fontSize="5.4" letterSpacing="0.35" fill="#17331f">
        JASMINE RICE SERUM
      </text>
      <text x="60" y="231" textAnchor="middle" fontWeight="400" fontSize="5.6" fill="#4b5a4e">
        30 ml
      </text>
    </svg>
  );
}

/**
 * Ink-outlined drawings of ร้านดี's twelve products, one inline SVG each, drawn on a
 * 48-unit grid so they hold up at 32px and at 56px. Unknown SKUs get a plain parcel.
 */

const INK = "#2b2217";
const CREAM = "#fbf7ef";
const TAN = "#dcc49a";
const AMBER = "#e2b04a";
const GOLD = "#edc76a";
const WARN = "#a3361f";
const OK = "#3d6b2f";
const LEAF = "#6f9a45";
const LEAF_PALE = "#cfdcab";
const BROWN = "#6e4325";
const CHILLI_GREEN = "#86a33f";
const CHILLI_RED = "#c4502c";
const PORK = "#efcf9c";
const RICE = "#f2dfb2";

// Sai ua coil: half-turns of growing radius, each turn 6 units outside the last.
const COIL = "M21 24a3 3 0 0 1 6 0a6 6 0 0 1-12 0a9 9 0 0 1 18 0a12 12 0 0 1-24 0v-3";

const line = { stroke: INK, strokeWidth: 1.8, strokeLinejoin: "round", strokeLinecap: "round" } as const;

function Jar({ fill }: { fill: string }) {
  return (
    <>
      <rect x="11" y="17" width="26" height="26" rx="6" fill={CREAM} />
      <path d="M12 25h24v12a5 5 0 0 1-5 5H17a5 5 0 0 1-5-5z" fill={fill} />
      <rect x="11" y="29" width="26" height="8" fill={RICE} />
      <path d="M21 33c2-2.6 5.2-2.6 7.6-.4" fill="none" stroke={fill} strokeWidth="2.4" strokeLinecap="round" />
      <path d="M28.4 32.4l1.8-1.6" stroke={OK} strokeWidth="1.6" strokeLinecap="round" />
      <rect x="11" y="17" width="26" height="26" rx="6" fill="none" {...line} />
      <rect x="9.5" y="10" width="29" height="8" rx="2.5" fill={AMBER} {...line} />
      <path d="M12 14h24" stroke={INK} strokeWidth="1" strokeDasharray="1.6 1.6" opacity=".6" />
    </>
  );
}

function CracklingBag({ seal, fatty }: { seal: string; fatty?: boolean }) {
  return (
    <>
      <path d="M12 14h24l3 27.5a2 2 0 0 1-2 2.5H11a2 2 0 0 1-2-2.5z" fill={TAN} {...line} />
      <rect x="11" y="7.5" width="26" height="7" rx="1.2" fill={seal} {...line} />
      <path d="M14 9.5v3M17.5 9.5v3M21 9.5v3M24.5 9.5v3M28 9.5v3M31.5 9.5v3M35 9.5v3" stroke={CREAM} strokeWidth="1.1" opacity=".75" />
      <rect x="14.5" y="20" width="19" height="17" rx="6" fill={CREAM} {...line} strokeWidth={1.4} />
      <path d="M17.5 27.5c.4-2.6 3-3.6 4.6-1.8 1.3-1.9 4.3-1.3 4.4 1.2 2-.6 3.6 1.4 2.4 3.3-1 1.6-3 1.4-3.8.6-1.4 1.6-4 1.4-4.8-.2-1.8.6-3.2-1-2.8-3.1z" fill={PORK} stroke={BROWN} strokeWidth="1.2" strokeLinejoin="round" />
      {fatty && <path d="M19.5 28.8c1.6-.8 3.4-.6 4.6.3M24.6 28.6c1.4-.6 2.8-.2 3.6.8" fill="none" stroke={CREAM} strokeWidth="1.3" strokeLinecap="round" />}
    </>
  );
}

const ICONS: Record<string, () => React.ReactNode> = {
  "NP-01": () => <Jar fill={CHILLI_GREEN} />,
  "NP-02": () => <Jar fill={CHILLI_RED} />,
  "KM-01": () => <CracklingBag seal={OK} />,
  "KM-02": () => <CracklingBag seal={WARN} fatty />,
  // Sai ua: a sausage coiled on a banana leaf.
  "SU-01": () => (
    <>
      <circle cx="24" cy="24" r="20" fill={LEAF_PALE} stroke={LEAF} strokeWidth="1.6" />
      <path d="M9 30c8-2 22-2 30-12" fill="none" stroke={LEAF} strokeWidth="1.1" opacity=".7" />
      <g transform="translate(3 -0.5)">
        <path d={COIL} fill="none" stroke={INK} strokeWidth="6" strokeLinecap="round" />
        <path d={COIL} fill="none" stroke={CHILLI_RED} strokeWidth="3.6" strokeLinecap="round" />
      </g>
      <path d="M14.6 26h.01M24 15.6h.01M35.4 24.4h.01M26.4 34.5h.01M30.4 18.2h.01M17.6 33.2h.01" stroke={OK} strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
  // Naem: sour pork wrapped in banana leaf, tied with string.
  "SU-02": () => (
    <>
      <path d="M13.5 18.5C17 9 31 9 34.5 18.5" fill="none" stroke={WARN} strokeWidth="1.6" strokeLinecap="round" />
      <rect x="6" y="17" width="36" height="17" rx="8.5" fill={LEAF} {...line} />
      <path d="M11 25.5h26M16 25.5l-3-5M22 25.5l-3-5M28 25.5l-3-5M34 25.5l-3-5M16 25.5l-3 5M22 25.5l-3 5M28 25.5l-3 5M34 25.5l-3 5" stroke={LEAF_PALE} strokeWidth="1.1" strokeLinecap="round" />
      <rect x="12.5" y="16" width="3" height="19" rx="1" fill={WARN} stroke={INK} strokeWidth="1" />
      <rect x="32.5" y="16" width="3" height="19" rx="1" fill={WARN} stroke={INK} strokeWidth="1" />
    </>
  ),
  // Oolong tea in a round tin.
  "TE-01": () => (
    <>
      <path d="M12.5 15v24.5a11.5 3.8 0 0 0 23 0V15z" fill={OK} {...line} />
      <path d="M12.5 22h23v10h-23z" fill={CREAM} stroke={INK} strokeWidth="1.2" />
      <path d="M19.5 30c1-5 5.5-7.5 9.5-6.5-1 4.6-5.2 7.6-9.5 6.5zM19.5 30l5-4" fill={LEAF} stroke={OK} strokeWidth="1.1" strokeLinejoin="round" />
      <path d="M12 12v4.6a12 3.8 0 0 0 24 0V12z" fill={AMBER} {...line} />
      <ellipse cx="24" cy="12" rx="12" ry="3.8" fill={GOLD} {...line} />
    </>
  ),
  // Doi Chang coffee: a stand-up bag with a bean on the label.
  "CO-01": () => (
    <>
      <path d="M12.5 13h23l2 29.5a1.5 1.5 0 0 1-1.5 1.5H12a1.5 1.5 0 0 1-1.5-1.5z" fill={BROWN} {...line} />
      <path d="M12.5 7.5h23V13h-23z" fill={BROWN} {...line} />
      <path d="M12.5 10.2h23" stroke={CREAM} strokeWidth="1" opacity=".5" />
      <rect x="15.5" y="19" width="17" height="18" rx="2" fill={RICE} stroke={INK} strokeWidth="1.3" />
      <ellipse cx="24" cy="28" rx="4.3" ry="6" transform="rotate(25 24 28)" fill={BROWN} stroke={INK} strokeWidth="1.1" />
      <path d="M26 23c-3 3-1 6.5-4 10" fill="none" stroke={RICE} strokeWidth="1.1" strokeLinecap="round" />
      <circle cx="31" cy="16" r="1.4" fill={AMBER} />
    </>
  ),
  // Khao taen: round rice crackers drizzled with palm sugar.
  "SW-01": () => (
    <>
      <circle cx="18" cy="29" r="12" fill={RICE} {...line} />
      <circle cx="30.5" cy="20" r="11.5" fill={RICE} {...line} />
      <path d="M23.5 15.5c2 2.4 4 2.4 5.8 0s3.8-2.4 5.6 0M21.2 21.5c2 2.4 4 2.4 5.8 0s3.8-2.4 5.6 0" fill="none" stroke="#b0611c" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M11.5 31h.01M14.5 35h.01M19 33.5h.01M13 26.6h.01M22 37.2h.01M17 38.4h.01M23 30.4h.01" stroke={TAN} strokeWidth="2.2" strokeLinecap="round" />
      <path d="M10 28.5c2 2.2 4 2.2 6 0s4-2.2 6 0" fill="none" stroke="#b0611c" strokeWidth="1.8" strokeLinecap="round" />
    </>
  ),
  // Thong muan: rolled wafers, stacked.
  "SW-02": () => (
    <>
      {[
        [9, 31],
        [13, 21],
        [7, 11],
      ].map(([x, y]) => (
        <g key={y}>
          <rect x={x} y={y} width="28" height="9" rx="1.5" fill={GOLD} {...line} />
          <path d={`M${x + 7} ${y}v9M${x + 14} ${y}v9M${x + 21} ${y}v9`} stroke="#b0611c" strokeWidth="1" opacity=".55" />
          <ellipse cx={x + 28} cy={y + 4.5} rx="3.6" ry="4.5" fill={RICE} {...line} strokeWidth={1.4} />
          <path d={`M${x + 28} ${y + 4.5}m-1.4 0a1.4 1.6 0 1 1 1.4 1.6`} fill="none" stroke="#b0611c" strokeWidth="1.1" strokeLinecap="round" />
        </g>
      ))}
    </>
  ),
  // Candied tamarind: sugared pods in a clear tray with a label.
  "SW-03": () => (
    <>
      <rect x="7" y="10" width="34" height="31" rx="4" fill={CREAM} {...line} />
      <rect x="7" y="10" width="34" height="8" rx="3" fill={AMBER} {...line} />
      {[23.5, 32].map((y) => (
        <g key={y}>
          <path
            d={`M11.5 ${y}c1.6-3 4.4-3 5.6-.6 1.4-2.4 4.4-2.4 5.6 0 1.4-2.4 4.4-2.4 5.6 0 1.4-2.4 4.2-2.2 5.8.6 1 2-1 4-2.8 3.4-1.2 2-4.2 2-5.4 0-1.4 1.8-4.2 1.8-5.6 0-1.4 1.8-4.2 1.8-5.6 0-1.8.6-3.6-1.4-3.2-3.4z`}
            fill={BROWN}
            stroke={INK}
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          <path d={`M15 ${y + 0.6}h.01M21 ${y - 0.4}h.01M26.5 ${y + 1}h.01M32 ${y}h.01`} stroke={RICE} strokeWidth="1.6" strokeLinecap="round" />
        </g>
      ))}
    </>
  ),
  // Gift box with a amber ribbon and bow.
  "GF-01": () => (
    <>
      <rect x="9" y="22" width="30" height="20" rx="1.5" fill={WARN} {...line} />
      <rect x="7" y="16" width="34" height="7.5" rx="1.5" fill={WARN} {...line} />
      <rect x="21.5" y="16" width="5" height="26" fill={AMBER} stroke={INK} strokeWidth="1.3" />
      <path d="M24 16c-3-6-11-8.5-11-3.6 0 3 6 3.6 11 3.6zM24 16c3-6 11-8.5 11-3.6 0 3-6 3.6-11 3.6z" fill={AMBER} {...line} strokeWidth={1.5} />
      <path d="M9 30h12.5M26.5 30H39" stroke={CREAM} strokeWidth="1" opacity=".35" />
    </>
  ),
};

function Parcel() {
  return (
    <>
      <path d="M8 17l16-7 16 7v21l-16 6-16-6z" fill={TAN} {...line} />
      <path d="M8 17l16 6 16-6M24 23v21" fill="none" {...line} strokeWidth={1.4} />
      <path d="M15.5 13.7l16 6.6v6" fill="none" stroke={AMBER} strokeWidth="3.2" strokeLinecap="round" />
    </>
  );
}

export function ProductIcon({ sku, className = "size-10" }: { sku: string; className?: string }) {
  const draw = ICONS[sku] ?? Parcel;
  return (
    <svg viewBox="0 0 48 48" data-testid="product-icon" aria-hidden className={`shrink-0 ${className}`}>
      {draw()}
    </svg>
  );
}

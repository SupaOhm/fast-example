/** The moon rising out of the Andaman Sea, with its reflection broken into ripples. */
export function Moonrise({ className = "" }: { className?: string }) {
  const ripples = [
    { y: 182, w: 150 },
    { y: 196, w: 118 },
    { y: 210, w: 132 },
    { y: 224, w: 84 },
    { y: 238, w: 96 },
    { y: 252, w: 52 },
    { y: 266, w: 60 },
    { y: 280, w: 26 },
  ];
  return (
    <svg viewBox="0 0 400 300" aria-hidden className={className}>
      <defs>
        <clipPath id="moonrise-sky">
          <rect width="400" height="170" />
        </clipPath>
        <radialGradient id="moonrise-glow">
          <stop offset="0%" stopColor="var(--sun)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="var(--sun)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="moonrise-horizon">
          <stop offset="0%" stopColor="var(--sun)" stopOpacity="0" />
          <stop offset="50%" stopColor="var(--sun)" stopOpacity="0.7" />
          <stop offset="100%" stopColor="var(--sun)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <ellipse cx="200" cy="170" rx="200" ry="150" fill="url(#moonrise-glow)" clipPath="url(#moonrise-sky)" />
      <circle cx="200" cy="170" r="96" fill="var(--sun)" clipPath="url(#moonrise-sky)" />
      <rect x="0" y="170" width="400" height="1" fill="url(#moonrise-horizon)" />
      {ripples.map((r) => (
        <rect key={r.y} x={200 - r.w / 2} y={r.y} width={r.w} height="4" rx="2" fill="var(--sun)" opacity={0.85 - (r.y - 182) / 140} />
      ))}
    </svg>
  );
}

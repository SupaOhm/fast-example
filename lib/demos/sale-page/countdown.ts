/** Milliseconds until the next local midnight. The promo "ends" every night and starts again. */
export function msUntilEndOfDay(now: Date): number {
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return midnight.getTime() - now.getTime();
}

const pad = (n: number) => String(n).padStart(2, "0");

/** "HH : MM : SS", floored to whole seconds and never negative. */
export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  return `${pad(Math.floor(total / 3600))} : ${pad(Math.floor((total % 3600) / 60))} : ${pad(total % 60)}`;
}

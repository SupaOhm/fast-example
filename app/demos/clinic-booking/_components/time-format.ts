/** "10:30": a 24-hour clock, the way a phone's status bar, LINE's timestamps and the clinic's "now" line read. */
export const clock = (d: Date) => `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

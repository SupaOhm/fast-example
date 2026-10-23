import type { BookingStatus } from "@/lib/demos/clinic-booking/data";

// Text/background pairs are all at least 6:1. `dot` and `block` are decorative fills.
export const STATUS_TONE: Record<BookingStatus, { pill: string; dot: string; block: string }> = {
  booked: {
    pill: "bg-[#fbe4e8] text-(--wine)",
    dot: "bg-(--accent)",
    block: "bg-[#f8dbe1] text-(--wine) border-(--accent)",
  },
  "checked-in": {
    pill: "bg-[#d9efe7] text-[#0d5c4c]",
    dot: "bg-[#2e9b7f]",
    block: "bg-[#d3ede4] text-[#0d5c4c] border-[#2e9b7f]",
  },
  done: {
    pill: "bg-[#ece6e8] text-[#4d4247]",
    dot: "bg-[#a3959a]",
    block: "bg-[#eee8ea] text-[#4d4247] border-[#a3959a]",
  },
  "no-show": {
    pill: "bg-[#fbe6d6] text-[#8f3a0c]",
    dot: "bg-[#d9822b]",
    block: "bg-[repeating-linear-gradient(135deg,#fbe6d6_0_6px,#f7dac4_6px_12px)] text-[#8f3a0c] border-[#d9822b]",
  },
};

export function formatPhone(p: string): string {
  if (/^\d{10}$/.test(p)) return `${p.slice(0, 3)}-${p.slice(3, 6)}-${p.slice(6)}`;
  if (/^\d{9}$/.test(p)) return `${p.slice(0, 2)}-${p.slice(2, 5)}-${p.slice(5)}`;
  return p;
}

export const shortName = (name: string) => name.replace(/^(พญ\.|นพ\.|คุณ)\s*/, "").trim() || name;

// First consonant, skipping leading vowels (แพร → พ, เฟิร์น → ฟ).
export const monogramOf = (name: string) => shortName(name).replace(/^[เแโใไ]/, "").charAt(0) || "?";

export const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--wine)";

export const fieldClass =
  "mt-1.5 block w-full rounded-xl border border-(--line) bg-white px-3.5 py-2.5 text-base text-(--ink) outline-none transition-colors placeholder:text-(--muted) focus:border-(--wine) focus:ring-3 focus:ring-(--accent)/20 aria-invalid:border-(--error)";

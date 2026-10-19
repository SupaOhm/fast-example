export function isEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s.trim());
}

export function normalizePhone(s: string): string {
  return s.replace(/[\s-]/g, "");
}

export function isThaiPhone(s: string): boolean {
  return /^0\d{8,9}$/.test(normalizePhone(s));
}

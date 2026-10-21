/**
 * Paths of `{ th, en }` copy entries where either language is missing or blank.
 * Walks plain objects, arrays and module namespaces; ignores everything else.
 */
export function missingTranslations(value: unknown, path = "$"): string[] {
  if (Array.isArray(value)) return value.flatMap((v, i) => missingTranslations(v, `${path}[${i}]`));
  if (value === null || typeof value !== "object") return [];
  const o = value as Record<string, unknown>;
  if ("th" in o || "en" in o) {
    const blank = (["th", "en"] as const).filter((k) => typeof o[k] !== "string" || !(o[k] as string).trim());
    return blank.length ? [`${path} (${blank.join(", ")})`] : [];
  }
  return Object.entries(o).flatMap(([k, v]) => missingTranslations(v, `${path}.${k}`));
}

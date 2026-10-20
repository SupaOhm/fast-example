import { Check, Minus } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { CompareRow, RowValue } from "@/lib/packages";

// One feature value, shared by the hub lineup and the compare page. Colour comes from --acc.
export function SpecCell({
  row,
  value,
  locale,
  yes,
  no,
}: {
  row: CompareRow;
  value: RowValue;
  locale: Locale;
  yes: string;
  no: string;
}) {
  if (typeof value === "object" && "n" in value) {
    return (
      <>
        <span className="block font-display text-3xl leading-none font-extrabold text-(--acc)">{value.n}</span>
        <span className="mt-1 block text-sm leading-snug text-cream-muted">{value.unit[locale]}</span>
      </>
    );
  }
  const included = value !== false;
  const text = typeof value === "object" ? value[locale] : row.label[locale];
  return (
    <>
      {included ? (
        <Check aria-hidden strokeWidth={2.4} className="mx-auto size-[22px] text-(--acc)" />
      ) : (
        <Minus aria-hidden strokeWidth={2.2} className="mx-auto size-[22px] text-cream/25" />
      )}
      <span className="sr-only">{included ? yes : no}: </span>
      <span className="mt-1 block text-sm leading-snug text-cream-muted">{text}</span>
    </>
  );
}

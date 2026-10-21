import type { Lang } from "@/lib/demos/lang";

/**
 * Thai has no spaces between words, so browsers may break a heading between
 * two words that belong together ("ชุ่ม|ชื้น"). Split on the spaces the copy
 * already uses as phrase breaks and keep each phrase on one line. Short tokens
 * and numbers ride along with the next token, so "ใน 14 วัน" stays whole, and
 * the repeat mark ๆ stays with the word before it. Each phrase is an
 * inline-block capped at its container's width: it moves to the next line as a
 * unit, and only if it is wider than the container itself does the browser
 * break inside it, so a heading can never push past its column.
 */

export function Phrases({ text }: { text: string }) {
  const phrases: string[] = [];
  let carry = "";
  for (const token of text.split(" ")) {
    if (token === "ๆ" && !carry && phrases.length) {
      phrases[phrases.length - 1] += " ๆ";
      continue;
    }
    const joined = carry ? `${carry} ${token}` : token;
    if (token.length <= 3 || /^\d+$/.test(token)) carry = joined;
    else {
      phrases.push(joined);
      carry = "";
    }
  }
  if (carry) phrases.push(carry);

  return phrases.map((p, i) => (
    <span key={i}>
      {i > 0 && " "}
      <span className="inline-block max-w-full">{p}</span>
    </span>
  ));
}

/** Thai copy keeps its phrases whole; English wraps normally. */
export function Phrased({ text, lang }: { text: string; lang: Lang }) {
  return lang === "th" ? <Phrases text={text} /> : text;
}

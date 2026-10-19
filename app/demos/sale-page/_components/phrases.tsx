/**
 * Thai has no spaces between words, so browsers may break a heading between
 * two words that belong together ("ชุ่ม|ชื้น"). Split on the spaces the copy
 * already uses as phrase breaks and keep each phrase on one line. Short tokens
 * and numbers ride along with the next token, so "ใน 14 วัน" stays whole.
 */
export function Phrases({ text }: { text: string }) {
  const phrases: string[] = [];
  let carry = "";
  for (const token of text.split(" ")) {
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
      <span className="whitespace-nowrap">{p}</span>
    </span>
  ));
}

import "./globals.css";
import { Anuphan, Bricolage_Grotesque } from "next/font/google";
import Link from "next/link";

const anuphan = Anuphan({ subsets: ["thai", "latin"], variable: "--font-anuphan" });
const bricolage = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage" });

export const metadata = { title: "404 — SupaOhm" };

export default function GlobalNotFound() {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${anuphan.variable} ${bricolage.variable}`}>
      <body className="bg-forest font-sans text-cream antialiased">
        <main className="grid min-h-dvh place-items-center p-6 text-center">
          <div>
            <p aria-hidden className="font-display text-7xl font-extrabold tracking-[-0.04em] text-lime">
              404
            </p>
            <h1 className="mt-3 font-display text-2xl font-extrabold tracking-[-0.03em]">
              Page not found · <span lang="th">ไม่พบหน้านี้</span>
            </h1>
            <Link href="/" className="mt-4 inline-block underline decoration-lime underline-offset-4">
              Back home · <span lang="th">กลับหน้าแรก</span>
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}

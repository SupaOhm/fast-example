import "./globals.css";
import Link from "next/link";

export const metadata = { title: "404 — SupaOhm" };

export default function GlobalNotFound() {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className="bg-forest font-sans text-cream antialiased">
        <main className="grid min-h-dvh place-items-center p-6 text-center">
          <div>
            <p className="font-display text-7xl font-extrabold tracking-[-0.04em] text-lime">404</p>
            <Link href="/en" className="mt-4 inline-block underline decoration-lime underline-offset-4">
              Back home · กลับหน้าแรก
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}

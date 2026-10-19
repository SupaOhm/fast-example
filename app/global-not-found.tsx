import "./globals.css";
import Link from "next/link";

export const metadata = { title: "404 — SupaOhm" };

export default function GlobalNotFound() {
  return (
    <html lang="th">
      <body className="bg-paper font-sans text-ink antialiased">
        <main className="grid min-h-dvh place-items-center p-6 text-center">
          <div>
            <p className="text-6xl font-bold">404</p>
            <Link href="/th" className="mt-4 inline-block underline">
              กลับหน้าแรก · Back home
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}

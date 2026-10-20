import "../globals.css";
import { Anuphan } from "next/font/google";

// The demo pill is SupaOhm chrome, so it uses the hub's face instead of each demo's own.
const pill = Anuphan({ weight: ["400", "600"], subsets: ["thai", "latin"], variable: "--font-demo-pill" });

export default function DemosRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" data-scroll-behavior="smooth" className={pill.variable}>
      <body className="antialiased">{children}</body>
    </html>
  );
}

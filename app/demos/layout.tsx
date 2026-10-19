import "../globals.css";

export default function DemosRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" data-scroll-behavior="smooth">
      <body className="antialiased">{children}</body>
    </html>
  );
}

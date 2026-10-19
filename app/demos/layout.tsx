import "../globals.css";

export default function DemosRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body className="antialiased">{children}</body>
    </html>
  );
}

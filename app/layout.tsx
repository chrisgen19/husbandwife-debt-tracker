import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Debt Tracker",
  description: "Track debts between you and your wife",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

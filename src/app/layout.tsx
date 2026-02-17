import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "kin-ky",
  description: "Get matched with a UBC student. No swiping. Just real matches.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
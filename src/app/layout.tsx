import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "blind@ubc — where strangers become stories",
  description: "Weekly blind dates for UBC students",
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
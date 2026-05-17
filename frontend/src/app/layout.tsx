import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PreLegal — Mutual NDA Creator",
  description: "Generate and download a Mutual Non-Disclosure Agreement",
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

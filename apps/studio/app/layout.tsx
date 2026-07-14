import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Card Commons Studio",
  description: "A local-first studio for making one portable calling card.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

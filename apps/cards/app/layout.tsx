import type { Metadata, Viewport } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Card Commons",
    template: "%s · Card Commons"
  },
  description: "A proposal for portable, editable, publishable, playable web objects.",
  // CANONICAL-CUTOVER: placeholder Vercel URL; Phase 5 confirms the real
  // production URL and, if a custom domain lands, NEXT_PUBLIC_SITE_URL overrides.
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://ca-cards.vercel.app"),
  openGraph: {
    title: "Card Commons",
    description: "Make a card, not a website.",
    type: "website"
  }
};

export const viewport: Viewport = {
  themeColor: "#f4f0e7",
  colorScheme: "light"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">Skip to content</a>
        <SiteHeader />
        <div id="main-content">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}


import type { Metadata } from "next";
import { Instrument_Serif, Inter } from "next/font/google";
import "./globals.css";
import { seo } from "./content";

const display = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-instrument-serif",
  display: "swap",
});

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

/* Link previews resolve the OG image against this origin, so a wrong value means
   every shared link shows a broken card. Vercel supplies the real production
   domain at build time; seo.siteUrl is the fallback for other hosts and local. */
const origin = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : seo.siteUrl;

export const metadata: Metadata = {
  metadataBase: new URL(origin),
  title: seo.title,
  description: seo.description,
  openGraph: {
    title: seo.shareTitle,
    description: seo.shareDescription,
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body className="bg-bg font-sans text-ink antialiased">{children}</body>
    </html>
  );
}

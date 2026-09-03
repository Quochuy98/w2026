import type { Metadata } from "next";
import { Be_Vietnam_Pro, Playfair_Display } from "next/font/google";
import "./globals.css";
import { weddingConfig } from "@/content/wedding";

const bodyFont = Be_Vietnam_Pro({
  variable: "--font-body",
  subsets: ["latin", "vietnamese"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const displayFont = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin", "vietnamese"],
  display: "swap",
  weight: ["400", "500", "600"],
});

const configuredSiteUrl = weddingConfig.seo.siteUrl?.trim();
const metadataBase = (() => {
  if (!configuredSiteUrl) return undefined;
  try {
    return new URL(configuredSiteUrl);
  } catch {
    return undefined;
  }
})();

export const metadata: Metadata = {
  title: weddingConfig.seo.title,
  description: weddingConfig.seo.description,
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon.png", type: "image/png" },
    ],
    apple: "/apple-icon.png",
  },
  ...(metadataBase ? { metadataBase } : {}),
  openGraph: {
    title: `${weddingConfig.groom} & ${weddingConfig.bride}`,
    description: `Album cưới ngày ${weddingConfig.dateLabel}`,
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" data-scroll-behavior="smooth">
      <body className={`${bodyFont.variable} ${displayFont.variable}`}>{children}</body>
    </html>
  );
}

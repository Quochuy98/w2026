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

const siteUrl = weddingConfig.seo.siteUrl || "https://wedding.quochuy.me";
const metadataBase = new URL(siteUrl);
const bannerImageUrl = `${siteUrl}/images/album/og-banner.jpg`;

export const metadata: Metadata = {
  metadataBase,
  title: weddingConfig.seo.title,
  description: weddingConfig.seo.description,
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon.png", type: "image/png" },
    ],
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: weddingConfig.seo.title,
    description: weddingConfig.seo.description,
    url: siteUrl,
    siteName: `Thiệp Cưới ${weddingConfig.groom} & ${weddingConfig.bride}`,
    locale: "vi_VN",
    type: "website",
    images: [
      {
        url: bannerImageUrl,
        secureUrl: bannerImageUrl,
        width: 1200,
        height: 630,
        alt: `Thiệp Cưới ${weddingConfig.groom} & ${weddingConfig.bride}`,
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: weddingConfig.seo.title,
    description: weddingConfig.seo.description,
    images: [bannerImageUrl],
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

import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from "@/src/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Play Spyfall Online Free - Multiplayer Party Game",
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  category: "game",
  keywords: [
    "spyfall",
    "spyfall online",
    "play spyfall online",
    "party game",
    "social deduction",
    "online party game",
    "multiplayer browser game",
    "spy game",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Play Spyfall Online Free - Find the Spy",
    description: SITE_DESCRIPTION,
    url: "/",
    type: "website",
    locale: "en_US",
    siteName: SITE_NAME,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Spyfall Online - a free multiplayer social deduction game",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Play Spyfall Online Free - Find the Spy",
    description: SITE_DESCRIPTION,
    images: ["/og-image.png"],
  },
  verification: {
    google: "ivXP4BMnsO5q10Rcb1-RDmAgpQmwBQR-d4ckfFDQB9c",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": ["VideoGame", "WebApplication"],
              name: SITE_NAME,
              alternateName: "Spyfall",
              url: SITE_URL,
              description: SITE_DESCRIPTION,
              applicationCategory: "GameApplication",
              operatingSystem: "Any",
              browserRequirements: "Requires JavaScript",
              inLanguage: "en",
              genre: ["Party game", "Social deduction game"],
              numberOfPlayers: {
                "@type": "QuantitativeValue",
                minValue: 3,
                maxValue: 12,
              },
              offers: {
                "@type": "Offer",
                price: 0,
                priceCurrency: "USD",
              },
              image: `${SITE_URL}/og-image.png`,
            }),
          }}
        />
      </body>
    </html>
  );
}

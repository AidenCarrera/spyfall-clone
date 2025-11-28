import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Spyfall",
  description: "A modern, real-time web version of the popular party game Spyfall. Play with friends, no account required. Features mobile-friendly design, custom settings, and multiple locations.",
  keywords: ["spyfall", "party game", "social deduction", "board game", "online game", "multiplayer", "spy game"],
  authors: [{ name: "Spyfall Clone" }],
  openGraph: {
    title: "Spyfall - Deceive Your Friends, Find the Spy",
    description: "Play Spyfall online with friends. The spy must guess the location while others must identify the spy. No download required.",
    type: "website",
    locale: "en_US",
    siteName: "Spyfall Clone",
  },
  twitter: {
    card: "summary_large_image",
    title: "Spyfall - Deceive Your Friends, Find the Spy",
    description: "Play Spyfall online with friends. The spy must guess the location while others must identify the spy.",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
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
      </body>
    </html>
  );
}

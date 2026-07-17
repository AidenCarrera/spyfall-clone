import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create a Private Game",
  description:
    "Create a private Spyfall room and invite friends with a shareable game code.",
  alternates: {
    canonical: "/create",
  },
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: "Create a Private Spyfall Game",
    description:
      "Create a private Spyfall room and invite friends with a shareable game code.",
    url: "/create",
  },
};

export default function CreateLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Game",
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
    title: "Create Game | Spyfall",
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

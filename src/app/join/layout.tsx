import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Join a Private Game",
  description:
    "Join a private Spyfall game with your room code and start playing with friends.",
  alternates: {
    canonical: "/join",
  },
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: "Join a Private Spyfall Game",
    description:
      "Join a private Spyfall game with your room code and start playing with friends.",
    url: "/join",
  },
};

export default function JoinLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}

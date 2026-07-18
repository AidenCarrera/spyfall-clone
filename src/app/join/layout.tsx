import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Join Game",
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
    title: "Join Game | Spyfall",
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

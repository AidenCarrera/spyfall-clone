import type { Metadata } from "next";
import { Suspense } from "react";
import { LoadingScreen } from "@/components/LoadingScreen";
import { JoinForm } from "./JoinForm";

const description =
  "Join a private Spyfall game with your room code and start playing with friends.";

export const metadata: Metadata = {
  title: "Join Game",
  description,
  alternates: {
    canonical: "/join",
  },
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: "Join Game | Spyfall",
    description,
    url: "/join",
  },
};

export default function JoinPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <JoinForm />
    </Suspense>
  );
}

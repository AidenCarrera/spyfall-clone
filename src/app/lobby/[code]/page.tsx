import type { Metadata } from "next";
import { normalizeLobbyCode } from "@/lib/lobby-code";
import { LobbyClient } from "./LobbyClient";

const description = "A private Spyfall game lobby shared by invitation.";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  const canonical = `/lobby/${encodeURIComponent(normalizeLobbyCode(code))}`;

  return {
    title: "Lobby",
    description,
    alternates: { canonical },
    robots: {
      index: false,
      follow: false,
      googleBot: { index: false, follow: false },
    },
    openGraph: {
      title: "Lobby | Spyfall",
      description,
      url: canonical,
    },
  };
}

export default async function LobbyPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  // Casing is normalized by a redirect in proxy.ts before rendering; this
  // guards the direct-render path (e.g. a rewrite that skips the proxy).
  return <LobbyClient code={normalizeLobbyCode(code)} />;
}

import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;

  return {
    title: "Private Game Lobby",
    description: "A private Spyfall game lobby shared by invitation.",
    alternates: {
      canonical: `/lobby/${encodeURIComponent(code)}`,
    },
    robots: {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
      },
    },
    openGraph: {
      title: "Private Spyfall Game Lobby",
      description: "A private Spyfall game lobby shared by invitation.",
      url: `/lobby/${encodeURIComponent(code)}`,
    },
  };
}

export default function LobbyLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}

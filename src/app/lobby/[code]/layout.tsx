import type { Metadata } from "next";
import { redirect } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  const normalizedCode = code.trim().toUpperCase();

  return {
    title: "Lobby",
    description: "A private Spyfall game lobby shared by invitation.",
    alternates: {
      canonical: `/lobby/${encodeURIComponent(normalizedCode)}`,
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
      title: "Lobby | Spyfall",
      description: "A private Spyfall game lobby shared by invitation.",
      url: `/lobby/${encodeURIComponent(normalizedCode)}`,
    },
  };
}

export default async function LobbyLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ code: string }>;
}>) {
  const { code } = await params;
  const normalizedCode = code.trim().toUpperCase();

  if (code !== normalizedCode && /^[A-Z0-9]{6}$/.test(normalizedCode)) {
    redirect(`/lobby/${normalizedCode}`);
  }

  return children;
}

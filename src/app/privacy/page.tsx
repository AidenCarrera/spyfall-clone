import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/src/components/SiteFooter";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn what information Spyfall Online processes and how game and browser data are handled.",
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title: "Privacy Policy",
    description:
      "Learn what information Spyfall Online processes and how game and browser data are handled.",
    url: "/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-linear-to-b from-slate-900 to-slate-950 px-4 py-12 sm:py-16">
      <article className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="font-medium text-slate-300 transition-colors hover:text-white"
        >
          ← Back to Spyfall
        </Link>

        <header className="mt-10 border-b border-slate-800 pb-10">
          <p className="font-mono text-sm font-bold uppercase tracking-wider text-blue-300">
            Privacy
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-4 text-sm text-slate-400">
            Last updated <time dateTime="2026-07-17">July 17, 2026</time>
          </p>
        </header>

        <div className="space-y-10 py-10 leading-relaxed text-slate-300">
          <section aria-labelledby="information">
            <h2 id="information" className="text-2xl font-bold text-white">
              Information we process
            </h2>
            <p className="mt-3">
              When you play, the site processes your display name, room code,
              game settings, assigned role, and other lobby state needed to run
              the game. Your IP address is processed to prevent excessive room
              creation and joining attempts.
            </p>
          </section>

          <section aria-labelledby="storage">
            <h2 id="storage" className="text-2xl font-bold text-white">
              Browser and game storage
            </h2>
            <p className="mt-3">
              A random player identifier is stored in your browser so you can
              reconnect to a room. The site does not use advertising cookies.
              Lobby information is stored temporarily and expires after 24
              hours without activity.
            </p>
          </section>

          <section aria-labelledby="services">
            <h2 id="services" className="text-2xl font-bold text-white">
              Service providers
            </h2>
            <p className="mt-3">
              Spyfall Online uses Vercel for website hosting and Upstash for
              lobby storage and rate limiting. These providers may process
              technical request information according to their own privacy
              policies.
            </p>
          </section>

          <section aria-labelledby="sharing">
            <h2 id="sharing" className="text-2xl font-bold text-white">
              Data sharing
            </h2>
            <p className="mt-3">
              Personal information is not sold. Information is shared only with
              the service providers required to operate and protect the game,
              or when required by law.
            </p>
          </section>

          <section aria-labelledby="choices">
            <h2 id="choices" className="text-2xl font-bold text-white">
              Your choices
            </h2>
            <p className="mt-3">
              You can remove stored player identifiers by clearing this site’s
              browser data. Avoid using a display name that contains personal
              information you do not want other players in the room to see.
            </p>
          </section>
        </div>
      </article>

      <SiteFooter />
    </main>
  );
}

import type { ReactNode } from "react";
import type { Metadata } from "next";
import { BackLink } from "@/components/BackLink";
import { SiteFooter } from "@/components/SiteFooter";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn what information Spyfall Online processes and how game and browser data are handled.",
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title: `Privacy Policy | ${SITE_NAME}`,
    description:
      "Learn what information Spyfall Online processes and how game and browser data are handled.",
    url: "/privacy",
  },
};

function PolicySection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section
      aria-labelledby={id}
      className="grid gap-3 py-8 sm:grid-cols-[14rem_1fr] sm:gap-8"
    >
      <h2
        id={id}
        className="font-display text-2xl font-bold uppercase leading-tight tracking-[0.03em] text-paper-50"
      >
        {title}
      </h2>
      <p className="leading-relaxed text-ink-200">{children}</p>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <main className="px-4 py-10 sm:py-14">
      <article className="mx-auto max-w-3xl">
        <BackLink href="/">Back to Spyfall</BackLink>

        <header className="mt-10 pb-10">
          <h1 className="font-display text-6xl font-extrabold uppercase leading-[0.9] tracking-[0.02em] text-paper-50 sm:text-7xl">
            Privacy Policy
          </h1>
          <p className="mt-5 text-sm text-ink-400">
            Last updated <time dateTime="2026-07-18">July 18, 2026</time>
          </p>
        </header>

        <div className="divide-y divide-white/[0.07] rounded-3xl border border-white/[0.07] bg-ink-850/80 px-6 sm:px-8">
          <PolicySection id="information" title="Information we process">
            When you play, the site processes your display name, room code, game
            settings, assigned role, and other lobby state needed to run the
            game. Your IP address is processed to prevent excessive room
            creation and joining attempts. Anonymous usage analytics may include
            the page viewed, referrer, approximate location, browser, operating
            system, and device type. Room codes are removed from page paths and
            query parameters before analytics are sent.
          </PolicySection>

          <PolicySection id="storage" title="Browser and game storage">
            A random player identifier is stored in your browser so you can
            reconnect to a room. The site does not use advertising cookies.
            Vercel Web Analytics does not use cookies. Lobby information is
            stored temporarily and expires after 24 hours without activity.
          </PolicySection>

          <PolicySection id="services" title="Service providers">
            Spyfall Online uses Vercel for website hosting and anonymous web
            analytics, and Upstash for lobby storage and rate limiting. These
            providers may process technical request information according to
            their own privacy policies.
          </PolicySection>

          <PolicySection id="sharing" title="Data sharing">
            Personal information is not sold. Information is shared only with
            the service providers required to operate and protect the game, or
            when required by law.
          </PolicySection>

          <PolicySection id="choices" title="Your choices">
            You can remove stored player identifiers by clearing this site’s
            browser data. Avoid using a display name that contains personal
            information you do not want other players in the room to see.
          </PolicySection>
        </div>
      </article>

      <SiteFooter />
    </main>
  );
}

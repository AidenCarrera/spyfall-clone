import type { ReactNode } from "react";
import type { Metadata, Route } from "next";
import Link from "next/link";
import { Gavel, Hourglass, LogIn, MapPin, Plus, Target } from "lucide-react";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";
import { BackLink } from "@/components/BackLink";
import { buttonClassName } from "@/components/Button";
import { SampleSpyCard, CardBack } from "@/components/cards/PlayingCard";
import { SiteFooter } from "@/components/SiteFooter";
import { SpyMark } from "@/components/SpyMark";
import { LOBBY_CODE_PATTERN } from "@/lib/lobby-code";
import { cn } from "@/lib/ui";

export const metadata: Metadata = {
  title: "Rules",
  description:
    "Learn how to play Spyfall online, including game setup, roles, questioning, accusations, win conditions, and strategy tips.",
  alternates: {
    canonical: "/rules",
  },
  openGraph: {
    title: `Rules | ${SITE_NAME}`,
    description: SITE_DESCRIPTION,
    url: "/rules",
  },
};

const setupSteps = [
  "Create a room and invite your friends with the room code or invite link.",
  "Players join from their own phones, tablets, or computers.",
  "The host selects the round timer, number of spies, and location set.",
  "Start the game.",
];

const roundEndings = [
  {
    title: "The Players Accuse the Spy",
    body: "If the group believes they know who the spy is, they may accuse that player. A correct accusation gives the victory to the non-spies. An incorrect accusation allows the spy to escape.",
    icon: Gavel,
  },
  {
    title: "The Spy Makes a Guess",
    body: "Before being caught, the spy may reveal themselves and attempt to identify the secret location. A correct guess wins the round for the spy. An incorrect guess gives the victory to the non-spies.",
    icon: Target,
  },
  {
    title: "Time Runs Out",
    body: "If the timer expires before the spy is identified, the spy wins the round.",
    icon: Hourglass,
  },
];

const faqs = [
  {
    question: "How many people can play?",
    answer: (
      <>
        Spyfall Online supports <strong>3-12 players</strong>, although groups
        of <strong>5-8</strong> often provide the best balance between deduction
        and bluffing.
      </>
    ),
  },
  {
    question: "Is Spyfall Online free?",
    answer:
      "Yes. Spyfall Online is completely free to play in your browser and requires no downloads or account.",
  },
  {
    question: "Can we play remotely?",
    answer:
      "Yes. Every player joins the same room from their own device using the room code or invite link, making Spyfall easy to play together from anywhere.",
  },
];

function getReturnPath(returnTo: string | string[] | undefined): Route {
  if (typeof returnTo !== "string") return "/";

  const match = returnTo.match(/^\/lobby\/([^/?#]+)$/);
  const lobbyCode = match?.[1];

  // Validated as /lobby/<valid code> for typedRoutes
  return lobbyCode && LOBBY_CODE_PATTERN.test(lobbyCode.toUpperCase())
    ? (returnTo as Route)
    : "/";
}

function RulesSection({
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
      className="relative py-12 before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-linear-to-r before:from-white/12 before:via-white/[0.06] before:to-transparent"
    >
      <h2
        id={id}
        className="font-display text-4xl font-extrabold uppercase tracking-[0.03em] text-paper-50 sm:text-5xl"
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function BriefingCard({
  tone,
  title,
  children,
}: {
  tone: "agent" | "spy";
  title: string;
  children: ReactNode;
}) {
  const isSpy = tone === "spy";
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl p-6 shadow-[0_24px_48px_-24px_rgb(0_0_0/0.9)] sm:p-7",
        isSpy
          ? "bg-ink-900 text-ink-200 ring-1 ring-crimson-500/35"
          : "paper-stock text-ink-800",
      )}
    >
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-2 rounded-xl border",
          isSpy ? "border-crimson-500/25" : "border-ink-900/15",
        )}
      />
      <div className="relative">
        <h3
          className={cn(
            "flex items-center gap-3 font-display text-2xl font-extrabold uppercase tracking-[0.04em]",
            isSpy ? "text-crimson-300" : "text-ink-900",
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-full ring-1",
              isSpy
                ? "bg-crimson-500/15 text-crimson-400 ring-crimson-400/30"
                : "bg-crimson-600/10 text-crimson-600 ring-crimson-600/25",
            )}
          >
            {isSpy ? (
              <SpyMark className="size-5" />
            ) : (
              <MapPin className="size-4.5" strokeWidth={2.5} />
            )}
          </span>
          {title}
        </h3>
        <ul
          className={cn(
            "mt-4 space-y-2 pl-5 leading-relaxed [&>li]:list-disc [&>li]:pl-1",
            isSpy ? "marker:text-crimson-400" : "marker:text-crimson-600",
          )}
        >
          {children}
        </ul>
      </div>
    </div>
  );
}

export default async function RulesPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string | string[] }>;
}) {
  const returnPath = getReturnPath((await searchParams).returnTo);
  const isReturningToLobby = returnPath !== "/";

  return (
    <main className="px-4 py-10 sm:py-14">
      <article className="mx-auto max-w-3xl">
        <BackLink href={returnPath}>
          {isReturningToLobby ? "Return to lobby or game" : "Back to Spyfall"}
        </BackLink>

        <header className="mt-10 pb-12">
          <div className="flex items-end justify-between gap-6">
            <h1 className="font-display text-6xl font-extrabold uppercase leading-[0.9] tracking-[0.02em] text-paper-50 sm:text-7xl">
              Spyfall rules
            </h1>
            <div
              aria-hidden="true"
              className="relative hidden h-32 w-36 shrink-0 sm:block"
            >
              <div className="absolute left-0 top-3 w-20 -rotate-12">
                <div className="aspect-[5/7]">
                  <CardBack />
                </div>
              </div>
              <div className="absolute right-0 top-0 w-20 rotate-[8deg]">
                <div className="aspect-[5/7]">
                  <SampleSpyCard />
                </div>
              </div>
            </div>
          </div>
          <div className="mt-7 space-y-4 text-lg leading-relaxed text-ink-200">
            <p className="text-xl text-paper-100">
              Spyfall is a social deduction party game where one player is
              secretly the spy.
            </p>
            <p>
              At the beginning of each round, every non-spy receives the same
              secret location along with a unique role connected to it. The spy
              does not know the location and must uncover it by carefully
              listening to the conversation while avoiding suspicion. Meanwhile,
              the non-spies work together to expose the spy without revealing
              too many clues.
            </p>
          </div>
        </header>

        <RulesSection id="setup" title="Game Setup">
          <ol className="relative mt-8 space-y-3 before:absolute before:bottom-6 before:left-[1.4375rem] before:top-6 before:w-px before:bg-linear-to-b before:from-brass-400/40 before:to-brass-400/5">
            {setupSteps.map((step, index) => (
              <li
                key={step}
                className="relative flex gap-4 rounded-2xl border border-white/[0.07] bg-ink-850/80 p-3 pr-5"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-brass-400/30 bg-ink-900 font-display text-lg font-bold text-brass-300 shadow-[0_0_0_4px_var(--color-ink-850)]">
                  {index + 1}
                </span>
                <p className="self-center leading-relaxed text-ink-200">
                  {step}
                </p>
              </li>
            ))}
          </ol>
          <p className="mt-6 text-lg leading-relaxed text-ink-200 [&_strong]:font-semibold [&_strong]:text-brass-300">
            Spyfall Online supports <strong>3-12 players</strong> with{" "}
            <strong>one or two spies</strong>.
          </p>
        </RulesSection>

        <RulesSection id="roles" title="Roles">
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <BriefingCard tone="agent" title="Non-Spies">
              <li>Know the secret location.</li>
              <li>Receive a role related to that location.</li>
              <li>
                Work together to identify the spy without revealing the
                location.
              </li>
            </BriefingCard>
            <BriefingCard tone="spy" title="Spy">
              <li>Does not know the location.</li>
              <li>
                Learns by listening carefully to every question and answer.
              </li>
              <li>
                Must blend in long enough to avoid suspicion or correctly guess
                the location.
              </li>
            </BriefingCard>
          </div>
        </RulesSection>

        <RulesSection id="round" title="How a Round Works">
          <div className="mt-6 space-y-4 text-[1.0625rem] leading-relaxed text-ink-200">
            <p>
              Players take turns asking one another questions about the hidden
              location. Questions should help determine who belongs without
              making the answer obvious to the spy.
            </p>
            <p>
              After answering, the responding player chooses another player to
              question. There is no fixed order, allowing the conversation to
              naturally shift toward whoever seems most suspicious.
            </p>
            <p className="border-l-2 border-brass-400/50 pl-4 text-paper-100">
              The challenge is finding the right balance. Questions that are too
              specific may reveal the location, while questions that are too
              vague may make innocent players appear suspicious.
            </p>
            <p>
              Pay attention to hesitation, contradictions, and answers that
              could fit almost anywhere. At the same time, remember that honest
              players can make mistakes or become nervous under pressure.
            </p>
          </div>
        </RulesSection>

        <RulesSection id="ending" title="Ending the Round">
          <p className="mt-4 leading-relaxed text-ink-200">
            A round ends in one of three ways:
          </p>
          <div className="mt-6 space-y-3">
            {roundEndings.map((ending) => (
              <article
                key={ending.title}
                className="grid gap-4 rounded-2xl border border-white/[0.07] bg-ink-850/80 p-5 sm:grid-cols-[auto_1fr] sm:p-6"
              >
                <span
                  aria-hidden="true"
                  className="flex size-12 items-center justify-center rounded-xl bg-brass-400/10 text-brass-400 ring-1 ring-brass-400/25"
                >
                  <ending.icon className="size-6" />
                </span>
                <div>
                  <h3 className="font-display text-2xl font-bold uppercase tracking-[0.03em] text-paper-50">
                    {ending.title}
                  </h3>
                  <p className="mt-2 leading-relaxed text-ink-200">
                    {ending.body}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </RulesSection>

        <RulesSection id="tips" title="Strategy Tips">
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <BriefingCard tone="agent" title="If You Know the Location">
              <li>Ask questions another non-spy can answer naturally.</li>
              <li>
                Share enough information to prove you belong, but avoid
                revealing the location directly.
              </li>
              <li>
                Watch for inconsistent, hesitant, or overly generic answers
                before making an accusation.
              </li>
            </BriefingCard>
            <BriefingCard tone="spy" title="If You Are the Spy">
              <li>Listen more than you speak.</li>
              <li>Match the level of detail used by the other players.</li>
              <li>Build a picture of the location from every conversation.</li>
              <li>
                Guess the location only when you believe you have enough
                information to be right.
              </li>
            </BriefingCard>
          </div>
        </RulesSection>

        <RulesSection id="faq" title="Frequently Asked Questions">
          <div className="mt-6 divide-y divide-white/[0.07] overflow-hidden rounded-2xl border border-white/[0.07] bg-ink-850/80">
            {faqs.map((faq) => (
              <article key={faq.question} className="p-5 sm:p-6">
                <h3 className="text-lg font-semibold text-paper-50">
                  {faq.question}
                </h3>
                <div className="mt-2 leading-relaxed text-ink-200 [&_strong]:font-semibold [&_strong]:text-brass-300">
                  {faq.answer}
                </div>
              </article>
            ))}
          </div>
        </RulesSection>

        <section className="relative mt-4 overflow-hidden rounded-3xl border border-white/[0.08] bg-ink-850 px-6 py-12 text-center shadow-[0_40px_80px_-40px_rgb(0_0_0/0.9)]">
          <SpyMark className="pointer-events-none absolute -bottom-8 -right-6 size-40 text-white/[0.03]" />
          <div className="relative">
            <h2 className="font-display text-4xl font-extrabold uppercase tracking-[0.03em] text-paper-50">
              Ready to play?
            </h2>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/create"
                className={buttonClassName({ variant: "primary", size: "lg" })}
              >
                <Plus
                  aria-hidden="true"
                  className="size-5"
                  strokeWidth={2.75}
                />
                Create a game
              </Link>
              <Link
                href="/join"
                className={buttonClassName({
                  variant: "secondary",
                  size: "lg",
                })}
              >
                <LogIn
                  aria-hidden="true"
                  className="size-5"
                  strokeWidth={2.5}
                />
                Join a game
              </Link>
            </div>
          </div>
        </section>
      </article>
      <SiteFooter />
    </main>
  );
}

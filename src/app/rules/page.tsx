import type { Metadata } from "next";
import Link from "next/link";
import { SITE_DESCRIPTION, SITE_NAME } from "@/src/lib/site";
import { SiteFooter } from "@/src/components/SiteFooter";

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
  },
  {
    title: "The Spy Makes a Guess",
    body: "Before being caught, the spy may reveal themselves and attempt to identify the secret location. A correct guess wins the round for the spy. An incorrect guess gives the victory to the non-spies.",
  },
  {
    title: "Time Runs Out",
    body: "If the timer expires before the spy is identified, the spy wins the round.",
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

export default function RulesPage() {
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
          <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
            Spyfall rules
          </h1>
          <div className="mt-5 space-y-4 text-lg leading-relaxed text-slate-300">
            <p>
              Spyfall is a social deduction party game where one player is
              secretly the spy.
            </p>
            <p>
              At the beginning of each round, every non-spy receives the same secret location along with a unique role connected to it.
              The spy does not know the location and must uncover it by carefully listening to the conversation while avoiding suspicion.
              Meanwhile, the non-spies work together to expose the spy without revealing too many clues.
            </p>
          </div>
        </header>

        <section aria-labelledby="setup" className="py-10">
          <h2 id="setup" className="text-3xl font-bold text-white">
            Game Setup
          </h2>
          <ol className="mt-6 space-y-4">
            {setupSteps.map((step, index) => (
              <li
                key={step}
                className="flex gap-4 rounded-xl border border-slate-700/60 bg-slate-800/40 p-5"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500/20 font-mono font-bold text-blue-200">
                  {index + 1}
                </span>
                <p className="self-center leading-relaxed text-slate-300">
                  {step}
                </p>
              </li>
            ))}
          </ol>
          <p className="mt-6 text-lg leading-relaxed text-slate-300">
            Spyfall Online supports <strong>3-12 players</strong> with{
              " "
            }
            <strong>one or two spies</strong>.
          </p>
        </section>

        <section
          aria-labelledby="roles"
          className="border-t border-slate-800 py-10"
        >
          <h2 id="roles" className="text-3xl font-bold text-white">
            Roles
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-6">
              <h3 className="text-xl font-semibold text-blue-200">
                Non-Spies
              </h3>
              <ul className="mt-4 list-disc space-y-2 pl-5 leading-relaxed text-slate-300 marker:text-blue-300">
                <li>Know the secret location.</li>
                <li>Receive a role related to that location.</li>
                <li>
                  Work together to identify the spy without revealing the
                  location.
                </li>
              </ul>
            </div>
            <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-6">
              <h3 className="text-xl font-semibold text-purple-200">Spy</h3>
              <ul className="mt-4 list-disc space-y-2 pl-5 leading-relaxed text-slate-300 marker:text-purple-300">
                <li>Does not know the location.</li>
                <li>
                  Learns by listening carefully to every question and answer.
                </li>
                <li>
                  Must blend in long enough to avoid suspicion or correctly
                  guess the location.
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section
          aria-labelledby="round"
          className="border-t border-slate-800 py-10"
        >
          <h2 id="round" className="text-3xl font-bold text-white">
            How a Round Works
          </h2>
          <div className="mt-6 space-y-4 leading-relaxed text-slate-300">
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
            <p>
              The challenge is finding the right balance. Questions that are
              too specific may reveal the location, while questions that are
              too vague may make innocent players appear suspicious.
            </p>
            <p>
              Pay attention to hesitation, contradictions,
              and answers that could fit almost anywhere. At the same time,
              remember that honest players can make mistakes or become nervous
              under pressure.
            </p>
          </div>
        </section>

        <section
          aria-labelledby="ending"
          className="border-t border-slate-800 py-10"
        >
          <h2 id="ending" className="text-3xl font-bold text-white">
            Ending the Round
          </h2>
          <p className="mt-4 leading-relaxed text-slate-300">
            A round ends in one of three ways:
          </p>
          <div className="mt-6 space-y-4">
            {roundEndings.map((ending, index) => (
              <article
                key={ending.title}
                className="rounded-xl border border-slate-700/60 bg-slate-800/40 p-6"
              >
                <p className="font-mono text-sm font-bold text-blue-300">
                  OUTCOME {index + 1}
                </p>
                <h3 className="mt-2 text-xl font-semibold text-white">
                  {ending.title}
                </h3>
                <p className="mt-2 leading-relaxed text-slate-300">
                  {ending.body}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section
          aria-labelledby="tips"
          className="border-t border-slate-800 py-10"
        >
          <h2 id="tips" className="text-3xl font-bold text-white">
            Strategy Tips
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-6">
              <h3 className="text-xl font-semibold text-blue-200">
                If You Know the Location
              </h3>
              <ul className="mt-4 list-disc space-y-2 pl-5 leading-relaxed text-slate-300 marker:text-blue-300">
                <li>Ask questions another non-spy can answer naturally.</li>
                <li>
                  Share enough information to prove you belong, but avoid
                  revealing the location directly.
                </li>
                <li>
                  Watch for inconsistent, hesitant, or overly generic answers
                  before making an accusation.
                </li>
              </ul>
            </div>
            <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-6">
              <h3 className="text-xl font-semibold text-purple-200">
                If You Are the Spy
              </h3>
              <ul className="mt-4 list-disc space-y-2 pl-5 leading-relaxed text-slate-300 marker:text-purple-300">
                <li>Listen more than you speak.</li>
                <li>Match the level of detail used by the other players.</li>
                <li>Build a picture of the location from every conversation.</li>
                <li>
                  Guess the location only when you believe you have enough
                  information to be right.
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section
          aria-labelledby="faq"
          className="border-t border-slate-800 py-10"
        >
          <h2 id="faq" className="text-3xl font-bold text-white">
            Frequently Asked Questions
          </h2>
          <div className="mt-6 space-y-4">
            {faqs.map((faq) => (
              <article
                key={faq.question}
                className="rounded-xl border border-slate-700/60 bg-slate-800/40 p-6"
              >
                <h3 className="text-lg font-semibold text-white">
                  {faq.question}
                </h3>
                <div className="mt-2 leading-relaxed text-slate-300 [&_strong]:font-semibold [&_strong]:text-white">
                  {faq.answer}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="border-t border-slate-800 pt-10 text-center">
          <h2 className="text-2xl font-bold text-white">Ready to play?</h2>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/create"
              className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-500"
            >
              Create a game
            </Link>
            <Link
              href="/join"
              className="rounded-lg bg-slate-700 px-6 py-3 font-semibold text-slate-100 transition-colors hover:bg-slate-600"
            >
              Join a game
            </Link>
          </div>
        </section>
      </article>
      <SiteFooter />
    </main>
  );
}

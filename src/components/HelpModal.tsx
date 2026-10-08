import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Lightbulb } from "lucide-react";
import { Button, buttonClassName } from "./Button";
import { Modal, ModalHeader } from "./Modal";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function Step({
  number,
  title,
  children,
}: {
  number: number;
  title: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="grid grid-cols-[2.25rem_1fr] gap-x-4">
      <span
        aria-hidden="true"
        className="flex size-9 items-center justify-center rounded-xl border border-brass-400/25 bg-brass-400/10 font-display text-lg font-bold text-brass-300"
      >
        {number}
      </span>
      <div className="space-y-2 pt-1">
        <h3 className="font-display text-xl font-bold uppercase tracking-[0.04em] text-paper-50">
          <span className="sr-only">{number}. </span>
          {title}
        </h3>
        {children}
      </div>
    </div>
  );
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  const pathname = usePathname();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      ariaLabelledBy="quick-rules-modal-title"
    >
      <ModalHeader
        id="quick-rules-modal-title"
        title="Quick Rules"
        icon={<BookOpen />}
        onClose={onClose}
        closeLabel="Close quick rules"
      />

      <div className="space-y-7 overflow-y-auto overscroll-contain px-5 py-6 leading-relaxed text-ink-200 sm:px-6">
        <p className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 text-ink-200">
          <strong className="text-paper-50">Spyfall</strong> is a social
          deduction game where one player is the spy and doesn&apos;t know the
          location. Everyone else sees the location and has a role. The
          spy&apos;s goal is to figure out the location without being caught;
          non-spies try to identify the spy.
        </p>

        <Step number={1} title="Join a Game">
          <p>
            Enter a display name and join a lobby using a 6-character code or
            invite link.
          </p>
        </Step>

        <Step number={2} title="Setup">
          <p>
            The host configures the game (round duration, number of spies, and
            location set). When the game starts, the app automatically assigns
            roles and a secret location.
          </p>
        </Step>

        <Step number={3} title="Game Flow">
          <ul className="space-y-1.5 marker:text-brass-400 [&>li]:ml-4 [&>li]:list-disc [&>li]:pl-1">
            <li>
              Players take turns asking each other subtle questions about the
              location.
            </li>
            <li>
              Non-spies try to demonstrate knowledge of the location without
              revealing it.
            </li>
            <li>The spy tries to blend in while gathering clues.</li>
          </ul>
        </Step>

        <Step number={4} title={<>Spy&apos;s Guess</>}>
          <p>At any point, the spy can attempt to guess the location.</p>
          <ul className="flex flex-wrap gap-2 font-medium">
            <li className="flex grow items-center gap-2 rounded-lg border border-crimson-400/25 bg-crimson-500/10 px-3 py-2 text-crimson-300 sm:whitespace-nowrap">
              <span
                aria-hidden="true"
                className="size-2 rounded-full bg-crimson-400"
              />
              Correct guess &rarr; spy wins
            </li>
            <li className="flex grow items-center gap-2 rounded-lg border border-brass-400/25 bg-brass-400/10 px-3 py-2 text-brass-300 sm:whitespace-nowrap">
              <span
                aria-hidden="true"
                className="size-2 rounded-full bg-brass-400"
              />
              Incorrect guess &rarr; non-spies win
            </li>
          </ul>
        </Step>

        <Step number={5} title="Optional Voting">
          <p>
            Players can vote to accuse someone of being the spy. If the majority
            vote correctly, non-spies win immediately.
          </p>
        </Step>

        <div className="rounded-xl border border-brass-400/20 bg-linear-to-br from-brass-400/10 to-transparent p-4">
          <h3 className="flex items-center gap-2 font-display text-xl font-bold uppercase tracking-[0.04em] text-brass-300">
            <Lightbulb aria-hidden="true" className="size-5" />
            <span className="sr-only">6. </span>
            Tips
          </h3>
          <ul className="mt-2 space-y-1.5 marker:text-brass-400 [&>li]:ml-4 [&>li]:list-disc [&>li]:pl-1">
            <li>Ask questions carefully to avoid revealing too much.</li>
            <li>
              Watch for vague or suspicious answers&mdash;they might be the spy.
            </li>
          </ul>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-white/[0.07] bg-ink-950/40 p-4 sm:flex-row sm:justify-end">
        <Button onClick={onClose} variant="secondary">
          Close
        </Button>
        <Link
          href={{
            pathname: "/rules",
            query: pathname.startsWith("/lobby/")
              ? { returnTo: pathname }
              : undefined,
          }}
          className={buttonClassName({ variant: "primary" })}
        >
          View Full Rules
        </Link>
      </div>
    </Modal>
  );
}

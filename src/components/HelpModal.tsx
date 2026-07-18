import { X } from "lucide-react";
import Link from "next/link";
import { Button } from "./Button";
import { Modal } from "./Modal";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  if (!isOpen) return null;

  return (
    <Modal onClose={onClose} ariaLabelledBy="quick-rules-modal-title">
      <div className="flex items-center justify-between p-4 border-b border-slate-800">
        <h2
          id="quick-rules-modal-title"
          className="text-xl font-bold text-blue-400"
        >
          Quick Rules
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded text-slate-400 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          aria-label="Close quick rules"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="p-6 overflow-y-auto space-y-6 text-slate-300 leading-relaxed">
        <div className="space-y-2">
          <p>
            <strong className="text-white">Spyfall</strong>{" "}is a social
            deduction game where one player is the spy and doesn&apos;t know the
            location. Everyone else sees the location and has a role. The
            spy&apos;s goal is to figure out the location without being caught;
            non-spies try to identify the spy.
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-white">1. Join a Game</h3>
          <p>
            Enter a display name and join a lobby using a 6-character code or
            invite link.
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-white">2. Setup</h3>
          <p>
            The host configures the game (round duration, number of spies, and
            location set). When the game starts, the app automatically assigns
            roles and a secret location.
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-white">3. Game Flow</h3>
          <ul className="list-disc list-inside space-y-1 pl-2">
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
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-white">
            4. Spy&apos;s Guess
          </h3>
          <p>At any point, the spy can attempt to guess the location.</p>
          <ul className="list-disc list-inside space-y-1 pl-2 font-medium">
            <li className="text-purple-400">Correct guess &rarr; spy wins</li>
            <li className="text-blue-400">
              Incorrect guess &rarr; non-spies win
            </li>
          </ul>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-white">
            5. Optional Voting
          </h3>
          <p>
            Players can vote to accuse someone of being the spy. If the majority
            vote correctly, non-spies win immediately.
          </p>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg space-y-2">
          <h3 className="text-lg font-semibold text-blue-300">6. Tips</h3>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Ask questions carefully to avoid revealing too much.</li>
            <li>
              Watch for vague or suspicious answers&mdash;they might be the spy.
            </li>
          </ul>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-slate-800 p-4 sm:flex-row sm:justify-end">
        <Button onClick={onClose} variant="secondary">
          Close
        </Button>
        <Link
          href="/rules"
          className="rounded-lg bg-blue-600 px-6 py-3 text-center font-semibold text-white transition-all duration-200 hover:bg-blue-500 active:scale-95"
        >
          View Full Rules
        </Link>
      </div>
    </Modal>
  );
}

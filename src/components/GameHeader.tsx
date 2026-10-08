import { CircleHelp } from "lucide-react";
import { Wordmark } from "@/components/Wordmark";
import { cn } from "@/lib/ui";

interface GameHeaderProps {
  onLeave: () => void;
  onHelp: () => void;
  className?: string;
}

export function GameHeader({
  onLeave,
  onHelp,
  className = "",
}: GameHeaderProps) {
  return (
    <header className={cn("flex items-center justify-between", className)}>
      <button
        type="button"
        onClick={onLeave}
        aria-label="Leave game"
        className="rounded-md transition-opacity hover:opacity-80"
      >
        <Wordmark className="text-[2rem]" />
      </button>
      <button
        type="button"
        onClick={onHelp}
        className="inline-flex h-9 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] pl-2.5 pr-3.5 text-sm font-medium text-ink-200 transition-colors hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
      >
        <CircleHelp aria-hidden="true" className="size-4 text-brass-400" />
        Help
      </button>
    </header>
  );
}

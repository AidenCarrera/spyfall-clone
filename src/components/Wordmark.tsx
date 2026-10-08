import { cn, stagger } from "@/lib/ui";

const LETTERS = "SPYFALL".split("");

interface WordmarkProps {
  className?: string;
  animated?: boolean;
}

export function Wordmark({ className, animated = false }: WordmarkProps) {
  return (
    <span
      className={cn(
        "inline-block font-stencil font-black uppercase tracking-[0.015em]",
        className,
        "leading-[0.85]",
      )}
    >
      <span className="sr-only">SPYFALL</span>
      <span
        aria-hidden="true"
        className="inline-flex [text-shadow:0_0.06em_0_rgb(0_0_0/0.45)]"
      >
        {animated ? (
          LETTERS.map((letter, index) => (
            <span
              key={index}
              className={cn(
                "inline-block animate-letter-drop",
                index < 3 ? "text-paper-100" : "text-crimson-500",
              )}
              style={stagger(index, 60)}
            >
              {letter}
            </span>
          ))
        ) : (
          <>
            <span className="text-paper-100">SPY</span>
            <span className="text-crimson-500">FALL</span>
          </>
        )}
      </span>
    </span>
  );
}

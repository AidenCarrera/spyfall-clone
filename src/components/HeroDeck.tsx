import {
  CardBack,
  SampleLocationCard,
  SampleSpyCard,
} from "@/components/cards/PlayingCard";
import { cn } from "@/lib/ui";

export function HeroDeck({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn("hero-deck relative", className)}>
      <div className="hero-deck-card" data-slot="left">
        <SampleLocationCard location="Casino" />
      </div>
      <div className="hero-deck-card" data-slot="right">
        <SampleSpyCard />
      </div>
      <div className="hero-deck-card" data-slot="center">
        <CardBack />
      </div>
    </div>
  );
}

import { CardBack } from "@/components/cards/PlayingCard";

export function LoadingScreen() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4">
      <div role="status" className="flex flex-col items-center gap-6">
        <div aria-hidden="true" className="w-16 animate-flip-loop">
          <div className="aspect-[5/7]">
            <CardBack />
          </div>
        </div>
        <p className="eyebrow animate-pulse-soft">Loading...</p>
      </div>
    </main>
  );
}

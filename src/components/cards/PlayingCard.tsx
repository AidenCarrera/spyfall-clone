import type { ReactNode } from "react";
import { MapPin } from "lucide-react";
import { SpyMark } from "@/components/SpyMark";
import { cn } from "@/lib/ui";

// Cards use container-query units (cqw) to scale across layouts.
const cardShell =
  "@container relative size-full overflow-hidden rounded-[7%/5%] shadow-[inset_0_1px_0_rgb(255_255_255/0.18),0_30px_60px_-24px_rgb(0_0_0/0.85),0_12px_24px_-12px_rgb(0_0_0/0.6)]";

/** Calculates container-query font size based on the longest word. */
export function cardTitleSize(text: string, scale: "role" | "location") {
  const longestWord = Math.max(...text.split(/\s+/).map((w) => w.length));
  if (scale === "role") {
    if (longestWord <= 9) return "text-[13cqw]";
    if (longestWord <= 12) return "text-[11cqw]";
    return "text-[9cqw]";
  }
  if (longestWord <= 9) return "text-[10.5cqw]";
  if (longestWord <= 12) return "text-[9cqw]";
  return "text-[7.5cqw]";
}

function CornerMarks({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div aria-hidden="true" className={className}>
      <span className="absolute left-[8.5%] top-[6.5%] flex w-[8%] [&>*]:w-full">
        {children}
      </span>
      <span className="absolute bottom-[6.5%] right-[8.5%] flex w-[8%] rotate-180 [&>*]:w-full">
        {children}
      </span>
    </div>
  );
}

export function CardBack({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div className={cn(cardShell, "card-back-pattern", className)}>
      <div className="absolute inset-[5%] rounded-[5.5%/4%] border-[0.6cqw] border-paper-100/40" />
      <div className="absolute inset-[8.5%] rounded-[4%/3%] border-[0.4cqw] border-paper-100/15" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex aspect-square w-[46%] items-center justify-center rounded-full border-[0.9cqw] border-paper-100/70 bg-crimson-800/80 shadow-[0_0_0_1.6cqw_rgb(102_13_22/0.55),inset_0_0_4cqw_rgb(0_0_0/0.35)]">
          <SpyMark className="w-[56%] text-paper-100" />
        </div>
      </div>
      {children}
    </div>
  );
}

export function PaperFace({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div className={cn(cardShell, "paper-stock text-ink-900", className)}>
      <div className="absolute inset-[5%] rounded-[5.5%/4%] border-[0.5cqw] border-ink-900/20" />
      <CornerMarks className="text-crimson-600">
        <MapPin strokeWidth={2.5} />
      </CornerMarks>
      {children}
    </div>
  );
}

export function SpyFace({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={cn(
        cardShell,
        "bg-ink-900 bg-[radial-gradient(ellipse_at_50%_35%,rgb(217_43_57/0.3),transparent_65%),linear-gradient(170deg,var(--color-ink-800),var(--color-ink-950))] text-paper-100",
        className,
      )}
    >
      <div className="absolute inset-[5%] rounded-[5.5%/4%] border-[0.5cqw] border-crimson-500/45" />
      <CornerMarks className="text-crimson-500">
        <SpyMark />
      </CornerMarks>
      {children}
    </div>
  );
}

export function CardDivider({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("flex w-3/4 items-center gap-[2cqw]", className)}
    >
      <span className="h-[0.5cqw] flex-1 bg-current opacity-30" />
      <span className="size-[2.2cqw] rotate-45 bg-current opacity-60" />
      <span className="h-[0.5cqw] flex-1 bg-current opacity-30" />
    </div>
  );
}

export function SampleLocationCard({ location }: { location: string }) {
  return (
    <PaperFace>
      <div className="absolute inset-[12%] flex flex-col items-center justify-center text-center">
        <span className="flex aspect-square w-[34%] items-center justify-center rounded-full bg-crimson-600/10 text-crimson-600 ring-[0.6cqw] ring-crimson-600/25">
          <MapPin className="w-1/2" strokeWidth={2.25} />
        </span>
        <p className="mt-[7cqw] font-display text-[13cqw] font-extrabold uppercase leading-[0.9] tracking-[0.02em]">
          {location}
        </p>
        <CardDivider className="mt-[5cqw] text-ink-900" />
      </div>
    </PaperFace>
  );
}

export function SampleSpyCard() {
  return (
    <SpyFace>
      <div className="absolute inset-[12%] flex flex-col items-center justify-center text-center">
        <SpyMark className="w-[46%] text-crimson-500 drop-shadow-[0_0_6cqw_rgb(217_43_57/0.5)]" />
        <p className="mt-[5cqw] font-stencil text-[20cqw] font-black uppercase leading-[0.85] tracking-[0.04em] text-crimson-400">
          Spy
        </p>
        <CardDivider className="mt-[5cqw] text-crimson-500" />
      </div>
    </SpyFace>
  );
}

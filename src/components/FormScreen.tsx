import type { ReactNode } from "react";
import { BackLink } from "@/components/BackLink";
import { Card } from "@/components/Card";
import { CardBack, PaperFace } from "@/components/cards/PlayingCard";
import { stagger } from "@/lib/ui";

export function FormScreen({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-14 animate-rise-in">
          <BackLink href="/">Back to Home</BackLink>
        </div>

        <Card
          className="animate-rise-in px-5 pb-6 pt-16 sm:px-8 sm:pb-8 sm:pt-16"
          style={stagger(1)}
        >
          <div
            aria-hidden="true"
            className="absolute left-1/2 top-0 h-24 w-28 -translate-x-1/2 -translate-y-1/2"
          >
            <div className="absolute left-1/2 top-1 w-15 translate-x-[-20%] rotate-[9deg]">
              <div className="aspect-[5/7]">
                <PaperFace />
              </div>
            </div>
            <div className="absolute left-1/2 top-0 w-15 translate-x-[-80%] -rotate-[7deg]">
              <div className="aspect-[5/7]">
                <CardBack />
              </div>
            </div>
          </div>

          <h1 className="text-center font-display text-4xl font-extrabold uppercase tracking-[0.05em] text-paper-50">
            {title}
          </h1>
          {children}
        </Card>
      </div>
    </main>
  );
}

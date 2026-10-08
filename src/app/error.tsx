"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { Button, buttonClassName } from "@/components/Button";
import { CardBack } from "@/components/cards/PlayingCard";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Route error:", error);
  }, [error]);

  return (
    <main className="flex min-h-dvh items-center justify-center px-4 text-ink-100">
      <div className="w-full max-w-md text-center">
        <div
          aria-hidden="true"
          className="mx-auto w-20 -rotate-6 animate-rise-in"
        >
          <div className="aspect-[5/7]">
            <CardBack />
          </div>
        </div>
        <h1 className="mt-8 font-display text-5xl font-extrabold uppercase tracking-[0.03em] text-paper-50">
          Something went wrong
        </h1>
        <p className="mt-3 text-ink-300">
          The game hit an unexpected error. Trying again usually fixes it.
        </p>
        {error.digest && (
          <p className="mt-3 font-mono text-xs text-ink-400">
            Reference: {error.digest}
          </p>
        )}
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button onClick={reset}>
            <RotateCcw aria-hidden="true" className="size-4" />
            Try again
          </Button>
          <Link href="/" className={buttonClassName({ variant: "secondary" })}>
            Return home
          </Link>
        </div>
      </div>
    </main>
  );
}

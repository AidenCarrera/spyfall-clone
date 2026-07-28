"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/Button";

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
    <main className="flex min-h-screen items-center justify-center bg-linear-to-b from-slate-900 to-slate-950 px-4 text-white">
      <div className="w-full max-w-md text-center">
        <h1 className="text-3xl font-bold">Something went wrong</h1>
        <p className="mt-3 text-slate-400">
          The game hit an unexpected error. Trying again usually fixes it.
        </p>
        {error.digest && (
          <p className="mt-2 font-mono text-xs text-slate-600">
            Reference: {error.digest}
          </p>
        )}
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button onClick={reset}>Try again</Button>
          <Link
            href="/"
            className="rounded-lg bg-slate-700 px-6 py-3 text-center font-semibold text-slate-100 transition-colors hover:bg-slate-600"
          >
            Return home
          </Link>
        </div>
      </div>
    </main>
  );
}

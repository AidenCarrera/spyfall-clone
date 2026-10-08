import Link from "next/link";
import { buttonClassName } from "@/components/Button";
import { CardBack, SampleSpyCard } from "@/components/cards/PlayingCard";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 text-ink-100">
      <div className="w-full max-w-md text-center">
        <div aria-hidden="true" className="relative mx-auto h-36 w-44">
          <div className="absolute left-3 top-2 w-22 -rotate-12 animate-rise-in">
            <div className="aspect-[5/7]">
              <CardBack />
            </div>
          </div>
          <div
            className="absolute right-3 top-0 w-22 rotate-[10deg] animate-rise-in"
            style={{ animationDelay: "120ms" }}
          >
            <div className="aspect-[5/7]">
              <SampleSpyCard />
            </div>
          </div>
        </div>
        <p className="mt-10 font-stencil text-2xl font-black tracking-[0.2em] text-crimson-400">
          404
        </p>
        <h1 className="mt-2 font-display text-5xl font-extrabold uppercase tracking-[0.03em] text-paper-50">
          Page not found
        </h1>
        <p className="mt-3 text-ink-300">
          The page you requested does not exist or is no longer available.
        </p>
        <Link href="/" className={buttonClassName({ className: "mt-8" })}>
          Return home
        </Link>
      </div>
    </main>
  );
}

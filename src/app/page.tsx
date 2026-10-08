"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, LogIn, Plus } from "lucide-react";
import { Button, buttonClassName } from "@/components/Button";
import { Card } from "@/components/Card";
import { HelpModal } from "@/components/HelpModal";
import { HeroDeck } from "@/components/HeroDeck";
import { SiteFooter } from "@/components/SiteFooter";
import { Wordmark } from "@/components/Wordmark";
import { stagger } from "@/lib/ui";

export default function Home() {
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  return (
    <main className="flex min-h-dvh flex-col overflow-x-clip px-4 py-6 sm:py-8">
      <div className="mx-auto grid w-full max-w-5xl flex-1 content-center items-center gap-6 sm:gap-10 lg:grid-cols-[1fr_1fr] lg:gap-12">
        <HeroDeck className="mx-auto h-40 w-full max-w-80 [--deck-card-width:6rem] sm:h-52 sm:max-w-md sm:[--deck-card-width:7.75rem] lg:h-[22rem] lg:max-w-none lg:[--deck-card-width:11.5rem]" />

        <section className="mx-auto w-full max-w-md space-y-7 text-center">
          <div className="space-y-4">
            <h1>
              <Wordmark
                animated
                className="text-[clamp(4.5rem,21vw,7.5rem)] lg:text-[8.5rem]"
              />
            </h1>
            <p
              className="animate-rise-in text-lg leading-relaxed text-ink-300"
              style={stagger(6)}
            >
              Deceive your friends. Uncover the spy.
            </p>
          </div>

          <Card
            className="animate-rise-in space-y-3 text-left"
            style={stagger(7)}
          >
            <Link
              href="/create"
              className={buttonClassName({
                fullWidth: true,
                variant: "primary",
                size: "lg",
              })}
            >
              <Plus aria-hidden="true" className="size-5" strokeWidth={2.75} />
              Create New Game
            </Link>

            <div className="flex items-center gap-3 py-1" aria-hidden="true">
              <span className="h-px flex-1 bg-linear-to-r from-transparent to-white/12" />
              <span className="eyebrow text-ink-400">OR</span>
              <span className="h-px flex-1 bg-linear-to-l from-transparent to-white/12" />
            </div>

            <Link
              href="/join"
              className={buttonClassName({
                fullWidth: true,
                variant: "secondary",
                size: "lg",
              })}
            >
              <LogIn aria-hidden="true" className="size-5" strokeWidth={2.5} />
              Join Existing Game
            </Link>

            <Button
              fullWidth
              variant="ghost"
              className="mt-1"
              onClick={() => setIsHelpOpen(true)}
            >
              <BookOpen aria-hidden="true" className="size-5 text-brass-400" />
              Quick Rules
            </Button>
          </Card>

          <p
            className="animate-rise-in text-sm text-ink-400"
            style={stagger(8)}
          >
            A clone of the original Spyfall by Alexandr Ushan
          </p>
        </section>
      </div>

      <SiteFooter compact />

      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </main>
  );
}

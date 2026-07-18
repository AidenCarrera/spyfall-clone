"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, buttonClassName } from "@/src/components/Button";
import { Card } from "@/src/components/Card";
import { HelpModal } from "@/src/components/HelpModal";
import { SiteFooter } from "@/src/components/SiteFooter";

export default function Home() {
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  return (
    <main className="flex min-h-screen flex-col bg-linear-to-b from-slate-900 to-slate-950 px-4 py-6 sm:py-8">
      <div className="mx-auto flex w-full max-w-5xl flex-1 items-center justify-center">
        <section className="mx-auto w-full max-w-md space-y-8 text-center">
          <div className="space-y-3">
            <h1 className="text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-purple-500 animate-moving-gradient spyfall-glow sm:text-7xl">
              SPYFALL
            </h1>
            <p className="text-base leading-relaxed text-slate-400">
              Deceive your friends. Uncover the spy.
            </p>
          </div>

          <Card className="space-y-4 text-left">
            <Link
              href="/create"
              className={buttonClassName({
                fullWidth: true,
                variant: "primary",
                className: "h-14 text-lg",
              })}
            >
              Create New Game
            </Link>

            <div className="relative" aria-hidden="true">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-slate-800 px-2 text-slate-300">OR</span>
              </div>
            </div>

            <Link
              href="/join"
              className={buttonClassName({
                fullWidth: true,
                variant: "secondary",
                className: "h-14 text-lg",
              })}
            >
              Join Existing Game
            </Link>

            <Button
              fullWidth
              variant="secondary"
              className="h-12 border-slate-700 bg-slate-800/50 text-base hover:bg-slate-800"
              onClick={() => setIsHelpOpen(true)}
            >
              Quick Rules
            </Button>
          </Card>

          <p className="text-sm text-slate-500">
            A clone of the original Spyfall by Alexandr Ushan
          </p>
        </section>
      </div>

      <SiteFooter compact />

      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </main>
  );
}

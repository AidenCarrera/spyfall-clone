"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "./components/Button";
import { Card } from "./components/Card";
import { HelpModal } from "./components/HelpModal";

export default function Home() {
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-linear-to-b from-slate-900 to-slate-950">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-6xl font-black text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-purple-500 tracking-tighter">
            SPYFALL
          </h1>
          <p className="text-slate-400 text-lg">
            Deceive your friends. Find the spy.
          </p>
        </div>

        <Card className="space-y-4">
          <Link href="/create" className="block">
            <Button fullWidth variant="primary" className="h-14 text-lg">
              Create New Game
            </Button>
          </Link>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-800 text-slate-500">OR</span>
            </div>
          </div>

          <Link href="/join" className="block">
            <Button fullWidth variant="secondary" className="h-14 text-lg">
              Join Existing Game
            </Button>
          </Link>

          <Button
            fullWidth
            variant="secondary"
            className="h-12 text-base border-slate-700 bg-slate-800/50 hover:bg-slate-800"
            onClick={() => setIsHelpOpen(true)}
          >
            How to Play
          </Button>
        </Card>

        <div className="text-center text-sm text-slate-600">
          <p>A clone of the original Spyfall by Alexandr Ushan</p>
        </div>
      </div>

      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </main>
  );
}

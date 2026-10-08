"use client";

import { useState } from "react";
import { Pause, Play, Square } from "lucide-react";
import { Button } from "@/components/Button";
import { GameHeader } from "@/components/GameHeader";
import { HelpModal } from "@/components/HelpModal";
import { RoleCard } from "./RoleCard";
import { LocationsReference } from "./LocationsReference";
import type { ClientLobbyState } from "@/lib/lobby-state";
import { cn } from "@/lib/ui";

const LOW_TIME_SECONDS = 60;

interface GameViewProps {
  lobby: ClientLobbyState;
  timeLeft: string;
  isTimeUp: boolean;
  secondsRemaining: number | null;
  onLeave: () => void;
  onTogglePause: () => void;
  isResetting?: boolean;
  onReset: () => void;
}

export function GameView({
  lobby,
  timeLeft,
  isTimeUp,
  secondsRemaining,
  onLeave,
  onTogglePause,
  isResetting,
  onReset,
}: GameViewProps) {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const isHost = lobby.me.isHost;

  const totalSeconds = lobby.timerDuration * 60;
  const progress =
    secondsRemaining !== null && totalSeconds > 0
      ? Math.min(1, secondsRemaining / totalSeconds)
      : 1;
  const isLowTime =
    !isTimeUp &&
    !lobby.isPaused &&
    secondsRemaining !== null &&
    secondsRemaining <= LOW_TIME_SECONDS;

  return (
    <main className="min-h-dvh px-4 pb-12 pt-4 text-ink-100 sm:pt-6">
      <div className="mx-auto w-full max-w-md lg:max-w-5xl">
        <GameHeader
          onLeave={onLeave}
          onHelp={() => setIsHelpOpen(true)}
          className="mb-6"
        />

        <div
          className={cn(
            "relative animate-rise-in overflow-hidden rounded-2xl border bg-ink-850/90 p-4 pb-5 transition-[border-color,box-shadow] duration-500 sm:px-5",
            isTimeUp
              ? "border-crimson-400/50 shadow-[0_0_48px_-12px_rgb(217_43_57/0.7)]"
              : lobby.isPaused
                ? "border-brass-400/30"
                : "border-white/[0.08]",
          )}
        >
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
            <div className="min-w-0">
              <h1 className="eyebrow flex items-center gap-2">
                <span aria-hidden="true" className="relative flex size-2">
                  {!lobby.isPaused && !isTimeUp && (
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-crimson-400 opacity-70" />
                  )}
                  <span
                    className={cn(
                      "relative inline-flex size-2 rounded-full",
                      lobby.isPaused ? "bg-brass-400" : "bg-crimson-400",
                    )}
                  />
                </span>
                Game in progress
              </h1>
              {timeLeft && (
                <p
                  className={cn(
                    "mt-1.5 flex flex-wrap items-baseline gap-x-2 font-mono text-4xl font-bold tabular-nums leading-none tracking-tight sm:text-5xl",
                    isTimeUp
                      ? "animate-pulse text-crimson-400"
                      : lobby.isPaused
                        ? "text-brass-300"
                        : isLowTime
                          ? "text-crimson-300"
                          : "text-paper-50",
                  )}
                >
                  {isTimeUp ? "TIME'S UP!" : timeLeft}{" "}
                  {lobby.isPaused && (
                    <span className="animate-pulse-soft text-sm font-semibold tracking-[0.15em] text-brass-400">
                      (PAUSED)
                    </span>
                  )}
                </p>
              )}
            </div>
            {isHost && (
              <div className="flex items-center gap-2">
                {!isTimeUp && (
                  <Button variant="secondary" size="sm" onClick={onTogglePause}>
                    {lobby.isPaused ? (
                      <Play
                        aria-hidden="true"
                        className="size-4 fill-current"
                      />
                    ) : (
                      <Pause
                        aria-hidden="true"
                        className="size-4 fill-current"
                      />
                    )}
                    {lobby.isPaused ? "Resume" : "Pause"}
                  </Button>
                )}
                <Button
                  variant="danger"
                  size="sm"
                  onClick={onReset}
                  disabled={isResetting}
                >
                  <Square
                    aria-hidden="true"
                    className="size-3.5 fill-current"
                  />
                  {isResetting ? "Ending..." : "End Game"}
                </Button>
              </div>
            )}
          </div>

          {timeLeft && (
            <div
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 h-1 bg-white/[0.05]"
            >
              <div
                className={cn(
                  "h-full origin-left transition-[transform,background-color] duration-1000 ease-linear",
                  isTimeUp || isLowTime
                    ? "bg-crimson-500"
                    : lobby.isPaused
                      ? "bg-brass-400/70"
                      : "bg-linear-to-r from-brass-500 to-brass-300",
                )}
                style={{ transform: `scaleX(${progress})` }}
              />
            </div>
          )}
        </div>

        <div className="mt-8 grid gap-10 lg:grid-cols-[20rem_1fr] lg:items-start lg:gap-12">
          <div className="lg:sticky lg:top-6">
            <RoleCard
              lobby={lobby}
              isRevealed={isRevealed}
              setIsRevealed={setIsRevealed}
            />
          </div>

          <div className="animate-rise-in" style={{ animationDelay: "200ms" }}>
            <LocationsReference lobby={lobby} />
          </div>
        </div>

        <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      </div>
    </main>
  );
}

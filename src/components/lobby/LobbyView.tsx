"use client";

import { useState } from "react";
import type { KeyedMutator } from "swr";
import { LoaderCircle, LogOut, Play } from "lucide-react";
import { Button } from "@/components/Button";
import { GameHeader } from "@/components/GameHeader";
import { HelpModal } from "@/components/HelpModal";
import { AccessCode } from "./AccessCode";
import { GameSettings } from "./GameSettings";
import { PlayerList } from "./PlayerList";
import type { ClientLobbyState, LobbyStateResponse } from "@/lib/lobby-state";
import { MIN_PLAYERS } from "@/lib/game-rules";
import { stagger } from "@/lib/ui";

interface LobbyViewProps {
  lobby: ClientLobbyState;
  mutate: KeyedMutator<LobbyStateResponse>;
  isStarting?: boolean;
  onStartGame: () => void;
  onLeave: () => void;
}

export function LobbyView({
  lobby,
  mutate,
  isStarting,
  onStartGame,
  onLeave,
}: LobbyViewProps) {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const isHost = lobby.me.isHost;
  const hasEnoughPlayers = lobby.players.length >= MIN_PLAYERS;

  return (
    <main className="flex min-h-dvh flex-col px-4 pt-4 text-ink-100 sm:pt-6">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col lg:max-w-2xl">
        <GameHeader
          onLeave={onLeave}
          onHelp={() => setIsHelpOpen(true)}
          className="mb-8"
        />

        <div className="mb-6 flex animate-rise-in items-end justify-between gap-4">
          <h1 className="font-display text-5xl font-extrabold uppercase leading-none tracking-[0.03em] text-paper-50">
            Lobby
          </h1>
          <Button variant="outline" size="sm" onClick={onLeave}>
            <LogOut aria-hidden="true" className="size-4" />
            Leave
          </Button>
        </div>

        <div className="grid gap-5 lg:gap-6">
          <div className="animate-rise-in" style={stagger(1)}>
            <AccessCode code={lobby.code} />
          </div>
          <div className="animate-rise-in" style={stagger(2)}>
            <GameSettings lobby={lobby} mutate={mutate} />
          </div>
          <div className="animate-rise-in" style={stagger(3)}>
            <PlayerList lobby={lobby} mutate={mutate} />
          </div>
        </div>

        <div className="sticky bottom-0 z-20 -mx-4 mt-auto px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-8 before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:bg-linear-to-t before:from-ink-950 before:via-ink-950/90 before:to-transparent lg:before:[mask-image:linear-gradient(to_right,transparent,black_1rem,black_calc(100%-1rem),transparent)]">
          <div className="mx-auto max-w-md">
            {isHost ? (
              <Button
                fullWidth
                size="lg"
                onClick={onStartGame}
                disabled={!hasEnoughPlayers || isStarting}
              >
                {isStarting ? (
                  <>
                    <LoaderCircle
                      aria-hidden="true"
                      className="size-5 animate-spin"
                    />
                    Starting...
                  </>
                ) : (
                  <>
                    <Play
                      aria-hidden="true"
                      className="size-5 fill-current"
                      strokeWidth={2.5}
                    />
                    Start Game
                    {!hasEnoughPlayers && (
                      <>
                        {" "}
                        <span className="font-sans text-sm font-semibold normal-case tracking-normal">
                          (Need {MIN_PLAYERS}+ players)
                        </span>
                      </>
                    )}
                  </>
                )}
              </Button>
            ) : (
              <p
                role="status"
                className="flex h-14 items-center justify-center gap-3 rounded-xl border border-white/10 bg-ink-850/95 px-5 text-ink-300 shadow-[0_20px_40px_-20px_rgb(0_0_0/0.9)]"
              >
                <span aria-hidden="true" className="relative flex size-2.5">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-brass-400 opacity-60" />
                  <span className="relative inline-flex size-2.5 rounded-full bg-brass-400" />
                </span>
                <span className="animate-pulse-soft">
                  Waiting for host to start...
                </span>
              </p>
            )}
          </div>
        </div>

        <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      </div>
    </main>
  );
}

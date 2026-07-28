"use client";

import { useState } from "react";
import type { KeyedMutator } from "swr";
import { Button } from "@/components/Button";
import { GameHeader } from "@/components/GameHeader";
import { HelpModal } from "@/components/HelpModal";
import { AccessCode } from "./AccessCode";
import { GameSettings } from "./GameSettings";
import { PlayerList } from "./PlayerList";
import type { ClientLobbyState } from "@/app/actions";
import { MIN_PLAYERS } from "@/lib/game-rules";

interface LobbyViewProps {
  lobby: ClientLobbyState;
  mutate: KeyedMutator<{ lobby?: ClientLobbyState; error?: string }>;
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
    <main className="min-h-screen p-4 bg-linear-to-b from-slate-900 to-slate-950 text-white">
      <div className="max-w-md mx-auto space-y-6">
        <GameHeader
          onLeave={onLeave}
          onHelp={() => setIsHelpOpen(true)}
          className="mb-8"
        />

        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Lobby</h1>
          <Button
            variant="outline"
            onClick={onLeave}
            className="text-sm px-3 py-1"
          >
            Leave
          </Button>
        </div>

        <AccessCode code={lobby.code} />

        <GameSettings lobby={lobby} mutate={mutate} />

        <PlayerList lobby={lobby} mutate={mutate} />

        {isHost ? (
          <Button
            fullWidth
            onClick={onStartGame}
            disabled={!hasEnoughPlayers || isStarting}
          >
            {isStarting
              ? "Starting..."
              : `Start Game${hasEnoughPlayers ? "" : ` (Need ${MIN_PLAYERS}+ players)`}`}
          </Button>
        ) : (
          <p className="text-center text-slate-500 animate-pulse">
            Waiting for host to start...
          </p>
        )}

        <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      </div>
    </main>
  );
}

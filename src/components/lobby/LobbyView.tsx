"use client";

import { useState } from "react";
import type { KeyedMutator } from "swr";
import { Button } from "@/src/components/Button";
import { GameHeader } from "@/src/components/GameHeader";
import { HelpModal } from "@/src/components/HelpModal";
import { AccessCode } from "./AccessCode";
import { GameSettings } from "./GameSettings";
import { PlayerList } from "./PlayerList";
import type { ClientLobbyState } from "@/src/app/actions";

interface LobbyViewProps {
  code: string;
  lobby: ClientLobbyState;
  playerId: string;
  mutate: KeyedMutator<{ lobby?: ClientLobbyState; error?: string }>;
  isStarting?: boolean;
  onStartGame: () => void;
  onLeave: () => void;
}

export function LobbyView({
  code,
  lobby,
  playerId,
  mutate,
  isStarting,
  onStartGame,
  onLeave,
}: LobbyViewProps) {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const isHost = lobby.me.isHost;

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

        <AccessCode code={code} />

        <GameSettings
          code={code}
          lobby={lobby}
          playerId={playerId}
          isHost={isHost}
          mutate={mutate}
        />

        <PlayerList
          code={code}
          lobby={lobby}
          playerId={playerId}
          isHost={isHost}
          mutate={mutate}
        />

        {isHost ? (
          <Button
            fullWidth
            onClick={onStartGame}
            disabled={lobby.players.length < 3 || isStarting}
          >
            {isStarting
              ? "Starting..."
              : `Start Game${lobby.players.length < 3 ? " (Need 3+ players)" : ""}`}
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

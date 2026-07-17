"use client";

import { useState } from "react";
import { Button } from "@/src/components/Button";
import { GameHeader } from "@/src/components/GameHeader";
import { HelpModal } from "@/src/components/HelpModal";
import { RoleCard } from "./RoleCard";
import { LocationsReference } from "./LocationsReference";
import type { ClientLobbyState } from "@/src/app/actions";

interface GameViewProps {
  lobby: ClientLobbyState;
  timeLeft: string;
  isTimeUp: boolean;
  onLeave: () => void;
  onTogglePause: () => void;
  isResetting?: boolean;
  onReset: () => void;
}

export function GameView({
  lobby,
  timeLeft,
  isTimeUp,
  onLeave,
  onTogglePause,
  isResetting,
  onReset,
}: GameViewProps) {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const isHost = lobby.me.isHost;

  return (
    <main className="min-h-screen p-4 bg-linear-to-b from-slate-900 to-slate-950 text-white">
      <div className="max-w-md mx-auto space-y-6">
        <GameHeader
          onLeave={onLeave}
          onHelp={() => setIsHelpOpen(true)}
          className="mb-6"
        />

        <div className="flex justify-between items-center">
          <div className="text-sm text-slate-400 flex items-center gap-2">
            <span>Game in progress</span>
            {timeLeft && (
              <span
                className={`font-mono font-bold ${
                  isTimeUp
                    ? "text-red-500 animate-pulse"
                    : lobby.isPaused
                      ? "text-yellow-400"
                      : "text-blue-400"
                }`}
              >
                {isTimeUp ? "TIME'S UP!" : timeLeft}{" "}
                {lobby.isPaused && "(PAUSED)"}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isHost && (
              <div className="flex gap-2">
                {!isTimeUp && (
                  <Button
                    variant="secondary"
                    onClick={onTogglePause}
                    className="text-xs px-2 py-1"
                  >
                    {lobby.isPaused ? "Resume" : "Pause"}
                  </Button>
                )}
                <Button
                  variant="danger"
                  onClick={onReset}
                  className="text-xs px-2 py-1"
                  disabled={isResetting}
                >
                  {isResetting ? "Ending..." : "End Game"}
                </Button>
              </div>
            )}
          </div>
        </div>

        <RoleCard
          lobby={lobby}
          isRevealed={isRevealed}
          setIsRevealed={setIsRevealed}
        />

        <LocationsReference lobby={lobby} isRevealed={isRevealed} />

        <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      </div>
    </main>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/Button";
import { HelpModal } from "@/app/components/HelpModal";
import { RoleCard } from "./RoleCard";
import { LocationsReference } from "./LocationsReference";
import { ClientLobbyState } from "@/app/actions";

interface GameViewProps {
  lobby: ClientLobbyState;
  isRevealed: boolean;
  setIsRevealed: (revealed: boolean) => void;
  timeLeft: string;
  isTimeUp: boolean;
  onTogglePause: () => void;
  onReset: () => void;
}

export function GameView({
  lobby,
  isRevealed,
  setIsRevealed,
  timeLeft,
  isTimeUp,
  onTogglePause,
  onReset,
}: GameViewProps) {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const router = useRouter();
  const isHost = lobby.me?.isHost || false;

  return (
    <main className="min-h-screen p-4 bg-linear-to-b from-slate-900 to-slate-950 text-white">
      <div className="max-w-md mx-auto space-y-6">
        <header className="flex items-center justify-between mb-6">
          <div
            className="flex items-center gap-2"
            onClick={() => {
              if (
                confirm(
                  "Return to title screen? You will leave the current game."
                )
              ) {
                router.push("/");
              }
            }}
          >
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-purple-500 tracking-tighter cursor-pointer">
              SPYFALL
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsHelpOpen(true)}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded transition-colors"
            >
              Help
            </button>
          </div>
        </header>

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
                >
                  End Game
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

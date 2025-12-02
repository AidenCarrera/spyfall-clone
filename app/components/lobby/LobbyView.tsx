"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyedMutator } from "swr";
import { Button } from "@/app/components/Button";
import { HelpModal } from "@/app/components/HelpModal";
import { AccessCode } from "./AccessCode";
import { GameSettings } from "./GameSettings";
import { PlayerList } from "./PlayerList";
import { ClientLobbyState } from "@/app/actions";

interface LobbyViewProps {
  code: string;
  lobby: ClientLobbyState;
  playerId: string;
  mutate: KeyedMutator<{ lobby?: ClientLobbyState; error?: string }>;
  onStartGame: () => void;
  onLeave: () => void;
}

export function LobbyView({
  code,
  lobby,
  playerId,
  mutate,
  onStartGame,
  onLeave,
}: LobbyViewProps) {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const router = useRouter();
  const isHost = lobby.me?.isHost || false;

  return (
    <main className="min-h-screen p-4 bg-linear-to-b from-slate-900 to-slate-950 text-white">
      <div className="max-w-md mx-auto space-y-6">
        <header className="flex items-center justify-between mb-8">
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
            disabled={lobby.players.length < 3}
          >
            Start Game {lobby.players.length < 3 && "(Need 3+ players)"}
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

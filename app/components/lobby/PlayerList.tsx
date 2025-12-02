"use client";

import { KeyedMutator } from "swr";
import { Card } from "@/app/components/Card";
import {
  ClientLobbyState,
  kickPlayerAction,
  promoteHostAction,
} from "@/app/actions";

interface PlayerListProps {
  code: string;
  lobby: ClientLobbyState;
  playerId: string;
  isHost: boolean;
  mutate: KeyedMutator<{ lobby?: ClientLobbyState; error?: string }>;
}

export function PlayerList({
  code,
  lobby,
  playerId,
  isHost,
  mutate,
}: PlayerListProps) {
  return (
    <Card title={`Players (${lobby.players.length})`}>
      <ul className="space-y-2">
        {[...lobby.players]
          .sort((a, b) => {
            if (a.id === playerId) return -1;
            if (b.id === playerId) return 1;
            return a.name.localeCompare(b.name);
          })
          .map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between bg-slate-700/50 p-3 rounded-lg"
            >
              <div className="flex items-center gap-2">
                <span
                  className={p.id === playerId ? "font-bold text-blue-300" : ""}
                >
                  {p.name} {p.id === playerId && "(You)"}
                </span>
                {p.isHost && (
                  <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded">
                    HOST
                  </span>
                )}
              </div>
              {isHost && !p.isHost && (
                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      if (
                        confirm(
                          `Are you sure you want to make ${p.name} the host? You will lose host privileges.`
                        )
                      ) {
                        await promoteHostAction(code, p.id);
                        mutate();
                      }
                    }}
                    className="text-xs bg-slate-600 hover:bg-slate-500 text-slate-300 px-2 py-1 rounded transition-colors"
                  >
                    Make Host
                  </button>
                  <button
                    onClick={async () => {
                      if (confirm(`Are you sure you want to kick ${p.name}?`)) {
                        await kickPlayerAction(code, p.id);
                        mutate();
                      }
                    }}
                    className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-red-400 px-2 py-1 rounded transition-colors"
                  >
                    Kick
                  </button>
                </div>
              )}
            </li>
          ))}
      </ul>
    </Card>
  );
}

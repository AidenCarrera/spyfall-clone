"use client";

import { useState } from "react";
import type { KeyedMutator } from "swr";
import { Card } from "@/src/components/Card";
import {
  kickPlayerAction,
  promoteHostAction,
  type ClientLobbyState,
} from "@/src/app/actions";

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
  const [pendingPlayerId, setPendingPlayerId] = useState<string | null>(null);

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
                    disabled={pendingPlayerId === p.id}
                    onClick={async () => {
                      if (
                        confirm(
                          `Are you sure you want to make ${p.name} the host? You will lose host privileges.`,
                        )
                      ) {
                        setPendingPlayerId(p.id);
                        // Revalidation reconciles this immediate host transfer.
                        await mutate(
                          (current) =>
                            current?.lobby
                              ? {
                                  ...current,
                                  lobby: {
                                    ...current.lobby,
                                    players: current.lobby.players.map(
                                      (pl) => ({
                                        ...pl,
                                        isHost: pl.id === p.id,
                                      }),
                                    ),
                                    me: {
                                      ...current.lobby.me,
                                      isHost: current.lobby.me.id === p.id,
                                    },
                                  },
                                }
                              : current,
                          { revalidate: false },
                        );
                        try {
                          await promoteHostAction(code, playerId, p.id);
                          mutate();
                        } finally {
                          setPendingPlayerId(null);
                        }
                      }
                    }}
                    className="text-xs bg-slate-600 hover:bg-slate-500 text-slate-300 px-2 py-1 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Make Host
                  </button>
                  <button
                    disabled={pendingPlayerId === p.id}
                    onClick={async () => {
                      if (confirm(`Are you sure you want to kick ${p.name}?`)) {
                        setPendingPlayerId(p.id);
                        // Revalidation reconciles this immediate removal.
                        await mutate(
                          (current) =>
                            current?.lobby
                              ? {
                                  ...current,
                                  lobby: {
                                    ...current.lobby,
                                    players: current.lobby.players.filter(
                                      (pl) => pl.id !== p.id,
                                    ),
                                  },
                                }
                              : current,
                          { revalidate: false },
                        );
                        try {
                          await kickPlayerAction(code, playerId, p.id);
                          mutate();
                        } finally {
                          setPendingPlayerId(null);
                        }
                      }
                    }}
                    className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-red-400 px-2 py-1 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

"use client";

import { useState } from "react";
import type { KeyedMutator } from "swr";
import { Card } from "@/src/components/Card";
import {
  kickPlayerAction,
  promoteHostAction,
  type ClientLobbyState,
} from "@/src/app/actions";

type LobbyResponse = { lobby?: ClientLobbyState; error?: string };

interface PlayerListProps {
  lobby: ClientLobbyState;
  mutate: KeyedMutator<LobbyResponse>;
}

export function PlayerList({ lobby, mutate }: PlayerListProps) {
  const [pendingPlayerId, setPendingPlayerId] = useState<string | null>(null);
  const playerId = lobby.me.id;
  const isHost = lobby.me.isHost;

  // Applies an optimistic view of the change, then lets revalidation reconcile
  // it with whatever the server actually did.
  const runHostAction = async (
    targetPlayerId: string,
    optimisticUpdate: (current: ClientLobbyState) => ClientLobbyState,
    action: () => Promise<unknown>,
  ) => {
    setPendingPlayerId(targetPlayerId);
    await mutate(
      (current) =>
        current?.lobby
          ? { ...current, lobby: optimisticUpdate(current.lobby) }
          : current,
      { revalidate: false },
    );
    try {
      await action();
      mutate();
    } finally {
      setPendingPlayerId(null);
    }
  };

  const handlePromote = (target: ClientLobbyState["players"][number]) => {
    if (
      !confirm(
        `Are you sure you want to make ${target.name} the host? You will lose host privileges.`,
      )
    ) {
      return;
    }

    return runHostAction(
      target.id,
      (current) => ({
        ...current,
        players: current.players.map((p) => ({
          ...p,
          isHost: p.id === target.id,
        })),
        me: { ...current.me, isHost: current.me.id === target.id },
      }),
      () => promoteHostAction(lobby.code, target.id),
    );
  };

  const handleKick = (target: ClientLobbyState["players"][number]) => {
    if (!confirm(`Are you sure you want to kick ${target.name}?`)) return;

    return runHostAction(
      target.id,
      (current) => ({
        ...current,
        players: current.players.filter((p) => p.id !== target.id),
      }),
      () => kickPlayerAction(lobby.code, target.id),
    );
  };

  const sortedPlayers = [...lobby.players].sort((a, b) => {
    if (a.id === playerId) return -1;
    if (b.id === playerId) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <Card title={`Players (${lobby.players.length})`}>
      <ul className="space-y-2">
        {sortedPlayers.map((p) => {
          const isMe = p.id === playerId;
          return (
            <li
              key={p.id}
              className="flex items-center justify-between bg-slate-700/50 p-3 rounded-lg"
            >
              <div className="flex items-center gap-2">
                <span className={isMe ? "font-bold text-blue-300" : ""}>
                  {p.name} {isMe && "(You)"}
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
                    onClick={() => handlePromote(p)}
                    className="text-xs bg-slate-600 hover:bg-slate-500 text-slate-300 px-2 py-1 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Make Host
                  </button>
                  <button
                    disabled={pendingPlayerId === p.id}
                    onClick={() => handleKick(p)}
                    className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-red-400 px-2 py-1 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Kick
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

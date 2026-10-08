"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Crown, UserPlus, Users, UserX } from "lucide-react";
import type { KeyedMutator } from "swr";
import { Card } from "@/components/Card";
import { useConfirm } from "@/components/ConfirmDialog";
import { kickPlayerAction, promoteHostAction } from "@/app/actions";
import type { ClientLobbyState, LobbyStateResponse } from "@/lib/lobby-state";
import { MIN_PLAYERS } from "@/lib/game-rules";
import { cn } from "@/lib/ui";

const AVATAR_TINTS = [
  "bg-crimson-500/15 text-crimson-300 ring-crimson-400/30",
  "bg-brass-400/12 text-brass-300 ring-brass-400/30",
  "bg-[#5fb3a1]/15 text-[#8fd6c6] ring-[#5fb3a1]/30",
  "bg-[#8b8fd8]/15 text-[#b9bcf2] ring-[#8b8fd8]/30",
  "bg-[#d98a5f]/15 text-[#f0b492] ring-[#d98a5f]/30",
  "bg-[#9bb86b]/15 text-[#c3dc98] ring-[#9bb86b]/30",
];

function avatarTint(name: string) {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + (char.codePointAt(0) ?? 0)) | 0;
  return AVATAR_TINTS[Math.abs(hash) % AVATAR_TINTS.length];
}

function initials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const letters = words.slice(0, 2).map((word) => Array.from(word)[0] ?? "");
  return letters.join("").toUpperCase() || "?";
}

const hostActionClassName =
  "inline-flex h-8 items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 text-xs font-semibold text-ink-200 transition-colors disabled:cursor-not-allowed disabled:opacity-50 [&>svg]:size-3.5";

interface PlayerListProps {
  lobby: ClientLobbyState;
  mutate: KeyedMutator<LobbyStateResponse>;
}

export function PlayerList({ lobby, mutate }: PlayerListProps) {
  const [pendingPlayerId, setPendingPlayerId] = useState<string | null>(null);
  const confirm = useConfirm();
  const playerId = lobby.me.id;
  const isHost = lobby.me.isHost;

  // Optimistically apply change before server reconciliation
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

  const handlePromote = async (target: ClientLobbyState["players"][number]) => {
    const confirmed = await confirm({
      message: `Are you sure you want to make ${target.name} the host? You will lose host privileges.`,
      confirmLabel: "Make Host",
      tone: "primary",
    });
    if (!confirmed) return;

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

  const handleKick = async (target: ClientLobbyState["players"][number]) => {
    const confirmed = await confirm({
      message: `Are you sure you want to kick ${target.name}?`,
      confirmLabel: "Kick",
    });
    if (!confirmed) return;

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

  const emptySeats = Math.max(0, MIN_PLAYERS - lobby.players.length);

  return (
    <Card title={`Players (${lobby.players.length})`} icon={<Users />}>
      <ul className="relative space-y-2">
        <AnimatePresence initial={false} mode="popLayout">
          {sortedPlayers.map((p) => {
            const isMe = p.id === playerId;
            const showHostActions = isHost && !p.isHost;
            return (
              <motion.li
                key={p.id}
                layout
                initial={{ opacity: 0, y: 10, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: -24, transition: { duration: 0.2 } }}
                transition={{ type: "spring", stiffness: 500, damping: 38 }}
                className={cn(
                  "flex flex-wrap items-center gap-x-3 gap-y-2.5 rounded-xl border p-2.5 pr-3",
                  isMe
                    ? "border-brass-400/25 bg-brass-400/[0.06]"
                    : "border-white/[0.06] bg-ink-800/70",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-xl font-display text-lg font-bold ring-1",
                    avatarTint(p.name),
                  )}
                >
                  {initials(p.name)}
                </span>

                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <span
                    className={cn(
                      "truncate font-semibold",
                      isMe ? "text-brass-200" : "text-ink-100",
                    )}
                  >
                    {p.name}
                  </span>
                  {isMe && (
                    <span className="shrink-0 text-sm text-ink-400">(You)</span>
                  )}
                  {p.isHost && (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-brass-400/15 px-1.5 py-0.5 font-mono text-[0.6875rem] font-bold tracking-[0.12em] text-brass-300 ring-1 ring-brass-400/30">
                      <Crown aria-hidden="true" className="size-3" />
                      HOST
                    </span>
                  )}
                </div>

                {showHostActions && (
                  <div className="flex shrink-0 gap-1.5 max-sm:basis-full max-sm:pl-13">
                    <button
                      type="button"
                      disabled={pendingPlayerId === p.id}
                      onClick={() => handlePromote(p)}
                      className={cn(
                        hostActionClassName,
                        "hover:border-brass-400/40 hover:bg-brass-400/10 hover:text-brass-300",
                      )}
                    >
                      <Crown aria-hidden="true" />
                      Make Host
                    </button>
                    <button
                      type="button"
                      disabled={pendingPlayerId === p.id}
                      onClick={() => handleKick(p)}
                      className={cn(
                        hostActionClassName,
                        "text-ink-300 hover:border-crimson-400/40 hover:bg-crimson-500/10 hover:text-crimson-300",
                      )}
                    >
                      <UserX aria-hidden="true" />
                      Kick
                    </button>
                  </div>
                )}
              </motion.li>
            );
          })}
        </AnimatePresence>

        {Array.from({ length: emptySeats }, (_, index) => (
          <li
            key={`empty-${index}`}
            aria-hidden="true"
            className="flex items-center gap-3 rounded-xl border border-dashed border-white/10 p-2.5"
          >
            <span className="flex size-10 items-center justify-center rounded-xl border border-dashed border-white/15 text-ink-500">
              <UserPlus className="size-4" />
            </span>
            <span className="h-2.5 w-24 animate-pulse-soft rounded-full bg-white/[0.06]" />
          </li>
        ))}
      </ul>
    </Card>
  );
}

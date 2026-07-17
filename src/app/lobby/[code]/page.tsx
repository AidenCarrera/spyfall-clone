"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import {
  getLobbyStateAction,
  leaveLobbyAction,
  startGameAction,
  resetGameAction,
  togglePauseAction,
} from "@/src/app/actions";
import { Card } from "@/src/components/Card";
import { Button } from "@/src/components/Button";
import { LobbyView } from "@/src/components/lobby/LobbyView";
import { GameView } from "@/src/components/game/GameView";
import { useGameTimer } from "@/src/hooks/useGameTimer";

export default function LobbyPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  const router = useRouter();
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const [isTabVisible, setIsTabVisible] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("visibilityState" in document))
      return;
    const handleVisibilityChange = () => {
      setIsTabVisible(document.visibilityState === "visible");
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const {
    data: lobbyData,
    error: lobbyError,
    mutate,
  } = useSWR(
    playerId && !isLeaving ? ["lobby", code, playerId] : null,
    ([, c, pid]) => getLobbyStateAction(c, pid),
    {
      refreshInterval: (latestData) => {
        const isKicked =
          lobbyError === "Player not found in lobby" ||
          latestData?.error === "Player not found in lobby";

        if (!isTabVisible || isLeaving || isKicked) {
          return 0;
        }

        const lobbyStatus = latestData?.lobby?.status;
        if (lobbyStatus === "IN_PROGRESS") {
          return 2000; // Poll every 2 seconds during active game
        }
        return 4000; // Poll every 4 seconds in lobby
      },
      revalidateOnFocus: true,
      dedupingInterval: 2000,
    },
  );

  const lobby = lobbyData?.lobby;
  const error = lobbyError || lobbyData?.error;
  const isLoading = !lobbyData && !lobbyError;
  const { timeLeft, isTimeUp } = useGameTimer(lobby);

  useEffect(() => {
    const storedPid = localStorage.getItem(`spyfall_pid_${code}`);
    if (!storedPid) {
      router.push(`/join?code=${code}`);
      return;
    }
    if (storedPid !== playerId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Hydrate browser-only local storage after mount.
      setPlayerId(storedPid);
    }
  }, [code, router, playerId]);

  const handleStartGame = async () => {
    if (!lobby) return;
    if (lobby.players.length === 3 && lobby.spyCount === 2) {
      if (
        !confirm(
          "Starting with 2 spies and only 3 players is not recommended. Are you sure you want to proceed?",
        )
      )
        return;
    }
    setIsStarting(true);
    try {
      await startGameAction(code, playerId!);
      mutate();
    } finally {
      setIsStarting(false);
    }
  };

  const handleLeave = async () => {
    if (!confirm("Are you sure you want to leave the lobby?")) return;
    setIsLeaving(true);
    if (playerId) {
      try {
        await leaveLobbyAction(code, playerId);
      } catch (e) {
        console.error("Error leaving lobby:", e);
      }
      localStorage.removeItem(`spyfall_pid_${code}`);
      router.push("/");
    }
  };

  const handleReset = async () => {
    if (!isTimeUp && !confirm("Are you sure you want to end the game early?"))
      return;
    setIsResetting(true);
    // Return to the lobby immediately while the server resets the game.
    await mutate(
      {
        lobby: {
          ...lobby!,
          status: "LOBBY",
          location: undefined,
          timerStartTime: undefined,
          timerAccumulated: undefined,
          isPaused: false,
          me: { ...lobby!.me, isSpy: undefined, role: undefined },
        },
      },
      { revalidate: false },
    );
    try {
      await resetGameAction(code, playerId!);
      mutate();
    } finally {
      setIsResetting(false);
    }
  };

  const handleTogglePause = async () => {
    if (!lobby) return;

    const now = Date.now();
    const newIsPaused = !lobby.isPaused;

    const updatedLobby = { ...lobby, isPaused: newIsPaused };

    if (newIsPaused) {
      const currentSegment = lobby.timerStartTime
        ? now - lobby.timerStartTime
        : 0;
      updatedLobby.timerAccumulated =
        (lobby.timerAccumulated ?? 0) + currentSegment;
      updatedLobby.timerStartTime = undefined;
    } else {
      updatedLobby.timerStartTime = now;
    }

    await mutate({ lobby: updatedLobby }, { revalidate: false });

    await togglePauseAction(code, playerId!);
    mutate();
  };

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        Loading...
      </main>
    );
  }

  if (error) {
    const isKicked = error === "Player not found in lobby";

    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <Card title={isKicked ? "Kicked" : "Error"}>
          <div className="flex flex-col items-center text-center space-y-4">
            {isKicked ? (
              <p className="text-slate-300">
                You have been kicked from the lobby by the host.
              </p>
            ) : (
              <p className="text-red-400">{error}</p>
            )}
            <Button
              onClick={() => {
                localStorage.removeItem(`spyfall_pid_${code}`);
                router.push("/");
              }}
              className="w-full"
            >
              Go Home
            </Button>
          </div>
        </Card>
      </main>
    );
  }

  if (!lobby) return null;

  if (lobby.status === "LOBBY") {
    return (
      <LobbyView
        code={code}
        lobby={lobby}
        playerId={playerId!}
        mutate={mutate}
        isStarting={isStarting}
        onStartGame={handleStartGame}
        onLeave={handleLeave}
      />
    );
  }

  return (
    <GameView
      lobby={lobby}
      timeLeft={timeLeft}
      isTimeUp={isTimeUp}
      onLeave={handleLeave}
      onTogglePause={handleTogglePause}
      isResetting={isResetting}
      onReset={handleReset}
    />
  );
}

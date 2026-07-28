"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import {
  leaveLobbyAction,
  startGameAction,
  resetGameAction,
  togglePauseAction,
} from "@/app/actions";
import { fetchLobbyState } from "@/lib/lobby-state";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { LobbyView } from "@/components/lobby/LobbyView";
import { GameView } from "@/components/game/GameView";
import { useGameTimer } from "@/hooks/useGameTimer";
import { normalizeLobbyCode } from "@/lib/lobby-code";
import { MAX_SPIES, MIN_PLAYERS } from "@/lib/game-rules";

const KICKED_ERROR = "Player not found in lobby";

export default function LobbyPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code: routeCode } = use(params);
  const code = normalizeLobbyCode(routeCode);
  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const [isTabVisible, setIsTabVisible] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
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
    !isLeaving ? ["lobby", code] : null,
    ([, c]) => fetchLobbyState(c),
    {
      refreshInterval: (latestData) => {
        const isKicked = latestData?.error === KICKED_ERROR;

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
  // `lobbyError` is a thrown value, so it is narrowed to a renderable string.
  const error: string | undefined = lobbyError
    ? "Lost connection to the lobby. Please try again."
    : lobbyData?.error;
  const isLoading = !lobbyData && !lobbyError;
  const { timeLeft, isTimeUp } = useGameTimer(lobby);

  useEffect(() => {
    if (lobbyData?.error === "Session not found") {
      router.replace(`/join?code=${code}`);
    }
  }, [code, lobbyData?.error, router]);

  const handleStartGame = async () => {
    if (!lobby) return;
    if (lobby.players.length === MIN_PLAYERS && lobby.spyCount === MAX_SPIES) {
      if (
        !confirm(
          `Starting with ${MAX_SPIES} spies and only ${MIN_PLAYERS} players is not recommended. Are you sure you want to proceed?`,
        )
      )
        return;
    }
    setIsStarting(true);
    try {
      await startGameAction(code);
      mutate();
    } finally {
      setIsStarting(false);
    }
  };

  const handleLeave = async () => {
    if (!confirm("Are you sure you want to leave the lobby?")) return;
    setIsLeaving(true);
    try {
      const result = await leaveLobbyAction(code);
      if (result.error) {
        setIsLeaving(false);
        return;
      }
      router.push("/");
    } catch (e) {
      console.error("Error leaving lobby:", e);
      setIsLeaving(false);
    }
  };

  const handleReset = async () => {
    if (!lobby) return;
    if (!isTimeUp && !confirm("Are you sure you want to end the game early?"))
      return;
    setIsResetting(true);
    // Return to the lobby immediately while the server resets the game.
    await mutate(
      {
        lobby: {
          ...lobby,
          status: "LOBBY",
          location: undefined,
          timerStartTime: undefined,
          timerAccumulated: undefined,
          isPaused: false,
          me: { ...lobby.me, isSpy: undefined, role: undefined },
        },
      },
      { revalidate: false },
    );
    try {
      await resetGameAction(code);
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

    await togglePauseAction(code);
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
    if (error === "Session not found") {
      return (
        <main className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
          Loading...
        </main>
      );
    }

    const isKicked = error === KICKED_ERROR;

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
        lobby={lobby}
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

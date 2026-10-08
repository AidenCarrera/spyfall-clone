"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { AnimatePresence, motion } from "motion/react";
import { TriangleAlert, UserX } from "lucide-react";
import {
  leaveLobbyAction,
  startGameAction,
  resetGameAction,
  togglePauseAction,
} from "@/app/actions";
import { fetchLobbyState } from "@/lib/lobby-state";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { useConfirm } from "@/components/ConfirmDialog";
import { LoadingScreen } from "@/components/LoadingScreen";
import { LobbyView } from "@/components/lobby/LobbyView";
import { GameView } from "@/components/game/GameView";
import { useGameTimer } from "@/hooks/useGameTimer";
import { MAX_SPIES, MIN_PLAYERS } from "@/lib/game-rules";

const KICKED_ERROR = "Player not found in lobby";

export function LobbyClient({ code }: { code: string }) {
  const router = useRouter();
  const confirm = useConfirm();
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
          return 2000;
        }
        return 4000;
      },
      revalidateOnFocus: true,
      dedupingInterval: 2000,
    },
  );

  const lobby = lobbyData?.lobby;
  const error: string | undefined = lobbyError
    ? "Lost connection to the lobby. Please try again."
    : lobbyData?.error;
  const isLoading = !lobbyData && !lobbyError;
  const { timeLeft, isTimeUp, secondsRemaining } = useGameTimer(lobby);

  useEffect(() => {
    if (lobbyData?.error === "Session not found") {
      router.replace(`/join?code=${code}`);
    }
  }, [code, lobbyData?.error, router]);

  const handleStartGame = async () => {
    if (!lobby) return;
    if (lobby.players.length === MIN_PLAYERS && lobby.spyCount === MAX_SPIES) {
      const confirmed = await confirm({
        message: `Starting with ${MAX_SPIES} spies and only ${MIN_PLAYERS} players is not recommended. Are you sure you want to proceed?`,
        confirmLabel: "Start Game",
        tone: "primary",
      });
      if (!confirmed) return;
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
    const confirmed = await confirm({
      message: "Are you sure you want to leave the lobby?",
      confirmLabel: "Leave",
    });
    if (!confirmed) return;
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
    if (
      !isTimeUp &&
      !(await confirm({
        message: "Are you sure you want to end the game early?",
        confirmLabel: "End Game",
      }))
    )
      return;
    setIsResetting(true);
    // Optimistically return to lobby state while resetting
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
    return <LoadingScreen />;
  }

  if (error) {
    if (error === "Session not found") {
      return <LoadingScreen />;
    }

    const isKicked = error === KICKED_ERROR;

    return (
      <main className="flex min-h-dvh items-center justify-center px-4">
        <Card className="w-full max-w-sm animate-rise-in text-center">
          <div className="flex flex-col items-center">
            <span
              aria-hidden="true"
              className="flex size-16 items-center justify-center rounded-2xl bg-crimson-500/12 text-crimson-400 ring-1 ring-crimson-400/30"
            >
              {isKicked ? (
                <UserX className="size-8" />
              ) : (
                <TriangleAlert className="size-8" />
              )}
            </span>
            <h1 className="mt-5 font-display text-4xl font-extrabold uppercase tracking-[0.05em] text-paper-50">
              {isKicked ? "Kicked" : "Error"}
            </h1>
            {isKicked ? (
              <p className="mt-3 text-ink-300">
                You have been kicked from the lobby by the host.
              </p>
            ) : (
              <p role="alert" className="mt-3 text-crimson-300">
                {error}
              </p>
            )}
            <Button
              onClick={() => {
                router.push("/");
              }}
              fullWidth
              className="mt-7"
            >
              Go Home
            </Button>
          </div>
        </Card>
      </main>
    );
  }

  if (!lobby) return null;

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={lobby.status === "LOBBY" ? "lobby" : "game"}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22 }}
      >
        {lobby.status === "LOBBY" ? (
          <LobbyView
            lobby={lobby}
            mutate={mutate}
            isStarting={isStarting}
            onStartGame={handleStartGame}
            onLeave={handleLeave}
          />
        ) : (
          <GameView
            lobby={lobby}
            timeLeft={timeLeft}
            isTimeUp={isTimeUp}
            secondsRemaining={secondsRemaining}
            onLeave={handleLeave}
            onTogglePause={handleTogglePause}
            isResetting={isResetting}
            onReset={handleReset}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}

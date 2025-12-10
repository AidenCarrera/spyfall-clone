"use client";

import { useState, useEffect, useRef, use } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import {
  getLobbyStateAction,
  leaveLobbyAction,
  startGameAction,
  resetGameAction,
  togglePauseAction,
} from "@/app/actions";
import { Card } from "@/app/components/Card";
import { Button } from "@/app/components/Button";
import { LobbyView } from "@/app/components/lobby/LobbyView";
import { GameView } from "@/app/components/game/GameView";

export default function LobbyPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  const router = useRouter();
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  // Timer state
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);

  // Reference to store the time difference between client and server
  // Ensures timer accuracy regardless of client system clock deviations
  const serverOffsetRef = useRef<number>(0);
  const isOffsetSet = useRef(false);

  // SWR Data Fetching
  // Configured with a 2-second refresh interval to optimize Redis command usage
  const {
    data: lobbyData,
    error: lobbyError,
    mutate,
  } = useSWR(
    playerId ? ["lobby", code, playerId] : null,
    ([, c, pid]) => getLobbyStateAction(c, pid),
    {
      refreshInterval: 2000,
      revalidateOnFocus: true,
      dedupingInterval: 1000,
    }
  );

  const lobby = lobbyData?.lobby;
  const error = lobbyError || lobbyData?.error;
  const isLoading = !lobbyData && !lobbyError;

  // Initial setup (Hydration)
  useEffect(() => {
    const storedPid = localStorage.getItem(`spyfall_pid_${code}`);
    if (!storedPid) {
      router.push(`/join?code=${code}`);
      return;
    }
    if (storedPid !== playerId) {
      // Sync state with session storage
      // eslint-disable-next-line
      setPlayerId(storedPid);
    }
  }, [code, router, playerId]);

  // Handle side effects of lobby state changes
  const [prevStatus, setPrevStatus] = useState(lobby?.status);

  if (lobby && prevStatus !== lobby.status) {
    setPrevStatus(lobby.status);
    if (lobby.status === "LOBBY" && isRevealed) {
      setIsRevealed(false);
    }
  }

  // Synchronize Client-Server Clock Offset
  useEffect(() => {
    if (!lobby?.serverTime) return;

    // Calculate offset: Server Time - Client Time
    const now = Date.now();
    const newOffset = lobby.serverTime - now;

    // Update offset only on initialization or if significant drift (>1000ms) is detected.
    // This threshold prevents minor network jitter from causing unnecessary updates.
    if (
      !isOffsetSet.current ||
      Math.abs(serverOffsetRef.current - newOffset) > 1000
    ) {
      serverOffsetRef.current = newOffset;
      isOffsetSet.current = true;
    }
  }, [lobby?.serverTime]);

  // High-Frequency Timer Update
  // Updates the UI every 100ms for smooth rendering without additional data fetching.
  // Time is calculated using absolute timestamps: (Start + Duration) - (Now + Offset)
  useEffect(() => {
    if (lobby?.status !== "IN_PROGRESS" || !lobby?.timerDuration) {
      return;
    }

    const tick = () => {
      // Paused State: Display static remaining time based on accumulated duration
      if (lobby.isPaused) {
        const totalDurationMs = lobby.timerDuration! * 60 * 1000;
        const elapsedMs = lobby.timerAccumulated || 0;
        const remaining = Math.max(
          0,
          Math.ceil((totalDurationMs - elapsedMs) / 1000)
        );
        setSecondsRemaining(remaining);
        return;
      }

      // Active State: Calculate remaining time using synchronized server time
      if (lobby.timerStartTime) {
        const now = Date.now();
        const adjustedNow = now + serverOffsetRef.current;

        // Calculate elapsed time: (Current - Start) + Accumulated
        const currentSegment = adjustedNow - lobby.timerStartTime;
        const totalElapsed = currentSegment + (lobby.timerAccumulated || 0);

        const totalDurationMs = lobby.timerDuration! * 60 * 1000;
        const remainingMs = totalDurationMs - totalElapsed;

        setSecondsRemaining(Math.max(0, Math.ceil(remainingMs / 1000)));
      }
    };

    // Initial update
    tick();

    // Update UI every 100ms to prevent visual skipping of seconds
    const interval = setInterval(tick, 100);
    return () => clearInterval(interval);
  }, [
    lobby?.status,
    lobby?.timerDuration,
    lobby?.timerStartTime,
    lobby?.isPaused,
    lobby?.timerAccumulated,
  ]);

  // Derived display state
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const isGameInProgress = lobby?.status === "IN_PROGRESS";
  const timeLeft =
    isGameInProgress && secondsRemaining !== null
      ? formatTime(secondsRemaining)
      : "";
  const isTimeUp =
    isGameInProgress && secondsRemaining !== null && secondsRemaining === 0;

  const handleStartGame = async () => {
    if (!lobby) return;
    if (lobby.players.length === 3 && (lobby.spyCount || 1) === 2) {
      if (
        !confirm(
          "Starting with 2 spies and only 3 players is not recommended. Are you sure you want to proceed?"
        )
      )
        return;
    }
    setIsRevealed(false);
    await startGameAction(code);
    mutate();
  };

  const handleLeave = async () => {
    if (!confirm("Are you sure you want to leave the game?")) return;
    if (playerId) {
      await leaveLobbyAction(code, playerId);
      localStorage.removeItem(`spyfall_pid_${code}`);
      router.push("/");
    }
  };

  const handleReset = async () => {
    if (!isTimeUp && !confirm("Are you sure you want to end the game early?"))
      return;
    setIsRevealed(false);
    await resetGameAction(code);
    mutate();
  };

  const handleTogglePause = async () => {
    if (!lobby) return;

    // Optimistic update
    const now = Date.now();
    const newIsPaused = !lobby.isPaused;

    const updatedLobby = { ...lobby, isPaused: newIsPaused };

    if (newIsPaused) {
      // Pausing
      const currentSegment = lobby.timerStartTime
        ? now - lobby.timerStartTime
        : 0;
      updatedLobby.timerAccumulated =
        (lobby.timerAccumulated || 0) + currentSegment;
      updatedLobby.timerStartTime = undefined;
    } else {
      // Resuming
      updatedLobby.timerStartTime = now;
    }

    // Apply optimistic update
    await mutate({ lobby: updatedLobby }, { revalidate: false });

    await togglePauseAction(code);
    mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <Card title="Error">
          <p className="text-red-400 mb-4">{error}</p>
          <Button onClick={() => router.push("/")}>Go Home</Button>
        </Card>
      </div>
    );
  }

  if (!lobby) return null;

  // LOBBY VIEW
  if (lobby.status === "LOBBY") {
    return (
      <LobbyView
        code={code}
        lobby={lobby}
        playerId={playerId!}
        mutate={mutate}
        onStartGame={handleStartGame}
        onLeave={handleLeave}
      />
    );
  }

  // GAME VIEW
  return (
    <GameView
      lobby={lobby}
      isRevealed={isRevealed}
      setIsRevealed={setIsRevealed}
      timeLeft={timeLeft}
      isTimeUp={isTimeUp}
      onTogglePause={handleTogglePause}
      onReset={handleReset}
    />
  );
}

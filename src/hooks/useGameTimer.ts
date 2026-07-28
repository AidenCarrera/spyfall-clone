"use client";

import { useEffect, useRef, useState } from "react";
import type { ClientLobbyState } from "@/lib/lobby-state";

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
}

export function useGameTimer(lobby?: ClientLobbyState) {
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);
  const serverOffsetRef = useRef<number | null>(null);

  // Align ticks with server time while ignoring minor network jitter.
  useEffect(() => {
    if (!lobby?.serverTime) return;

    const newOffset = lobby.serverTime - Date.now();
    if (
      serverOffsetRef.current === null ||
      Math.abs(serverOffsetRef.current - newOffset) > 1000
    ) {
      serverOffsetRef.current = newOffset;
    }
  }, [lobby?.serverTime]);

  useEffect(() => {
    if (lobby?.status !== "IN_PROGRESS") return;

    const tick = () => {
      const totalDurationMs = lobby.timerDuration * 60 * 1000;
      const accumulatedMs = lobby.timerAccumulated ?? 0;

      let elapsedMs;
      if (lobby.isPaused) {
        elapsedMs = accumulatedMs;
      } else if (lobby.timerStartTime) {
        const adjustedNow = Date.now() + (serverOffsetRef.current ?? 0);
        elapsedMs = adjustedNow - lobby.timerStartTime + accumulatedMs;
      } else {
        return;
      }

      setSecondsRemaining(
        Math.max(0, Math.ceil((totalDurationMs - elapsedMs) / 1000)),
      );
    };

    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [
    lobby?.status,
    lobby?.timerDuration,
    lobby?.timerStartTime,
    lobby?.isPaused,
    lobby?.timerAccumulated,
  ]);

  const isGameInProgress = lobby?.status === "IN_PROGRESS";
  const isTimeUp = isGameInProgress && secondsRemaining === 0;
  const timeLeft =
    isGameInProgress && secondsRemaining !== null
      ? formatTime(secondsRemaining)
      : "";

  return { timeLeft, isTimeUp };
}

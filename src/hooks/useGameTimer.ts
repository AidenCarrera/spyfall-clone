"use client";

import { useEffect, useRef, useState } from "react";
import type { ClientLobbyState } from "@/src/app/actions";

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
}

export function useGameTimer(lobby?: ClientLobbyState) {
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);
  const serverOffsetRef = useRef(0);
  const isOffsetSet = useRef(false);

  useEffect(() => {
    if (!lobby?.serverTime) return;

    const newOffset = lobby.serverTime - Date.now();
    if (
      !isOffsetSet.current ||
      Math.abs(serverOffsetRef.current - newOffset) > 1000
    ) {
      serverOffsetRef.current = newOffset;
      isOffsetSet.current = true;
    }
  }, [lobby?.serverTime]);

  useEffect(() => {
    if (lobby?.status !== "IN_PROGRESS") return;

    const tick = () => {
      const totalDurationMs = lobby.timerDuration * 60 * 1000;

      if (lobby.isPaused) {
        const elapsedMs = lobby.timerAccumulated ?? 0;
        setSecondsRemaining(
          Math.max(0, Math.ceil((totalDurationMs - elapsedMs) / 1000)),
        );
        return;
      }

      if (lobby.timerStartTime) {
        const adjustedNow = Date.now() + serverOffsetRef.current;
        const currentSegment = adjustedNow - lobby.timerStartTime;
        const totalElapsed = currentSegment + (lobby.timerAccumulated ?? 0);
        setSecondsRemaining(
          Math.max(0, Math.ceil((totalDurationMs - totalElapsed) / 1000)),
        );
      }
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
  const isTimeUp =
    isGameInProgress && secondsRemaining !== null && secondsRemaining === 0;
  const timeLeft =
    isGameInProgress && secondsRemaining !== null
      ? formatTime(secondsRemaining)
      : "";

  return { timeLeft, isTimeUp };
}

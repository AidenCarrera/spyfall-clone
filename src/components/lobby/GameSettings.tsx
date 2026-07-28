"use client";

import { useState } from "react";
import Image from "next/image";
import { Settings } from "lucide-react";
import type { KeyedMutator } from "swr";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { EditLocationsModal } from "@/components/EditLocationsModal";
import { updateSettingsAction } from "@/app/actions";
import type { ClientLobbyState, LobbyStateResponse } from "@/lib/lobby-state";
import {
  MAX_SPIES,
  MAX_TIMER_MINUTES,
  MIN_SPIES,
  MIN_TIMER_MINUTES,
} from "@/lib/game-rules";

const SPY_COUNT_OPTIONS = Array.from(
  { length: MAX_SPIES - MIN_SPIES + 1 },
  (_, index) => MIN_SPIES + index,
);

function SpyIcons({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: count }, (_, index) => (
        <Image
          key={index}
          src="/Spy.png"
          alt="Spy"
          width={24}
          height={24}
          className="w-6 h-6"
        />
      ))}
    </div>
  );
}

interface GameSettingsProps {
  lobby: ClientLobbyState;
  mutate: KeyedMutator<LobbyStateResponse>;
}

export function GameSettings({ lobby, mutate }: GameSettingsProps) {
  const [isEditLocationsOpen, setIsEditLocationsOpen] = useState(false);
  const isHost = lobby.me.isHost;
  const updateSettings = async (
    settings: Parameters<typeof updateSettingsAction>[1],
  ) => {
    await mutate(
      (current) =>
        current?.lobby
          ? {
              ...current,
              lobby: { ...current.lobby, ...settings },
            }
          : current,
      { revalidate: false },
    );
    await updateSettingsAction(lobby.code, settings);
    await mutate();
  };

  return (
    <Card title="Game Settings">
      <div className="flex items-center justify-between">
        <label className="text-slate-400">Timer Duration (mins)</label>
        {isHost ? (
          <div className="flex items-center gap-1">
            <button
              onClick={() =>
                updateSettings({
                  timerDuration: Math.max(
                    MIN_TIMER_MINUTES,
                    lobby.timerDuration - 1,
                  ),
                })
              }
              className="w-8 h-8 bg-slate-700 rounded hover:bg-slate-600 flex items-center justify-center text-xl font-bold"
            >
              -
            </button>
            <span className="w-8 text-center font-mono text-xl text-blue-400">
              {lobby.timerDuration}
            </span>
            <button
              onClick={() =>
                updateSettings({
                  timerDuration: Math.min(
                    MAX_TIMER_MINUTES,
                    lobby.timerDuration + 1,
                  ),
                })
              }
              className="w-8 h-8 bg-slate-700 rounded hover:bg-slate-600 flex items-center justify-center text-xl font-bold"
            >
              +
            </button>
          </div>
        ) : (
          <span className="font-mono text-xl text-blue-400">
            {lobby.timerDuration} min
          </span>
        )}
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700/50">
        <label className="text-slate-400">Spies</label>
        <div className="flex items-center gap-2">
          {isHost ? (
            SPY_COUNT_OPTIONS.map((count) => {
              const isSelected = lobby.spyCount === count;
              return (
                <button
                  key={count}
                  onClick={() => updateSettings({ spyCount: count })}
                  aria-pressed={isSelected}
                  aria-label={`${count} ${count === 1 ? "spy" : "spies"}`}
                  className={`flex items-center gap-4 p-2 rounded transition-colors hover:bg-slate-800 cursor-pointer ${
                    !isSelected ? "opacity-50" : ""
                  }`}
                >
                  <div
                    className={`w-3 h-3 rounded-full border border-blue-400 transition-colors ${
                      isSelected ? "bg-blue-400" : "bg-transparent"
                    }`}
                  />
                  <SpyIcons count={count} />
                </button>
              );
            })
          ) : (
            <div className="px-2 py-1">
              <SpyIcons count={lobby.spyCount} />
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-slate-700/50">
        <div className="flex items-center justify-between">
          <label className="text-slate-400">Locations</label>
          <span
            className={
              isHost
                ? "text-xs text-blue-400 font-mono"
                : "font-mono text-xl text-blue-400"
            }
          >
            {lobby.selectedLocations.length} selected
          </span>
        </div>

        {isHost && (
          <>
            <Button
              variant="secondary"
              onClick={() => setIsEditLocationsOpen(true)}
              className="w-full flex items-center justify-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Edit Locations
            </Button>

            <EditLocationsModal
              isOpen={isEditLocationsOpen}
              onClose={() => setIsEditLocationsOpen(false)}
              selectedLocations={lobby.selectedLocations}
              onUpdate={(selectedLocations) =>
                updateSettings({ selectedLocations })
              }
            />
          </>
        )}
      </div>
    </Card>
  );
}

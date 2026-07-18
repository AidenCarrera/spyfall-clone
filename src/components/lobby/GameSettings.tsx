"use client";

import { useState } from "react";
import Image from "next/image";
import { Settings } from "lucide-react";
import type { KeyedMutator } from "swr";
import { Card } from "@/src/components/Card";
import { Button } from "@/src/components/Button";
import { EditLocationsModal } from "@/src/components/EditLocationsModal";
import { updateSettingsAction, type ClientLobbyState } from "@/src/app/actions";
import gameData from "@/src/lib/game-data.json";

interface GameSettingsProps {
  code: string;
  lobby: ClientLobbyState;
  isHost: boolean;
  mutate: KeyedMutator<{ lobby?: ClientLobbyState; error?: string }>;
}

export function GameSettings({
  code,
  lobby,
  isHost,
  mutate,
}: GameSettingsProps) {
  const [isEditLocationsOpen, setIsEditLocationsOpen] = useState(false);
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
    await updateSettingsAction(code, settings);
    await mutate();
  };

  return (
    <Card title="Game Settings">
      <div className="flex items-center justify-between">
        <label className="text-slate-400">Timer Duration (mins)</label>
        {isHost ? (
          <div className="flex items-center gap-1">
            <button
              onClick={async () => {
                const newDuration = Math.max(1, lobby.timerDuration - 1);
                await updateSettings({
                  timerDuration: newDuration,
                });
              }}
              className="w-8 h-8 bg-slate-700 rounded hover:bg-slate-600 flex items-center justify-center text-xl font-bold"
            >
              -
            </button>
            <span className="w-8 text-center font-mono text-xl text-blue-400">
              {lobby.timerDuration}
            </span>
            <button
              onClick={async () => {
                const newDuration = Math.min(60, lobby.timerDuration + 1);
                await updateSettings({
                  timerDuration: newDuration,
                });
              }}
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
            ([1, 2] as const).map((count) => {
              const isSelected = lobby.spyCount === count;
              return (
                <button
                  key={count}
                  onClick={async () => {
                    await updateSettings({
                      spyCount: count,
                    });
                  }}
                  className={`flex items-center gap-4 p-2 rounded transition-colors hover:bg-slate-800 cursor-pointer ${
                    !isSelected ? "opacity-50" : ""
                  }`}
                >
                  <div
                    className={`w-3 h-3 rounded-full border border-blue-400 transition-colors ${
                      isSelected ? "bg-blue-400" : "bg-transparent"
                    }`}
                  />
                  <div className="flex items-center gap-1">
                    {Array.from({ length: count }).map((_, i) => (
                      <Image
                        key={i}
                        src="/Spy.png"
                        alt="Spy"
                        width={24}
                        height={24}
                        className="w-6 h-6"
                      />
                    ))}
                  </div>
                </button>
              );
            })
          ) : (
            <div className="flex items-center gap-1 px-2 py-1">
              {Array.from({ length: lobby.spyCount }).map((_, i) => (
                <Image
                  key={i}
                  src="/Spy.png"
                  alt="Spy"
                  width={24}
                  height={24}
                  className="w-6 h-6"
                />
              ))}
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
              gameData={
                gameData as Record<
                  string,
                  { location: string; roles: string[] }[]
                >
              }
              selectedLocations={lobby.selectedLocations}
              onUpdate={async (newSelectedLocations) => {
                await updateSettings({
                  selectedLocations: newSelectedLocations,
                });
              }}
            />
          </>
        )}
      </div>
    </Card>
  );
}

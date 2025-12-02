"use client";

import { useState } from "react";
import Image from "next/image";
import { Settings } from "lucide-react";
import { KeyedMutator } from "swr";
import { Card } from "@/app/components/Card";
import { Button } from "@/app/components/Button";
import { EditLocationsModal } from "@/app/components/EditLocationsModal";
import { ClientLobbyState, updateSettingsAction } from "@/app/actions";
import gameData from "@/app/lib/game-data.json";

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

  return (
    <Card title="Game Settings">
      {/* Timer Duration */}
      <div className="flex items-center justify-between">
        <label className="text-slate-400">Timer Duration (mins)</label>
        {isHost ? (
          <div className="flex items-center gap-1">
            <button
              onClick={async () => {
                const newDuration = Math.max(1, (lobby.timerDuration || 8) - 1);
                // Optimistic update
                await mutate(
                  { lobby: { ...lobby, timerDuration: newDuration } },
                  { revalidate: false }
                );
                await updateSettingsAction(code, {
                  timerDuration: newDuration,
                });
                mutate();
              }}
              className="w-8 h-8 bg-slate-700 rounded hover:bg-slate-600 flex items-center justify-center text-xl font-bold"
            >
              -
            </button>
            <span className="w-8 text-center font-mono text-xl text-blue-400">
              {lobby.timerDuration || 8}
            </span>
            <button
              onClick={async () => {
                const newDuration = Math.min(
                  60,
                  (lobby.timerDuration || 8) + 1
                );
                // Optimistic update
                await mutate(
                  { lobby: { ...lobby, timerDuration: newDuration } },
                  { revalidate: false }
                );
                await updateSettingsAction(code, {
                  timerDuration: newDuration,
                });
                mutate();
              }}
              className="w-8 h-8 bg-slate-700 rounded hover:bg-slate-600 flex items-center justify-center text-xl font-bold"
            >
              +
            </button>
          </div>
        ) : (
          <span className="font-mono text-xl text-blue-400">
            {lobby.timerDuration || 8} min
          </span>
        )}
      </div>

      {/* Spies */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700/50">
        <label className="text-slate-400">Spies</label>
        <div className="flex items-center gap-2">
          {isHost ? (
            [1, 2].map((count) => {
              const isSelected = (lobby.spyCount || 1) === count;
              return (
                <button
                  key={count}
                  onClick={async () => {
                    // Optimistic update
                    await mutate(
                      { lobby: { ...lobby, spyCount: count } },
                      { revalidate: false }
                    );
                    await updateSettingsAction(code, { spyCount: count });
                    mutate();
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
              {Array.from({ length: lobby.spyCount || 1 }).map((_, i) => (
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

      {/* Locations */}
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
            {(lobby.selectedLocations || []).length} selected
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
              selectedLocations={lobby.selectedLocations || []}
              onUpdate={async (newSelectedLocations) => {
                // Optimistic update
                await mutate(
                  {
                    lobby: {
                      ...lobby,
                      selectedLocations: newSelectedLocations,
                    },
                  },
                  { revalidate: false }
                );

                await updateSettingsAction(code, {
                  selectedLocations: newSelectedLocations,
                });
                mutate();
              }}
            />
          </>
        )}
      </div>
    </Card>
  );
}

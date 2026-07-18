"use client";

import { useState } from "react";
import type { ClientLobbyState } from "@/src/app/actions";
import gameData from "@/src/lib/game-data.json";

interface LocationsReferenceProps {
  lobby: ClientLobbyState;
  isRevealed: boolean;
}

export function LocationsReference({
  lobby,
  isRevealed,
}: LocationsReferenceProps) {
  const [crossedOff, setCrossedOff] = useState<Set<string>>(() => new Set());

  const toggleLocation = (location: string) => {
    setCrossedOff((current) => {
      const next = new Set(current);
      if (next.has(location)) next.delete(location);
      else next.add(location);
      return next;
    });
  };

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold text-slate-300 px-1">
        Locations Reference
      </h3>
      <div className="grid grid-cols-2 gap-1">
        {Object.entries(gameData)
          .flatMap(([, locations]) => locations)
          .filter((loc) => lobby.selectedLocations.includes(loc.location))
          .sort((a, b) => a.location.localeCompare(b.location))
          .map((loc) => {
            const isCrossedOff = crossedOff.has(loc.location);
            const isCurrentLocation =
              lobby.location === loc.location && isRevealed && !lobby.me.isSpy;

            return (
              <button
                type="button"
                key={loc.location}
                aria-pressed={isCrossedOff}
                className={`cursor-pointer select-none rounded p-2 text-center text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
                  isCrossedOff
                    ? "bg-black opacity-50 line-through"
                    : isCurrentLocation
                      ? "border border-blue-500/30 bg-blue-900/30 text-blue-200"
                      : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                }`}
                onClick={() => toggleLocation(loc.location)}
              >
                {loc.location}
              </button>
            );
          })}
      </div>
    </div>
  );
}

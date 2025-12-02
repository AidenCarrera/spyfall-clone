"use client";

import { ClientLobbyState } from "@/app/actions";
import gameData from "@/app/lib/game-data.json";

interface LocationsReferenceProps {
  lobby: ClientLobbyState;
  isRevealed: boolean;
}

export function LocationsReference({
  lobby,
  isRevealed,
}: LocationsReferenceProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold text-slate-300 px-1">
        Locations Reference
      </h3>
      <div className="grid grid-cols-2 gap-1">
        {Object.entries(gameData)
          .flatMap(([, locations]) => locations)
          .filter((loc) =>
            (lobby.selectedLocations || []).includes(loc.location)
          )
          .sort((a, b) => a.location.localeCompare(b.location))
          .map((loc) => (
            <div
              key={loc.location}
              className={`p-2 rounded text-sm text-center transition-colors cursor-pointer select-none
                            ${
                              lobby.location === loc.location &&
                              isRevealed &&
                              !lobby.isSpy
                                ? "bg-blue-900/30 text-blue-200 border border-blue-500/30"
                                : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                            }`}
              onClick={(e) => {
                // Simple toggle for crossing off
                e.currentTarget.classList.toggle("line-through");
                e.currentTarget.classList.toggle("opacity-50");
                e.currentTarget.classList.toggle("bg-black");
              }}
            >
              {loc.location}
            </div>
          ))}
      </div>
    </div>
  );
}

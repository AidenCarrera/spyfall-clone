"use client";

import { useMemo, useState } from "react";
import type { ClientLobbyState } from "@/app/actions";
import { ALL_LOCATIONS } from "@/lib/locations";

interface LocationsReferenceProps {
  lobby: ClientLobbyState;
  isRevealed: boolean;
}

export function LocationsReference({
  lobby,
  isRevealed,
}: LocationsReferenceProps) {
  const [crossedOff, setCrossedOff] = useState<Set<string>>(() => new Set());

  // ALL_LOCATIONS is already sorted by name, so filtering preserves that order.
  const locationsInPlay = useMemo(() => {
    const selected = new Set(lobby.selectedLocations);
    return ALL_LOCATIONS.filter((loc) => selected.has(loc.location));
  }, [lobby.selectedLocations]);

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
        {locationsInPlay.map((loc) => {
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
                  ? // Deliberately low-contrast: a crossed-off tile should read
                    // as untouched to anyone glancing at the screen.
                    "bg-slate-800 text-slate-500 line-through decoration-slate-500/50 hover:bg-slate-700"
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

"use client";

import { useMemo, useState } from "react";
import { MapPinned } from "lucide-react";
import type { ClientLobbyState } from "@/lib/lobby-state";
import { ALL_LOCATIONS } from "@/lib/locations";
import { cn } from "@/lib/ui";

interface LocationsReferenceProps {
  lobby: ClientLobbyState;
}

export function LocationsReference({ lobby }: LocationsReferenceProps) {
  const [crossedOff, setCrossedOff] = useState<Set<string>>(() => new Set());

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
    <section
      aria-labelledby="locations-reference-heading"
      className="space-y-4"
    >
      <h2
        id="locations-reference-heading"
        className="flex items-center gap-2.5 px-1 font-display text-2xl font-bold uppercase tracking-[0.05em] text-ink-100"
      >
        <MapPinned aria-hidden="true" className="size-5 text-brass-400" />
        Locations Reference
      </h2>
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 sm:gap-2">
        {locationsInPlay.map((loc) => {
          const isCrossedOff = crossedOff.has(loc.location);

          return (
            <button
              type="button"
              key={loc.location}
              aria-pressed={isCrossedOff}
              className={cn(
                "min-h-11 select-none rounded-lg border border-white/[0.06] px-2 py-2 text-center text-sm leading-tight transition-[background-color,border-color,color,transform] duration-150 hover:border-white/15 hover:bg-ink-700 active:scale-[0.96]",
                isCrossedOff
                  ? "bg-ink-800/80 text-ink-400 line-through decoration-ink-400/60"
                  : "bg-ink-800/80 text-ink-300",
              )}
              onClick={() => toggleLocation(loc.location)}
            >
              {loc.location}
            </button>
          );
        })}
      </div>
    </section>
  );
}

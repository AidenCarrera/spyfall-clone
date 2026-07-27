import gameData from "./game-data.json";

export interface LocationEntry {
  location: string;
  roles: string[];
}

/** Location packs (Spyfall 1 and 2) keyed by pack name. */
export const LOCATION_SETS: Record<string, LocationEntry[]> = gameData;

export const ALL_LOCATIONS: LocationEntry[] = Object.values(LOCATION_SETS)
  .flat()
  .sort((a, b) => a.location.localeCompare(b.location));

export const ALL_LOCATION_NAMES: ReadonlySet<string> = new Set(
  ALL_LOCATIONS.map((entry) => entry.location),
);

/** Locations a freshly created lobby starts with. */
export const DEFAULT_LOCATION_NAMES: string[] = gameData.spyfall1.map(
  (entry) => entry.location,
);

export function findLocation(
  name: string | undefined,
): LocationEntry | undefined {
  return ALL_LOCATIONS.find((entry) => entry.location === name);
}

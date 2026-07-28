// The lobby shape sent to the browser, plus the client-side fetcher for it.
// Deliberately free of server imports (the `GameStatus` import is type-only and
// erased at compile time) so client components can import from here safely.
import type { GameStatus } from "./store";

export interface ClientPlayer {
  id: string;
  name: string;
  isHost: boolean;
  role?: string;
  isSpy?: boolean;
}

export interface ClientLobbyState {
  code: string;
  players: Pick<ClientPlayer, "name" | "isHost" | "id">[];
  status: GameStatus;
  me: ClientPlayer;
  location?: string;
  timerStartTime?: number;
  timerAccumulated?: number;
  isPaused: boolean;
  timerDuration: number;
  spyCount: number;
  selectedLocations: string[];
  serverTime: number;
}

export interface LobbyStateResponse {
  lobby?: ClientLobbyState;
  error?: string;
}

/**
 * Reads lobby state from the API route. A non-OK response still carries a
 * `LobbyStateResponse` body, so callers inspect `error` rather than catching.
 */
export async function fetchLobbyState(
  code: string,
): Promise<LobbyStateResponse> {
  const response = await fetch(`/api/lobby/${encodeURIComponent(code)}`, {
    cache: "no-store",
  });
  return (await response.json()) as LobbyStateResponse;
}

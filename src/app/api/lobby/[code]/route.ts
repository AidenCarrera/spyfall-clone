import { NextResponse } from "next/server";
import { store } from "@/lib/store";
import { LOBBY_CODE_PATTERN, normalizeLobbyCode } from "@/lib/lobby-code";
import { getSessionTokenHash } from "@/lib/session";
import type { ClientLobbyState, LobbyStateResponse } from "@/lib/lobby-state";

// Polled by the lobby UI, so it must always reflect live Redis state.
export const dynamic = "force-dynamic";

function lobbyStateResponse(body: LobbyStateResponse, status: number) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await params;
    const normalizedCode = normalizeLobbyCode(code);
    if (!LOBBY_CODE_PATTERN.test(normalizedCode)) {
      return lobbyStateResponse({ error: "Invalid lobby code" }, 400);
    }

    const sessionTokenHash = await getSessionTokenHash(normalizedCode);
    if (!sessionTokenHash) {
      return lobbyStateResponse({ error: "Session not found" }, 401);
    }

    const sessionResult = await store.getLobbyForSession(
      normalizedCode,
      sessionTokenHash,
    );
    if ("error" in sessionResult) {
      return sessionResult.error === "not_found"
        ? lobbyStateResponse({ error: "Lobby not found" }, 404)
        : lobbyStateResponse({ error: "Player not found in lobby" }, 403);
    }

    const { lobby, player: me } = sessionResult;
    const clientLobby: ClientLobbyState = {
      code: lobby.code,
      players: lobby.players.map((player) => ({
        name: player.name,
        isHost: player.isHost,
        id: player.id,
      })),
      status: lobby.status,
      me: {
        id: me.id,
        name: me.name,
        isHost: me.isHost,
        role: me.role,
        isSpy: me.isSpy,
      },
      timerStartTime: lobby.timerStartTime,
      timerAccumulated: lobby.timerAccumulated,
      isPaused: lobby.isPaused,
      timerDuration: lobby.settings.timerDuration,
      spyCount: lobby.settings.spyCount,
      selectedLocations: lobby.settings.selectedLocations,
      serverTime: Date.now(),
    };

    // The spy must never receive the location, even though they are sent the
    // candidate list for the reference grid.
    if (lobby.status === "IN_PROGRESS" && !me.isSpy) {
      clientLobby.location = lobby.location;
    }

    return lobbyStateResponse({ lobby: clientLobby }, 200);
  } catch (error) {
    console.error("GET /api/lobby/[code] error:", error);
    return lobbyStateResponse({ error: "Failed to fetch lobby state." }, 500);
  }
}

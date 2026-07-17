"use server";

import { store, type GameStatus, type Player } from "@/src/lib/store";
import { checkRateLimit } from "@/src/lib/ratelimit";
import { z } from "zod";
import { headers } from "next/headers";

// Use the trusted proxy's final forwarded address for rate limiting.
async function getClientIp(): Promise<string> {
  const h = await headers();
  const xff = h.get("x-forwarded-for");
  if (xff) {
    const last = xff.split(",").at(-1)?.trim();
    if (last) return last;
  }
  return h.get("x-real-ip") ?? "127.0.0.1";
}

const CreateLobbySchema = z.object({
  hostName: z
    .string()
    .trim()
    .min(1, "Host name is required")
    .max(20, "Host name must be 20 characters or less"),
});

const JoinLobbySchema = z.object({
  code: z.string().trim().length(6, "Code must be 6 characters"),
  playerName: z
    .string()
    .trim()
    .min(1, "Player name is required")
    .max(20, "Player name must be 20 characters or less"),
});

const UpdateSettingsSchema = z
  .object({
    timerDuration: z.number().int().min(1).max(60).optional(),
    spyCount: z.number().int().min(1).max(2).optional(),
    selectedLocations: z.array(z.string()).min(1).optional(),
  })
  .strict();

type MutationResult =
  { success: true } | { success: false; reason: "not_found" | "rejected" };

async function runMutationAction(
  actionName: string,
  errorMessage: string,
  mutation: () => Promise<MutationResult>,
) {
  try {
    const result = await mutation();
    if (!result.success) {
      return {
        error:
          result.reason === "not_found" ? "Lobby not found." : errorMessage,
      };
    }
    return { success: true as const };
  } catch (error) {
    console.error(`${actionName} error:`, error);
    return { error: errorMessage };
  }
}

export async function createLobbyAction(hostName: string) {
  try {
    const ip = await getClientIp();
    const isAllowed = await checkRateLimit(ip, "create");
    if (!isAllowed) {
      return { error: "Too many requests. Please try again later." };
    }

    const result = CreateLobbySchema.safeParse({ hostName });
    if (!result.success) {
      return { error: result.error.issues[0]?.message || "Invalid input" };
    }

    const lobby = await store.createLobby(result.data.hostName);
    if (!lobby.players[0]) {
      throw new Error("Host player creation failed");
    }
    return { code: lobby.code, playerId: lobby.players[0].id };
  } catch (error) {
    console.error("createLobbyAction error:", error);
    return { error: "Failed to create lobby. Please try again." };
  }
}

export async function joinLobbyAction(code: string, playerName: string) {
  try {
    const ip = await getClientIp();
    const isAllowed = await checkRateLimit(ip, "join");
    if (!isAllowed) {
      return { error: "Too many requests. Please try again later." };
    }

    const result = JoinLobbySchema.safeParse({ code, playerName });
    if (!result.success) {
      return { error: result.error.issues[0]?.message || "Invalid input" };
    }

    const joinResult = await store.joinLobby(
      result.data.code,
      result.data.playerName,
    );
    if ("error" in joinResult) return { error: joinResult.error };
    return { code: joinResult.lobby.code, playerId: joinResult.playerId };
  } catch (error) {
    console.error("joinLobbyAction error:", error);
    return {
      error: "Failed to join lobby. Please check the code and try again.",
    };
  }
}

export async function leaveLobbyAction(code: string, playerId: string) {
  return runMutationAction("leaveLobbyAction", "Failed to leave lobby.", () =>
    store.leaveLobby(code, playerId),
  );
}

export async function kickPlayerAction(
  code: string,
  hostId: string,
  playerId: string,
) {
  return runMutationAction("kickPlayerAction", "Failed to kick player.", () =>
    store.kickPlayer(code, hostId, playerId),
  );
}

export async function startGameAction(code: string, hostId: string) {
  return runMutationAction("startGameAction", "Failed to start game.", () =>
    store.startGame(code, hostId),
  );
}

export async function resetGameAction(code: string, hostId: string) {
  return runMutationAction("resetGameAction", "Failed to reset game.", () =>
    store.resetGame(code, hostId),
  );
}

export async function promoteHostAction(
  code: string,
  hostId: string,
  newHostId: string,
) {
  return runMutationAction("promoteHostAction", "Failed to promote host.", () =>
    store.promoteHost(code, hostId, newHostId),
  );
}

export async function updateSettingsAction(
  code: string,
  hostId: string,
  settings: {
    timerDuration?: number;
    spyCount?: number;
    selectedLocations?: string[];
  },
) {
  const parsed = UpdateSettingsSchema.safeParse(settings);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid settings" };
  }

  return runMutationAction(
    "updateSettingsAction",
    "Failed to update settings.",
    () => store.updateSettings(code, hostId, parsed.data),
  );
}

export async function togglePauseAction(code: string, hostId: string) {
  return runMutationAction("togglePauseAction", "Failed to toggle pause.", () =>
    store.togglePause(code, hostId),
  );
}

export interface ClientLobbyState {
  code: string;
  players: { name: string; isHost: boolean; id: string }[];
  status: GameStatus;
  me: Player;
  location?: string;
  timerStartTime?: number;
  timerAccumulated?: number;
  isPaused: boolean;
  timerDuration: number;
  spyCount: number;
  selectedLocations: string[];
  serverTime: number;
}

export async function getLobbyStateAction(
  code: string,
  playerId: string,
): Promise<{ lobby?: ClientLobbyState; error?: string }> {
  try {
    const lobby = await store.getLobby(code);
    if (!lobby) return { error: "Lobby not found" };

    const me = lobby.players.find((p) => p.id === playerId);
    if (!me) return { error: "Player not found in lobby" };

    // Expose public player fields and only the caller's private role data.
    const clientLobby: ClientLobbyState = {
      code: lobby.code,
      players: lobby.players.map((p) => ({
        name: p.name,
        isHost: p.isHost,
        id: p.id,
      })),
      status: lobby.status,
      me: me,
      timerStartTime: lobby.timerStartTime,
      timerAccumulated: lobby.timerAccumulated,
      isPaused: lobby.isPaused,
      timerDuration: lobby.settings.timerDuration,
      spyCount: lobby.settings.spyCount,
      selectedLocations: lobby.settings.selectedLocations,
      serverTime: Date.now(),
    };

    if (lobby.status === "IN_PROGRESS") {
      // Spies must never receive the secret location.
      if (!me.isSpy) {
        clientLobby.location = lobby.location;
      }
    }

    return { lobby: clientLobby };
  } catch (error) {
    console.error("getLobbyStateAction error:", error);
    return { error: "Failed to fetch lobby state." };
  }
}

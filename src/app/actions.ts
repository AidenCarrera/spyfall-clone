"use server";

import { cookies, headers } from "next/headers";
import { z } from "zod";
import { checkRateLimit } from "@/src/lib/ratelimit";
import { store, type GameStatus } from "@/src/lib/store";
import gameData from "@/src/lib/game-data.json";
import {
  createSessionToken,
  getSessionCookieName,
  hashSessionToken,
  normalizeLobbyCode,
} from "@/src/lib/auth";

const SESSION_MAX_AGE_SECONDS = 86400;
const allLocationNames = new Set(
  Object.values(
    gameData as Record<string, { location: string; roles: string[] }[]>,
  )
    .flat()
    .map((location) => location.location),
);

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

const LobbyCodeSchema = z
  .string()
  .transform(normalizeLobbyCode)
  .pipe(z.string().regex(/^[A-Z0-9]{6}$/, "Code must be 6 characters"));

const PlayerIdSchema = z.uuid("Invalid player");

const CreateLobbySchema = z.object({
  hostName: z
    .string()
    .trim()
    .min(1, "Host name is required")
    .max(20, "Host name must be 20 characters or less"),
});

const JoinLobbySchema = z.object({
  code: LobbyCodeSchema,
  playerName: z
    .string()
    .trim()
    .min(1, "Player name is required")
    .max(20, "Player name must be 20 characters or less"),
});

const SelectedLocationsSchema = z
  .array(z.string())
  .min(1, "Select at least one location")
  .max(allLocationNames.size)
  .refine(
    (locations) => new Set(locations).size === locations.length,
    "Locations must be unique",
  )
  .refine(
    (locations) =>
      locations.every((location) => allLocationNames.has(location)),
    "Invalid location selected",
  );

const UpdateSettingsSchema = z
  .object({
    timerDuration: z.number().int().min(1).max(60).optional(),
    spyCount: z.number().int().min(1).max(2).optional(),
    selectedLocations: SelectedLocationsSchema.optional(),
  })
  .strict();

type MutationResult =
  { success: true } | { success: false; reason: "not_found" | "rejected" };

async function setSessionCookie(code: string, sessionToken: string) {
  const cookieStore = await cookies();
  cookieStore.set({
    name: getSessionCookieName(code),
    value: sessionToken,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

async function deleteSessionCookie(code: string) {
  const cookieStore = await cookies();
  cookieStore.delete(getSessionCookieName(code));
}

async function getSessionTokenHash(code: string): Promise<string | undefined> {
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName(code))?.value;
  return token ? hashSessionToken(token) : undefined;
}

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

async function runAuthenticatedMutation(
  code: string,
  actionName: string,
  errorMessage: string,
  mutation: (
    normalizedCode: string,
    sessionTokenHash: string,
  ) => Promise<MutationResult>,
) {
  const parsedCode = LobbyCodeSchema.safeParse(code);
  if (!parsedCode.success) return { error: "Invalid lobby code." };

  const sessionTokenHash = await getSessionTokenHash(parsedCode.data);
  if (!sessionTokenHash) {
    return { error: "Your lobby session is missing or expired." };
  }

  return runMutationAction(actionName, errorMessage, () =>
    mutation(parsedCode.data, sessionTokenHash),
  );
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

    const sessionToken = createSessionToken();
    const lobby = await store.createLobby(
      result.data.hostName,
      hashSessionToken(sessionToken),
    );
    await setSessionCookie(lobby.code, sessionToken);
    return { code: lobby.code };
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

    const existingSessionTokenHash = await getSessionTokenHash(
      result.data.code,
    );
    if (existingSessionTokenHash) {
      const existingSession = await store.getLobbyForSession(
        result.data.code,
        existingSessionTokenHash,
      );
      if (!("error" in existingSession)) {
        return { code: existingSession.lobby.code };
      }
    }

    const sessionToken = createSessionToken();
    const joinResult = await store.joinLobby(
      result.data.code,
      result.data.playerName,
      hashSessionToken(sessionToken),
    );
    if ("error" in joinResult) return { error: joinResult.error };

    await setSessionCookie(joinResult.lobby.code, sessionToken);
    return { code: joinResult.lobby.code };
  } catch (error) {
    console.error("joinLobbyAction error:", error);
    return {
      error: "Failed to join lobby. Please check the code and try again.",
    };
  }
}

export async function leaveLobbyAction(code: string) {
  const result = await runAuthenticatedMutation(
    code,
    "leaveLobbyAction",
    "Failed to leave lobby.",
    (normalizedCode, sessionTokenHash) =>
      store.leaveLobby(normalizedCode, sessionTokenHash),
  );

  if ("success" in result && result.success) await deleteSessionCookie(code);
  return result;
}

export async function kickPlayerAction(code: string, playerId: string) {
  const parsedPlayerId = PlayerIdSchema.safeParse(playerId);
  if (!parsedPlayerId.success) return { error: "Invalid player." };

  return runAuthenticatedMutation(
    code,
    "kickPlayerAction",
    "Failed to kick player.",
    (normalizedCode, sessionTokenHash) =>
      store.kickPlayer(normalizedCode, sessionTokenHash, parsedPlayerId.data),
  );
}

export async function startGameAction(code: string) {
  return runAuthenticatedMutation(
    code,
    "startGameAction",
    "Failed to start game.",
    (normalizedCode, sessionTokenHash) =>
      store.startGame(normalizedCode, sessionTokenHash),
  );
}

export async function resetGameAction(code: string) {
  return runAuthenticatedMutation(
    code,
    "resetGameAction",
    "Failed to reset game.",
    (normalizedCode, sessionTokenHash) =>
      store.resetGame(normalizedCode, sessionTokenHash),
  );
}

export async function promoteHostAction(code: string, newHostId: string) {
  const parsedPlayerId = PlayerIdSchema.safeParse(newHostId);
  if (!parsedPlayerId.success) return { error: "Invalid player." };

  return runAuthenticatedMutation(
    code,
    "promoteHostAction",
    "Failed to promote host.",
    (normalizedCode, sessionTokenHash) =>
      store.promoteHost(normalizedCode, sessionTokenHash, parsedPlayerId.data),
  );
}

export async function updateSettingsAction(
  code: string,
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

  return runAuthenticatedMutation(
    code,
    "updateSettingsAction",
    "Failed to update settings.",
    (normalizedCode, sessionTokenHash) =>
      store.updateSettings(normalizedCode, sessionTokenHash, parsed.data),
  );
}

export async function togglePauseAction(code: string) {
  return runAuthenticatedMutation(
    code,
    "togglePauseAction",
    "Failed to toggle pause.",
    (normalizedCode, sessionTokenHash) =>
      store.togglePause(normalizedCode, sessionTokenHash),
  );
}

interface ClientPlayer {
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

export async function getLobbyStateAction(
  code: string,
): Promise<{ lobby?: ClientLobbyState; error?: string }> {
  try {
    const parsedCode = LobbyCodeSchema.safeParse(code);
    if (!parsedCode.success) return { error: "Invalid lobby code" };

    const sessionTokenHash = await getSessionTokenHash(parsedCode.data);
    if (!sessionTokenHash) return { error: "Session not found" };

    const sessionResult = await store.getLobbyForSession(
      parsedCode.data,
      sessionTokenHash,
    );
    if ("error" in sessionResult) {
      return {
        error:
          sessionResult.error === "not_found"
            ? "Lobby not found"
            : "Player not found in lobby",
      };
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

    if (lobby.status === "IN_PROGRESS" && !me.isSpy) {
      clientLobby.location = lobby.location;
    }

    return { lobby: clientLobby };
  } catch (error) {
    console.error("getLobbyStateAction error:", error);
    return { error: "Failed to fetch lobby state." };
  }
}

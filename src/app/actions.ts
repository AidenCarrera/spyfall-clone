"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { checkRateLimit } from "@/lib/ratelimit";
import { store } from "@/lib/store";
import { ALL_LOCATION_NAMES } from "@/lib/locations";
import {
  MAX_SPIES,
  MAX_TIMER_MINUTES,
  MIN_SPIES,
  MIN_TIMER_MINUTES,
} from "@/lib/game-rules";
import { LOBBY_CODE_PATTERN, normalizeLobbyCode } from "@/lib/lobby-code";
import { createSessionToken, hashSessionToken } from "@/lib/auth";
import {
  deleteSessionCookie,
  getSessionTokenHash,
  setSessionCookie,
} from "@/lib/session";

// Identifies the caller for rate limiting. Vercel's edge network overwrites
// both headers with the real client address, so they cannot be spoofed in
// production. `x-real-ip` is preferred because it is always a single address:
// `x-forwarded-for` is a client-to-proxy list, where only the first entry is
// the originating client. Falls back to a shared bucket for local development,
// where neither header is set.
async function getClientIp(): Promise<string> {
  const h = await headers();

  const realIp = h.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  const clientIp = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (clientIp) return clientIp;

  return "127.0.0.1";
}

const LobbyCodeSchema = z
  .string()
  .transform(normalizeLobbyCode)
  .pipe(z.string().regex(LOBBY_CODE_PATTERN, "Code must be 6 characters"));

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
  .max(ALL_LOCATION_NAMES.size)
  .refine(
    (locations) => new Set(locations).size === locations.length,
    "Locations must be unique",
  )
  .refine(
    (locations) =>
      locations.every((location) => ALL_LOCATION_NAMES.has(location)),
    "Invalid location selected",
  );

const UpdateSettingsSchema = z
  .object({
    timerDuration: z
      .number()
      .int()
      .min(MIN_TIMER_MINUTES)
      .max(MAX_TIMER_MINUTES)
      .optional(),
    spyCount: z.number().int().min(MIN_SPIES).max(MAX_SPIES).optional(),
    selectedLocations: SelectedLocationsSchema.optional(),
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

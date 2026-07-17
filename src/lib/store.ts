import { redis } from "./redis";
import gameData from "./game-data.json";

export interface Player {
  id: string;
  name: string;
  isHost: boolean;
  role?: string;
  isSpy?: boolean;
}

export type GameStatus = "LOBBY" | "IN_PROGRESS";

export interface GameSettings {
  selectedLocations: string[];
  timerDuration: number; // in minutes
  spyCount: number;
}

export interface Lobby {
  code: string;
  players: Player[];
  status: GameStatus;
  location?: string;
  // Server timestamp for the start of the current running timer segment.
  timerStartTime?: number;
  // Elapsed milliseconds accumulated before the current timer segment.
  timerAccumulated?: number;
  isPaused: boolean;
  settings: GameSettings;
}

function generateCode(length: number = 6): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

const LOBBY_TTL = 86400; // 24 hours in seconds
const MAX_PLAYERS = 12;

const getLobbyKey = (code: string) => `lobby:${code.toUpperCase()}`;

const saveLobby = async (code: string, lobby: Lobby) => {
  await redis.set(getLobbyKey(code), lobby, { ex: LOBBY_TTL });
};

const getLobby = async (code: string): Promise<Lobby | undefined> => {
  // Reading an active lobby refreshes its expiration window.
  const lobby = await redis.getex<Lobby>(getLobbyKey(code), {
    ex: LOBBY_TTL,
  });
  return lobby || undefined;
};

type UpdateResult =
  | { success: false; reason: "not_found" }
  | { success: false; reason: "rejected" }
  | { success: true; lobby: Lobby };

const updateLobby = async (
  code: string,
  updater: (lobby: Lobby) => void | boolean | Promise<void | boolean>,
): Promise<UpdateResult> => {
  // Mutations use last-write-wins persistence, not an atomic Redis transaction.
  const lobby = await getLobby(code);
  if (!lobby) return { success: false, reason: "not_found" };

  const result = await updater(lobby);
  if (result === false) return { success: false, reason: "rejected" };

  if (lobby.players.length === 0) {
    await redis.del(getLobbyKey(code));
  } else {
    await saveLobby(code, lobby);
  }

  return { success: true, lobby };
};

export const store = {
  createLobby: async (hostName: string): Promise<Lobby> => {
    const host: Player = {
      id: crypto.randomUUID(),
      name: hostName,
      isHost: true,
    };

    // Generate a unique lobby code using an atomic Redis "set if not exists".
    // Retry if the generated code is already taken.
    let lobby: Lobby | null = null;
    while (!lobby) {
      const code = generateCode();
      const candidate: Lobby = {
        code,
        players: [host],
        status: "LOBBY",
        isPaused: false,
        settings: {
          selectedLocations: gameData.spyfall1.map((l) => l.location),
          timerDuration: 8,
          spyCount: 1,
        },
      };

      const result = await redis.set(getLobbyKey(code), candidate, {
        ex: LOBBY_TTL,
        nx: true,
      });

      if (result === "OK") {
        lobby = candidate;
      }
    }

    return lobby;
  },

  joinLobby: async (
    code: string,
    playerName: string,
  ): Promise<{ lobby: Lobby; playerId: string } | { error: string }> => {
    let playerId: string | undefined;
    let joinError: string | undefined;

    const result = await updateLobby(code, (lobby) => {
      if (lobby.status !== "LOBBY") {
        joinError = "Game already in progress";
        return false;
      }

      if (lobby.players.length >= MAX_PLAYERS) {
        joinError = "Lobby is full";
        return false;
      }

      if (
        lobby.players.some(
          (p) => p.name.toLowerCase() === playerName.toLowerCase(),
        )
      ) {
        joinError = "Name already taken in this lobby";
        return false;
      }

      const player: Player = {
        id: crypto.randomUUID(),
        name: playerName,
        isHost: false,
      };

      lobby.players.push(player);
      playerId = player.id;
    });

    if (!result.success) {
      if (result.reason === "not_found") return { error: "Lobby not found" };
      return { error: joinError || "Unable to join lobby" };
    }

    if (!playerId) return { error: "Failed to create player" };
    return { lobby: result.lobby, playerId };
  },

  getLobby,

  leaveLobby: async (code: string, playerId: string) => {
    return updateLobby(code, (lobby) => {
      lobby.players = lobby.players.filter((p) => p.id !== playerId);

      const hostLeft = !lobby.players.some((p) => p.isHost);
      if (hostLeft && lobby.players[0]) {
        lobby.players[0].isHost = true;
      }
    });
  },

  startGame: async (code: string, hostId: string) => {
    return updateLobby(code, (lobby) => {
      const caller = lobby.players.find((p) => p.id === hostId);
      if (!caller?.isHost) return false;

      let availableLocations = [...lobby.settings.selectedLocations];

      if (availableLocations.length === 0) {
        availableLocations = gameData.spyfall1.map((l) => l.location);
      }

      const randomLocIndex = Math.floor(
        Math.random() * availableLocations.length,
      );
      const selectedLocationName = availableLocations[randomLocIndex];

      const allLocations = Object.values(
        gameData as Record<string, { location: string; roles: string[] }[]>,
      ).flat();
      const selectedLocation = allLocations.find(
        (l) => l.location === selectedLocationName,
      );

      if (!selectedLocation) {
        console.error(
          "Selected location not found in game data:",
          selectedLocationName,
        );
        return false;
      }

      lobby.location = selectedLocation.location;
      lobby.status = "IN_PROGRESS";

      lobby.timerStartTime = Date.now();
      lobby.timerAccumulated = 0;
      lobby.isPaused = false;

      const roles = [...selectedLocation.roles];
      const shuffledPlayers = [...lobby.players];
      for (let i = shuffledPlayers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = shuffledPlayers[i]!;
        shuffledPlayers[i] = shuffledPlayers[j]!;
        shuffledPlayers[j] = temp;
      }

      let spiesAssigned = 0;
      const spyCount = lobby.settings.spyCount;
      const playerMap = new Map(lobby.players.map((p) => [p.id, p]));

      shuffledPlayers.forEach((player, index) => {
        const originalPlayer = playerMap.get(player.id)!;

        if (spiesAssigned < spyCount) {
          originalPlayer.isSpy = true;
          originalPlayer.role = undefined;
          spiesAssigned++;
        } else {
          originalPlayer.isSpy = false;
          // Reuse role names when players outnumber the available roles.
          const roleIndex = index % roles.length;
          originalPlayer.role = roles[roleIndex];
        }
      });
    });
  },

  togglePause: async (code: string, hostId: string) => {
    return updateLobby(code, (lobby) => {
      const caller = lobby.players.find((p) => p.id === hostId);
      if (!caller?.isHost) return false;

      if (lobby.status !== "IN_PROGRESS") return false;

      if (lobby.isPaused) {
        lobby.timerStartTime = Date.now();
        lobby.isPaused = false;
      } else {
        const now = Date.now();
        lobby.timerAccumulated =
          (lobby.timerAccumulated || 0) + (now - (lobby.timerStartTime || now));
        lobby.timerStartTime = undefined;
        lobby.isPaused = true;
      }
    });
  },

  resetGame: async (code: string, hostId: string) => {
    return updateLobby(code, (lobby) => {
      const caller = lobby.players.find((p) => p.id === hostId);
      if (!caller?.isHost) return false;

      lobby.status = "LOBBY";
      lobby.location = undefined;
      lobby.timerStartTime = undefined;
      lobby.timerAccumulated = undefined;
      lobby.isPaused = false;
      lobby.players.forEach((p) => {
        p.role = undefined;
        p.isSpy = undefined;
      });
    });
  },

  promoteHost: async (code: string, hostId: string, newHostId: string) => {
    return updateLobby(code, (lobby) => {
      const caller = lobby.players.find((p) => p.id === hostId);
      if (!caller?.isHost) return false;

      const newHost = lobby.players.find((p) => p.id === newHostId);
      if (!newHost) return false;

      lobby.players.forEach((p) => (p.isHost = false));

      newHost.isHost = true;
    });
  },

  kickPlayer: async (code: string, hostId: string, playerId: string) => {
    return updateLobby(code, (lobby) => {
      const caller = lobby.players.find((p) => p.id === hostId);
      if (!caller?.isHost) return false;

      lobby.players = lobby.players.filter((p) => p.id !== playerId);
    });
  },

  updateSettings: async (
    code: string,
    hostId: string,
    settings: Partial<GameSettings>,
  ) => {
    return updateLobby(code, (lobby) => {
      const caller = lobby.players.find((p) => p.id === hostId);
      if (!caller?.isHost) return false;

      lobby.settings = { ...lobby.settings, ...settings };
    });
  },
};

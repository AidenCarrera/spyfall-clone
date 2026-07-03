import { redis } from "./redis";
import gameData from "./game-data.json";

export type Role = string;
export type Location = string;

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
  timerEnabled: boolean;
  timerDuration: number; // in minutes
  spyCount: number;
}

export interface Lobby {
  code: string;
  players: Player[];
  status: GameStatus;
  location?: string;
  timerStartTime?: number;
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

export const LOBBY_TTL = 86400; // 24 hours in seconds

const getLobbyKey = (code: string) => `lobby:${code.toUpperCase()}`;

const saveLobby = async (code: string, lobby: Lobby) => {
  await redis.set(getLobbyKey(code), lobby, { ex: LOBBY_TTL });
};

export type UpdateResult =
  | { success: false; reason: "not_found" }
  | { success: false; reason: "rejected" }
  | { success: true; lobby: Lobby };

const updateLobby = async (
  code: string,
  updater: (lobby: Lobby) => void | boolean | Promise<void | boolean>,
): Promise<UpdateResult> => {
  const lobby = await store.getLobby(code);
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

export interface Store {
  createLobby: (hostName: string) => Promise<Lobby>;
  joinLobby: (
    code: string,
    playerName: string,
  ) => Promise<{ lobby?: Lobby; error?: string; playerId?: string }>;
  getLobby: (code: string) => Promise<Lobby | undefined>;
  leaveLobby: (code: string, playerId: string) => Promise<void>;
  startGame: (code: string, hostId: string) => Promise<void>;
  togglePause: (code: string, hostId: string) => Promise<void>;
  resetGame: (code: string, hostId: string) => Promise<void>;
  promoteHost: (
    code: string,
    hostId: string,
    newHostId: string,
  ) => Promise<void>;
  kickPlayer: (code: string, hostId: string, playerId: string) => Promise<void>;
  updateSettings: (
    code: string,
    hostId: string,
    settings: Partial<GameSettings>,
  ) => Promise<void>;
}

export const store: Store = {
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
          timerEnabled: false,
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
  ): Promise<{ lobby?: Lobby; error?: string; playerId?: string }> => {
    let playerId: string | undefined;
    let joinError: string | undefined;

    const result = await updateLobby(code, (lobby) => {
      if (lobby.status !== "LOBBY") {
        joinError = "Game already in progress";
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
      return { error: joinError };
    }

    return { lobby: result.lobby, playerId };
  },

  getLobby: async (code: string): Promise<Lobby | undefined> => {
    const lobby = await redis.getex<Lobby>(getLobbyKey(code), {
      ex: LOBBY_TTL,
    });
    return lobby || undefined;
  },

  leaveLobby: async (code: string, playerId: string) => {
    await updateLobby(code, (lobby) => {
      lobby.players = lobby.players.filter((p) => p.id !== playerId);

      // If host leaves, assign new host
      const hostLeft = !lobby.players.some((p) => p.isHost);
      if (hostLeft && lobby.players[0]) {
        lobby.players[0].isHost = true;
      }
    });
  },

  startGame: async (code: string, hostId: string) => {
    await updateLobby(code, (lobby) => {
      const caller = lobby.players.find((p) => p.id === hostId);
      if (!caller?.isHost) return false;

      // Select random location from selectedLocations
      let availableLocations = [...lobby.settings.selectedLocations];

      // Fallback to default locations
      if (availableLocations.length === 0) {
        availableLocations = gameData.spyfall1.map((l) => l.location);
      }

      const randomLocIndex = Math.floor(
        Math.random() * availableLocations.length,
      );
      const selectedLocationName = availableLocations[randomLocIndex];

      // Find the location object to get roles
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

      // Timer setup
      lobby.timerStartTime = Date.now();
      lobby.timerAccumulated = 0;
      lobby.isPaused = false;

      // Assign roles
      const roles = [...selectedLocation.roles];
      // Shuffle players
      const shuffledPlayers = [...lobby.players];
      for (let i = shuffledPlayers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = shuffledPlayers[i]!;
        shuffledPlayers[i] = shuffledPlayers[j]!;
        shuffledPlayers[j] = temp;
      }

      // Assign spies
      let spiesAssigned = 0;
      const spyCount = lobby.settings.spyCount;
      const playerMap = new Map(lobby.players.map((p) => [p.id, p]));

      shuffledPlayers.forEach((player, index) => {
        const originalPlayer = playerMap.get(player.id)!;

        if (spiesAssigned < spyCount) {
          originalPlayer.isSpy = true;
          originalPlayer.role = "Spy";
          spiesAssigned++;
        } else {
          originalPlayer.isSpy = false;
          // Assign roles, cycling through available roles if needed
          const roleIndex = index % roles.length;
          originalPlayer.role = roles[roleIndex];
        }
      });
    });
  },

  togglePause: async (code: string, hostId: string) => {
    await updateLobby(code, (lobby) => {
      const caller = lobby.players.find((p) => p.id === hostId);
      if (!caller?.isHost) return false;

      if (lobby.status !== "IN_PROGRESS") return false;

      if (lobby.isPaused) {
        // Resume
        lobby.timerStartTime = Date.now();
        lobby.isPaused = false;
      } else {
        // Pause
        const now = Date.now();
        lobby.timerAccumulated =
          (lobby.timerAccumulated || 0) + (now - (lobby.timerStartTime || now));
        lobby.timerStartTime = undefined;
        lobby.isPaused = true;
      }
    });
  },

  resetGame: async (code: string, hostId: string) => {
    await updateLobby(code, (lobby) => {
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
    await updateLobby(code, (lobby) => {
      const caller = lobby.players.find((p) => p.id === hostId);
      if (!caller?.isHost) return false;

      const newHost = lobby.players.find((p) => p.id === newHostId);
      if (!newHost) return false;

      // Remove host status from all players
      lobby.players.forEach((p) => (p.isHost = false));

      // Assign new host
      newHost.isHost = true;
    });
  },

  kickPlayer: async (code: string, hostId: string, playerId: string) => {
    await updateLobby(code, (lobby) => {
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
    await updateLobby(code, (lobby) => {
      const caller = lobby.players.find((p) => p.id === hostId);
      if (!caller?.isHost) return false;

      lobby.settings = { ...lobby.settings, ...settings };
    });
  },
};

import { redis } from './redis';
import gameData from './game-data.json';

export type Role = string;
export type Location = string;

export interface Player {
  id: string;
  name: string;
  isHost: boolean;
  role?: string;
  isSpy?: boolean;
}

export type GameStatus = 'LOBBY' | 'IN_PROGRESS' | 'FINISHED';

export interface GameSettings {
  locationSets: string[];
  timerEnabled: boolean;
  timerDuration: number; // in minutes
  spyCount: number;
}

export interface Lobby {
  code: string;
  players: Player[];
  status: GameStatus;
  location?: string;
  timerStartTime?: number; // When the current running segment started
  timerAccumulated?: number; // Time elapsed in previous segments
  isPaused: boolean;
  settings: GameSettings;
  lastActivity: number; // for cleanup
}

// Helper to generate a random code
function generateCode(length: number = 6): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export const LOBBY_TTL = 86400; // 24 hours in seconds

export const store = {
  createLobby: async (hostName: string): Promise<Lobby> => {
    let code = generateCode();
    while (await redis.exists(`lobby:${code}`)) {
      code = generateCode();
    }

    const host: Player = {
      id: crypto.randomUUID(),
      name: hostName,
      isHost: true,
    };

    const lobby: Lobby = {
      code,
      players: [host],
      status: 'LOBBY',
      isPaused: false,
      settings: {
        locationSets: ['spyfall1'],
        timerEnabled: false,
        timerDuration: 8,
        spyCount: 1,
      },
      lastActivity: Date.now(),
    };

    await redis.set(`lobby:${code}`, lobby, { ex: LOBBY_TTL });
    return lobby;
  },

  joinLobby: async (code: string, playerName: string): Promise<{ lobby?: Lobby; error?: string; playerId?: string }> => {
    const lobby = await store.getLobby(code);
    if (!lobby) {
      return { error: 'Lobby not found' };
    }

    if (lobby.status !== 'LOBBY') {
      return { error: 'Game already in progress' };
    }

    if (lobby.players.some((p) => p.name.toLowerCase() === playerName.toLowerCase())) {
      return { error: 'Name already taken in this lobby' };
    }

    const player: Player = {
      id: crypto.randomUUID(),
      name: playerName,
      isHost: false,
    };

    lobby.players.push(player);
    lobby.lastActivity = Date.now();

    await redis.set(`lobby:${code}`, lobby, { ex: LOBBY_TTL });
    return { lobby, playerId: player.id };
  },

  getLobby: async (code: string): Promise<Lobby | undefined> => {
    const lobby = await redis.get<Lobby>(`lobby:${code.toUpperCase()}`);
    return lobby || undefined;
  },

  leaveLobby: async (code: string, playerId: string) => {
    const lobby = await store.getLobby(code);
    if (!lobby) return;

    lobby.players = lobby.players.filter((p) => p.id !== playerId);

    // If host leaves, assign new host or delete lobby if empty
    if (lobby.players.length === 0) {
      await redis.del(`lobby:${code}`);
    } else {
      const hostLeft = !lobby.players.some(p => p.isHost);
      if (hostLeft) {
        lobby.players[0].isHost = true;
      }
      lobby.lastActivity = Date.now();
      await redis.set(`lobby:${code}`, lobby, { ex: LOBBY_TTL });
    }
  },

  startGame: async (code: string) => {
    const lobby = await store.getLobby(code);
    if (!lobby) return;

    // Select random location
    const validSets = lobby.settings.locationSets.filter(set => set in gameData);
    const typedGameData = gameData as Record<string, { location: string; roles: string[] }[]>;
    const locations = validSets.flatMap(set => typedGameData[set]);
    
    if (locations.length === 0) {
        // Fallback to spyfall1 if something goes wrong
        locations.push(...gameData.spyfall1);
    }

    const randomLocIndex = Math.floor(Math.random() * locations.length);
    const selectedLocation = locations[randomLocIndex];

    lobby.location = selectedLocation.location;
    lobby.status = 'IN_PROGRESS';

    // Timer setup
    lobby.timerStartTime = Date.now();
    lobby.timerAccumulated = 0;
    lobby.isPaused = false;

    // Assign roles
    const roles = [...selectedLocation.roles];
    // Shuffle players
    const shuffledPlayers = [...lobby.players].sort(() => Math.random() - 0.5);

    // Assign spies
    let spiesAssigned = 0;
    const spyCount = lobby.settings.spyCount;

    shuffledPlayers.forEach((player, index) => {
      // Find original player object to update
      const originalPlayer = lobby.players.find(p => p.id === player.id);
      if (!originalPlayer) return;

      if (spiesAssigned < spyCount) {
        originalPlayer.isSpy = true;
        originalPlayer.role = 'Spy';
        spiesAssigned++;
      } else {
        originalPlayer.isSpy = false;
        // Assign random role from list, loop if fewer roles than players
        const roleIndex = index % roles.length;
        originalPlayer.role = roles[roleIndex];
      }
    });

    lobby.lastActivity = Date.now();
    await redis.set(`lobby:${code}`, lobby, { ex: LOBBY_TTL });
  },

  togglePause: async (code: string) => {
    const lobby = await store.getLobby(code);
    if (!lobby || lobby.status !== 'IN_PROGRESS') return;

    if (lobby.isPaused) {
      // Resume
      lobby.timerStartTime = Date.now();
      lobby.isPaused = false;
    } else {
      // Pause
      const now = Date.now();
      lobby.timerAccumulated = (lobby.timerAccumulated || 0) + (now - (lobby.timerStartTime || now));
      lobby.timerStartTime = undefined;
      lobby.isPaused = true;
    }

    lobby.lastActivity = Date.now();
    await redis.set(`lobby:${code}`, lobby, { ex: LOBBY_TTL });
  },

  endGame: async (code: string) => {
    const lobby = await store.getLobby(code);
    if (!lobby) return;

    lobby.status = 'FINISHED';
    lobby.location = undefined;
    lobby.timerStartTime = undefined;
    lobby.timerAccumulated = undefined;
    lobby.isPaused = false;
    lobby.players.forEach(p => {
      p.role = undefined;
      p.isSpy = undefined;
    });

    lobby.lastActivity = Date.now();
    await redis.set(`lobby:${code}`, lobby, { ex: LOBBY_TTL });
  },

  resetGame: async (code: string) => {
    const lobby = await store.getLobby(code);
    if (!lobby) return;

    lobby.status = 'LOBBY';
    lobby.location = undefined;
    lobby.timerStartTime = undefined;
    lobby.timerAccumulated = undefined;
    lobby.isPaused = false;
    lobby.players.forEach(p => {
      p.role = undefined;
      p.isSpy = undefined;
    });

    lobby.lastActivity = Date.now();
    await redis.set(`lobby:${code}`, lobby, { ex: LOBBY_TTL });
  },

  promoteHost: async (code: string, newHostId: string) => {
    const lobby = await store.getLobby(code);
    if (!lobby) return;

    const newHost = lobby.players.find(p => p.id === newHostId);
    if (!newHost) return;

    // Remove host status from all players
    lobby.players.forEach(p => p.isHost = false);

    // Assign new host
    newHost.isHost = true;

    lobby.lastActivity = Date.now();
    await redis.set(`lobby:${code}`, lobby, { ex: LOBBY_TTL });
  },

  kickPlayer: async (code: string, playerId: string) => {
    const lobby = await store.getLobby(code);
    if (!lobby) return;

    lobby.players = lobby.players.filter((p) => p.id !== playerId);

    // If lobby becomes empty, delete it
    if (lobby.players.length === 0) {
      await redis.del(`lobby:${code}`);
    } else {
      lobby.lastActivity = Date.now();
      await redis.set(`lobby:${code}`, lobby, { ex: LOBBY_TTL });
    }
  },

  updateSettings: async (code: string, settings: Partial<GameSettings>) => {
    const lobby = await store.getLobby(code);
    if (!lobby) return;

    lobby.settings = { ...lobby.settings, ...settings };

    lobby.lastActivity = Date.now();
    await redis.set(`lobby:${code}`, lobby, { ex: LOBBY_TTL });
  }
};

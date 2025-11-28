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
  useSpyfall2: boolean;
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

// Global store to persist across dev reloads
const globalStore = global as unknown as {
  spyfallLobbies: Map<string, Lobby>;
};

if (!globalStore.spyfallLobbies) {
  globalStore.spyfallLobbies = new Map();
}

const lobbies = globalStore.spyfallLobbies;

// Helper to generate a random code
function generateCode(length: number = 6): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export const store = {
  createLobby: (hostName: string): Lobby => {
    let code = generateCode();
    while (lobbies.has(code)) {
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
        useSpyfall2: false,
        timerEnabled: false,
        timerDuration: 8,
        spyCount: 1,
      },
      lastActivity: Date.now(),
    };

    lobbies.set(code, lobby);
    return lobby;
  },

  joinLobby: (code: string, playerName: string): { lobby?: Lobby; error?: string; playerId?: string } => {
    const lobby = lobbies.get(code.toUpperCase());
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
    return { lobby, playerId: player.id };
  },

  getLobby: (code: string): Lobby | undefined => {
    const lobby = lobbies.get(code.toUpperCase());
    if (lobby) {
      lobby.lastActivity = Date.now();
    }
    return lobby;
  },

  leaveLobby: (code: string, playerId: string) => {
    const lobby = lobbies.get(code.toUpperCase());
    if (!lobby) return;

    lobby.players = lobby.players.filter((p) => p.id !== playerId);

    // If host leaves, assign new host or delete lobby if empty
    if (lobby.players.length === 0) {
      lobbies.delete(code);
    } else {
      const hostLeft = !lobby.players.some(p => p.isHost);
      if (hostLeft) {
        lobby.players[0].isHost = true;
      }
    }
  },

  startGame: (code: string) => {
    const lobby = lobbies.get(code.toUpperCase());
    if (!lobby) return;

    // Select random location
    const locations = gameData.spyfall1; // Extend logic for Spyfall 2 later if needed
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
        // Assign random role from list, loop if fewer roles than players (unlikely in standard Spyfall but possible)
        const roleIndex = index % roles.length;
        originalPlayer.role = roles[roleIndex];
      }
    });
  },

  togglePause: (code: string) => {
    const lobby = lobbies.get(code.toUpperCase());
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
  },

  endGame: (code: string) => {
    const lobby = lobbies.get(code.toUpperCase());
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
  },

  resetGame: (code: string) => {
    const lobby = lobbies.get(code.toUpperCase());
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
  },

  promoteHost: (code: string, newHostId: string) => {
    const lobby = lobbies.get(code.toUpperCase());
    if (!lobby) return;

    const newHost = lobby.players.find(p => p.id === newHostId);
    if (!newHost) return;

    // Remove host status from all players
    lobby.players.forEach(p => p.isHost = false);

    // Assign new host
    newHost.isHost = true;
  },

  updateSettings: (code: string, settings: Partial<GameSettings>) => {
    const lobby = lobbies.get(code.toUpperCase());
    if (!lobby) return;

    lobby.settings = { ...lobby.settings, ...settings };
  }
};

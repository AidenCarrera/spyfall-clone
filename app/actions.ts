'use server';

import { store, Lobby, Player } from './lib/store';

export async function createLobbyAction(hostName: string) {
    if (!hostName) return { error: 'Host name is required' };
    const lobby = store.createLobby(hostName);
    // Return the host's player ID (it's the first player)
    return { code: lobby.code, playerId: lobby.players[0].id };
}

export async function joinLobbyAction(code: string, playerName: string) {
    if (!code || !playerName) return { error: 'Code and name are required' };
    const result = store.joinLobby(code, playerName);
    if (result.error) return { error: result.error };
    return { code: result.lobby!.code, playerId: result.playerId };
}

export async function leaveLobbyAction(code: string, playerId: string) {
    store.leaveLobby(code, playerId);
    return { success: true };
}

export async function kickPlayerAction(code: string, playerId: string) {
    store.leaveLobby(code, playerId);
    return { success: true };
}

export async function startGameAction(code: string) {
    store.startGame(code);
    return { success: true };
}

export async function resetGameAction(code: string) {
    store.resetGame(code);
    return { success: true };
}

export async function promoteHostAction(code: string, newHostId: string) {
    store.promoteHost(code, newHostId);
    return { success: true };
}

export async function updateSettingsAction(code: string, settings: { timerDuration?: number; spyCount?: number }) {
    store.updateSettings(code, settings);
    return { success: true };
}

export async function togglePauseAction(code: string) {
    store.togglePause(code);
    return { success: true };
}

// Sanitized lobby type for frontend
export interface ClientLobbyState {
    code: string;
    players: { name: string; isHost: boolean; id: string }[];
    status: string;
    me: Player | undefined;
    location?: string;
    timerStartTime?: number;
    timerAccumulated?: number;
    isPaused?: boolean;
    timerDuration?: number;
    spyCount?: number;
    isSpy?: boolean;
}

export async function getLobbyStateAction(code: string, playerId: string): Promise<{ lobby?: ClientLobbyState; error?: string }> {
    const lobby = store.getLobby(code);
    if (!lobby) return { error: 'Lobby not found' };

    const me = lobby.players.find((p) => p.id === playerId);
    if (!me) return { error: 'Player not found in lobby' };

    // Sanitize data
    const clientLobby: ClientLobbyState = {
        code: lobby.code,
        players: lobby.players.map(p => ({ name: p.name, isHost: p.isHost, id: p.id })),
        status: lobby.status,
        me: me,
        timerStartTime: lobby.timerStartTime,
        timerAccumulated: lobby.timerAccumulated,
        isPaused: lobby.isPaused,
        timerDuration: lobby.settings.timerDuration,
        spyCount: lobby.settings.spyCount,
    };

    if (lobby.status === 'IN_PROGRESS') {
        if (me.isSpy) {
            clientLobby.isSpy = true;
            // Spy doesn't see location
        } else {
            clientLobby.isSpy = false;
            clientLobby.location = lobby.location;
        }
    }

    return { lobby: clientLobby };
}
